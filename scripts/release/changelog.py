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

    def __init__(self, version=None, date=None) -> None:
        self.version = version
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
        "and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).\n\n"
    )

    def __init__(self, path: Path) -> None:
        self.file_path = path
        self.releases = []

        # Load the changelog file
        lines = self.load_file(path)
        self.parse_file(lines)

    def load_file(self, path: Path):
        if not path.exists():
            logging.error(f"Changelog file not found at {path}")
            return

        with open(path, "r", encoding="UTF-8") as file:
            lines = file.readlines()
        return lines

    def parse_file(self, lines: list) -> None:
        def create_release(
            curr_release: list, curr_version: str, curr_release_date: str
        ) -> None:
            if curr_release != []:
                # Handle unreleased case
                if curr_version == "Unreleased":
                    curr_version = None
                release = ReleaseLog(curr_version, curr_release_date)
                release.parse(curr_release)
                self.releases.append(release)

        # Loop through all lines in data and try to match data
        curr_release = []
        start_logging = False

        curr_version = None
        curr_release_date = None

        for line in lines:
            # Cryptic looking regex to match our version and release date
            version_pattern = re.compile(r"^## \[(.*)\](?: - (\d{4}-\d{2}-\d{2}))?$")
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
        create_release(curr_release, curr_version, curr_release_date)

    def save_file(self) -> None:
        file_text = self._FILE_HEADER
        for release in self.releases:
            file_text += str(release)
        with open(self.file_path, "w", encoding="UTF-8") as file:
            file.write(file_text)

    def release_latest(
        self, version_to_release: version, date_of_release: datetime
    ) -> None:
        """This function converts the unreleased section into a
        release and appends another unreleased section for usage"""
        # Get the latest release
        latest_release = self.releases[0]
        # If the latest release is already released, then we should
        # create a new release
        if latest_release.type != ReleaseLog.Type.PENDING:
            logging.error(
                "Unable to release the latest version as it "
                "is already released. Check the changelog file for errors!"
            )
            return

        # Update latest release type to be released and version
        latest_release.type = ReleaseLog.Type.RELEASED
        latest_release.version = version_to_release
        latest_release.date = date_of_release

        # Add a new unreleased section
        self.releases.insert(0, ReleaseLog())
