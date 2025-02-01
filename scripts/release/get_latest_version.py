"""Simple script to get the latest version of the release."""

from pathlib import Path

from changelog import Changelog
import random


def main():
    """
    Main function to get the latest version from the changelog.
    """
    # Open the changelog file at the root of the project
    changelog_file = Changelog(Path("Changelog.md"))
    # Get the latest known version from the changelog
    latest_version = changelog_file.releases[1].version
    random_number = random.randint(0, 100)
    print(f"{latest_version}-{random_number}")


if __name__ == "__main__":
    main()
