"""This file holds the logic for generating/updating the changelog for a release.
Ref: https://keepachangelog.com/en/1.1.0/
"""

import logging.config
import re
from datetime import datetime
from enum import Enum
from pathlib import Path

from packaging import version

config_path = Path.cwd() / "scripts" / "logging_config.ini"

logging.config.fileConfig(config_path)

DELIMITER = "---\n"


class ReleaseLog:
    """This class represents one record of the potentially
    (many) releases in a changelog"""

    class Type(Enum):
        """This enum represents the type of release"""

        PENDING = 0
        RELEASED = 1

    class ParsePhase(Enum):
        """This enum represents the phase of parsing the changelog"""

        HEADER = 0
        ADDED = 1
        FIXED = 2
        CHANGED = 3
        REMOVED = 4

    _ADDED = "### Added"
    _FIXED = "### Fixed"
    _CHANGED = "### Changed"
    _REMOVED = "### Removed"
    _UNRELEASED = "## [Unreleased]"

    def __init__(self, release_version=None, date=None) -> None:
        self.version = release_version
        self.date = date
        self.added_items = []
        self.fixed_items = []
        self.changed_items = []
        self.removed_items = []
        self.type = self.Type.PENDING if not self.version else self.Type.RELEASED
        self.parse_phase = self.ParsePhase.HEADER

    def __str__(self) -> str:

        # Get a printable version to print into our changelog
        sections = [
            (self._ADDED, self.added_items),
            (self._FIXED, self.fixed_items),
            (self._CHANGED, self.changed_items),
            (self._REMOVED, self.removed_items),
        ]

        header = (
            self._UNRELEASED
            if self.type == self.Type.PENDING
            else f"## [{self.version}]{' - ' + self.date if self.date else ''}"
        )

        return_text = f"{header}\n\n"
        is_pending = self.type == self.Type.PENDING

        for title, items in sections:
            if is_pending or items:
                return_text += f"{title}\n\n"
            if items:
                return_text += "\n".join(items) + "\n\n"

        return return_text

    def parse(self, lines: str) -> None:
        """Parses the lines collected from the changelog
        into a release log

        Args:
            lines (str): lines of string from changelog
        """
        for line in lines:
            if line == "":
                continue

            line = line.strip()

            if line == self._ADDED:
                self.parse_phase = self.ParsePhase.ADDED
            elif line == self._FIXED:
                self.parse_phase = self.ParsePhase.FIXED
            elif line == self._CHANGED:
                self.parse_phase = self.ParsePhase.CHANGED
            elif line == self._REMOVED:
                self.parse_phase = self.ParsePhase.REMOVED
            else:
                if self.parse_phase == self.ParsePhase.ADDED:
                    self.added_items.append(line)
                elif self.parse_phase == self.ParsePhase.FIXED:
                    self.fixed_items.append(line)
                elif self.parse_phase == self.ParsePhase.CHANGED:
                    self.changed_items.append(line)
                elif self.parse_phase == self.ParsePhase.REMOVED:
                    self.removed_items.append(line)


