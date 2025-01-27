import argparse
from datetime import datetime
from pathlib import Path

import changelog


def get_args():
    parser = argparse.ArgumentParser(
        description="Script that does updating of the changelog for a release"
    )
    parser.add_argument(
        "--version", type=str, help="Version of the release", required=True
    )
    parser.add_argument(
        "--date",
        type=str,
        help="Date of the release, else it will be the current date by default",
        default=datetime.today().strftime("%Y-%m-%d"),
    )
    parser.add_argument(
        "--file_path",
        type=str,
        help="Path to the changelog file",
        default="Changelog.md",
    )
    return parser.parse_args()


def main():
    args = get_args()
    changelog_file = changelog.Changelog(Path(args.file_path))
    changelog_file.release_latest(args.version, args.date)
    changelog_file.save_file()


if __name__ == "__main__":
    main()
