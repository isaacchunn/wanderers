"""This file contains the script to update the release by following the process:
Typically, the release process for Git is as follows:
1. Create a release branch
2. Update changelog
3. Commit changelog changes
4. Tag this particular commit
5. Push the commit
6. Make release on GitHub
7. Create PR to merge the release branch into the main branch
"""

import argparse
import logging.config
from datetime import datetime
from pathlib import Path

from changelog import Changelog
from git import Git
from git_repo import GitRepo
from packaging import version

config_path = Path.cwd() / "scripts" / "logging_config.ini"

logging.config.fileConfig(config_path)

# pylint: disable=pointless-string-statement
"""Typically, the release process for Git is as follows: 
1. Create a release branch
2. Update changelog
3. Commit changelog changes
4. Tag this particular commit
5. Push the commit
6. Make release on GitHub
7. Create PR to merge the release branch into the main branch
"""
# pylint: enable=pointless-string-statement

REPO_NAME = "wanderers"


def get_args():
    """Parses and returns the command line arguments.

    Returns:
        argparse.Namespace: Parsed command line arguments.
    """
    parser = argparse.ArgumentParser(
        description=(
            "Script that does the whole release process."
            " It is split into different scripts for better modularity."
            " It can also be onboarded to Jenkins later if needed."
        )
    )
    parser.add_argument(
        "--release_version", type=str, help="Version of the release", required=True
    )
    parser.add_argument(
        "--release_date",
        type=str,
        help="Date of the release, else it will be the current date by default",
        default=datetime.today().strftime("%Y-%m-%d"),
    )
    return parser.parse_args()


def create_release_branch(release_version):
    """Creates the release branch for this release

    Args:
        release_version (str): version of release
    """
    release_branch = f"release-{release_version}"
    logging.info(f"Creating release branch {release_branch}")
    # Init git then call checkout -b
    git = Git()
    # Checkout from stg and always create release branch from there
    git.checkout("stg")
    git.create_new_branch(release_branch)


def update_changelog(args):
    """Updates the changelog with the new release details

    Args:
        args (argparse.Namespace): args
    """
    logging.info(f"Updating changelog for release {args.release_version}")
    changelog_file = Changelog(Path("Changelog.md"))
    changelog_file.release_latest(args.release_version, args.release_date)
    changelog_file.save_file()


def commit_changelog_changes(release_version):
    """Commits the changelog changes for release

    Args:
        release_version (str): version of release
    """
    logging.info(f"Committing changelog changes for release {release_version}")
    git = Git()
    git.add("Changelog.md")
    # Commit changes to changelog.md
    git.commit("-m", f"Update Changelog for release {release_version}")


def tag_commit(release_version):
    """Tags the commit with the release version

    Args:
        release_version (str): version of release
    """
    logging.info(f"Tagging commit for release {release_version}")
    git = Git()
    latest_commit_hash = git.log("--pretty=format:'%h'", "-1").replace("'", "")
    # Tag the latest commit hash
    git.tag(
        "-a",
        f"v{release_version}",
        latest_commit_hash,
        "-m",
        "Release version {release_version}",
    )


def push_changes(release_version):
    """Pushes the changes of the release branch to origin

    Args:
        release_version (str): version of release
    """
    logging.info(f"Pushing changes for release {release_version}")
    git = Git()
    git.push("--tags")
    git.push("--set-upstream", "origin", f"release-{release_version}")


def make_draft_release(release_version):
    """Makes a draft release on GitHub

    Args:
        release_version (str): version of release
    """
    logging.info(f"Creating draft release for release {release_version}")
    git_repo = GitRepo(REPO_NAME)

    def get_release_record(release_version):
        changelog_file = Changelog(Path("Changelog.md"))
        for release in changelog_file.releases:
            if release.version == version.parse(release_version):
                return release
        return None

    release_message = get_release_record(release_version)
    release_url = git_repo.create_draft_release(
        f"v{release_version}", str(release_message)
    )
    logging.info(f"Draft release created at {release_url}")
    return str(release_message), release_url


def create_pr(release_version, release_message, release_url, base):
    """Creates a pull request for the release branch

    Args:
        release_version (str): version of release
        release_message (str): release notes message
        release_url (str): URL of the draft release
    """
    logging.info(f"Creating PR for release {release_version}")
    git_repo = GitRepo(REPO_NAME)

    pr_title = f"{REPO_NAME} release v{release_version}"
    pr_body = (
        f"Release notes:\n{release_message}\nRelease URL: {release_url}\n"
        "Please review and merge this PR to complete the release process."
    )
    pr_url = git_repo.create_pr(
        title=pr_title, body=pr_body, head=f"release-{release_version}", base=base
    )
    logging.info(f"PR created at {pr_url}")


def main():
    """Main function to execute the release process."""
    args = get_args()

    # Create release branch to start the release process
    # create_release_branch(args.release_version)

    # Update changelog
    update_changelog(args)

    # Commit changelog changes
    commit_changelog_changes(args.release_version)

    # Tag changes (we no longer do this here, but in github actions)
    # When the push event is detected on prd.
    # We make the tags on prd
    # tag_commit(args.release_version)

    # Push the changes
    push_changes(args.release_version)

    # Make draft release on Git
    release_message, release_url = make_draft_release(args.release_version)

    # Create PR for stg and prod
    create_pr(args.release_version, release_message, release_url, base="stg")
    create_pr(args.release_version, release_message, release_url, base="prd")


if __name__ == "__main__":
    main()
