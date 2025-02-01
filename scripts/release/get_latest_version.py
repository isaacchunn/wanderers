"""Simple script to get the latest version of the release."""

from pathlib import Path

from changelog import Changelog


def main():
    """
    Main function to get the latest version from the changelog.
    """
    # Open the changelog file at the root of the project
    changelog_file = Changelog(Path("Changelog.md"))
    # Get the latest known version from the changelog
    latest_version = changelog_file.releases[1].version
    print(latest_version)


if __name__ == "__main__":
    main()