class Changelog:
    """This class represents a list of release logs that are present
    in our changelog file"""

    _FILE_HEADER = (
        "# Changelog\n\n"
        "All notable changes to this project will be documented in this file.\n\n"
        "The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),\n"
        "and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html)."
        "\n\n"
    )

    def __init__(self, path: Path) -> None:
        """Called when changelog is created

        Args:
            path (Path): path to changelog file
        """
        self.file_path = path
        self.releases = []

        # Load the changelog file
        lines = self.load_file(path)
        self.parse_file(lines)

    def load_file(self, path: Path) -> list[str] | None:
        """Attempt to load a file from the path

        Args:
            path (Path): path to changelog file

        Returns:
            list[str] | None: lines of the file if it exists, otherwise None
        """
        if not path.exists():
            logging.error(f"Changelog file not found at {path}")
            return None

        with open(path, "r", encoding="UTF-8") as file:
            lines = file.readlines()
        return lines

    def parse_file(self, lines: list) -> None:
        """Parses the lines from the changelog file into release logs

        Args:
            lines (list): lines of string from changelog file
        """

        def create_release(
            curr_release: list, curr_version: str, curr_release_date: str
        ) -> None:
            if curr_release != []:
                # Handle unreleased case
                curr_version = (
                    None
                    if curr_version == "Unreleased"
                    else version.parse(curr_version)
                )
                release = ReleaseLog(curr_version, curr_release_date)
                release.parse(curr_release)
                self.releases.append(release)

        # Loop through all lines in data and try to match data
        curr_release = []
        start_logging = False

        curr_version = None
        curr_release_date = None

        for line in lines:
            # Break so we do not hit diff text
            if line == DELIMITER:
                break

            # Cryptic looking regex to match our version and release date
            version_pattern = re.compile(r"^## \[(.*)\](?: - (\d{4}-\d{2}-\d{2}))?")
            match = version_pattern.match(line)
            if match:
                # Found our first version, we should start logging
                start_logging = True
                # Update previous release
                if curr_version is not None:
                    create_release(curr_release, curr_version, curr_release_date)

                # Then update curr version with the new version and data
                curr_version = match.group(1)
                curr_release_date = match.group(2) if match.group(2) else None
                # Reset curr release details
                curr_release = []

            if start_logging:
                curr_release.append(line.strip())

        # Then add last entry
        if curr_version is not None:
            create_release(curr_release, curr_version, curr_release_date)

    def save_file(self) -> None:
        """Saves the changelog to the file specified by self.file_path"""
        file_text = self._FILE_HEADER
        for release in self.releases:
            file_text += str(release)
        file_text += DELIMITER
        for diff_text in self.format_diff_text():
            file_text += diff_text + "\n"
        with open(self.file_path, "w", encoding="UTF-8") as file:
            file.write(file_text)

    def format_diff_text(self):
        """This text is shown at the bottom of the changelog to show
        changes among tags"""
        diff_text = []
        reversed_releases = list(reversed(self.releases))
        for i, release in enumerate(reversed_releases):
            # I will hardcode it to this repository for now, probably should
            # read this from some .env variable
            # First release
            if i == 0:
                if release.version is not None:  # First release
                    diff_text.append(
                        f"[{release.version}]: https://github.com/isaacchunn/wanderers/releases/tag/v{release.version}"  # pylint: disable=line-too-long
                    )
            else:
                # Check to next release to see if we are at the last release
                if i + 1 == len(reversed_releases):
                    # This is the unreleased section, so we should get the
                    # difference between this release and the HEAD of the repo
                    diff_text.append(
                        f"[unreleased]: https://github.com/isaacchunn/wanderers/compare/"
                        f"v{reversed_releases[i-1].version}...HEAD"
                    )
                else:
                    # This is a valid release so get the difference in tags
                    # between this release and the previous release
                    diff_text.append(
                        f"[{reversed_releases[i].version}]: https://github.com/isaacchunn/wanderers/compare/"  # pylint: disable=line-too-long
                        f"v{reversed_releases[i-1].version}...v{reversed_releases[i].version}"
                    )
        return list(reversed(diff_text))

    def release_latest(
        self, version_to_release: str, date_of_release: datetime
    ) -> None:
        """This function converts the unreleased section into a
        release and appends another unreleased section for usage"""
        # Get the latest release
        latest_release = self.releases[0]
        version_to_release = version.parse(version_to_release)

        # Check if the version to release is greater than the previous release
        if len(self.releases) > 1 and self.releases[1].version:
            if version_to_release <= self.releases[1].version:
                logging.error(
                    "Unable to release the latest version as it is not greater "
                    "than the previous version"
                )
                return
        # Ensure the latest release is pending
        if latest_release.type != ReleaseLog.Type.PENDING:
            logging.error(
                "Unable to release the latest version as it "
                "is already released. Check the changelog file for errors!"
            )
            return

        # Update latest release to be released
        latest_release.type = ReleaseLog.Type.RELEASED
        latest_release.version = version_to_release
        latest_release.date = date_of_release

        # Add a new unreleased section
        self.releases.insert(0, ReleaseLog())
