"""Contains scripts relating to accessing a particular repo
on GitHub for release creation and management."""

from dotenv import dotenv_values
from github import Github

config = dotenv_values(".env")


class GitRepo:
    """Class to interact with a GitHub repository using PyGithub.

    This class provides methods to create draft releases and pull requests
    on a specified GitHub repository.

    Attributes:
        repo_name (str): The name of the GitHub repository.
        gh (Github): An authenticated GitHub instance.
        repo (Repository): The GitHub repository object.
    """
    def __init__(self, repo_name: str):
        self.repo_name = repo_name
        # Try get token from config
        git_token = config.get("GITHUB_TOKEN")
        if git_token is None:
            raise ValueError("GitHub token not found in config. Update your .env file!")
        try:
            # Try to login to GitHub
            self.gh = Github(login_or_token=git_token)
        except Exception as exc:
            # If login fails, raise exception, this is not the correct exception though...
            raise ConnectionError("Failed to login to GitHub. Check your token.") from exc

        # Get the repo that the user has access to
        self.repo = self.gh.get_user().get_repo(repo_name)

    def create_draft_release(self, tag_name: str, message: str):
        """Creates a draft release on the GitHub repository

        Args:
            tag_name (str): tag name of the release
            message (str): message to attach to the release

        Returns:
            str: URL of the created release
        """
        release = self.repo.create_git_release(
            tag=tag_name, name=tag_name, message=message, draft=True, prerelease=False
        )
        return release.html_url

    def create_pr(self, title: str, body: str, head: str, base: str):
        """Creates a pull request on the GitHub repository

        Args:
            title (str): title of the PR
            body (str): body of the PR
            head (str): head branch of the PR
            base (str): base branch of the PR
        """
        pr = self.repo.create_pull(title=title, body=body, head=head, base=base)
        return pr.html_url


if __name__ == "__main__":
    git_repo = GitRepo("wanderers")
    print(f"Repository Name: {git_repo.repo.name}")
    print(f"Repository Description: {git_repo.repo.description}")
    print(f"Repository Owner: {git_repo.repo.owner.login}")
    print(f"Repository URL: {git_repo.repo.html_url}")
    print(f"Repository Stars: {git_repo.repo.stargazers_count}")
    print(f"Repository Forks: {git_repo.repo.forks_count}")
