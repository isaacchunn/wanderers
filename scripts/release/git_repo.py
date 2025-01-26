"""Contains scripts relating to accessing a particular repo
on GitHub for release creation and management."""
from github import Github
from dotenv import dotenv_values

config = dotenv_values(".env")

class GitRepo:
    def __init__(self, repo_name: str):
        self.repo_name = repo_name
        # Try get token from config
        git_token = config.get("GITHUB_TOKEN")
        if git_token is None:
            raise Exception("GitHub token not found in config. Update your .env file!")   
        try:
            # Try to login to GitHub
            self.gh = Github(login_or_token=git_token)
        except:
            # If login fails, raise exception
            raise Exception("Failed to login to GitHub. Check your token.")
        
        # Get the repo that the user has access to
        self.repo = self.gh.get_user().get_repo(repo_name)
        

if __name__ == "__main__":
    git_repo = GitRepo("wanderers")
    print(f"Repository Name: {git_repo.repo.name}")
    print(f"Repository Description: {git_repo.repo.description}")
    print(f"Repository Owner: {git_repo.repo.owner.login}")
    print(f"Repository URL: {git_repo.repo.html_url}")
    print(f"Repository Stars: {git_repo.repo.stargazers_count}")
    print(f"Repository Forks: {git_repo.repo.forks_count}")
