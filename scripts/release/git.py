"""This file creates a class for using git commands within
our class by providing utility functions for accessing repo
information."""

import logging.config
import subprocess
from pathlib import Path
from typing import List

config_path = Path.cwd() / "scripts" / "logging_config.ini"

logging.config.fileConfig(config_path)


class Git:
    """
    Git class to interact with GitHub
    """

    def _call(self, command: str, *args) -> str:
        """Does a git call with the given command

        Args:
            command (str): command to run

        Returns:
            str: output of the command
        """
        call_list = ["git", command]

        # Append subsequent args
        for arg in args:
            call_list.append(arg)

        # Run subprocess for call
        try:
            result = subprocess.run(call_list, stdout=subprocess.PIPE, check=True)
            return result.stdout.decode("utf-8")
        except subprocess.CalledProcessError as e:
            logging.error(f"Subprocess error: {e}")
            return ""

    def branch(self, *args) -> List[str]:
        """Acquire branch information about the repository

        Returns:
            List[str]: _description_
        """
        return self._call("branch", *args).split("\n")

    def tag(self, *args) -> List[str]:
        """Acquire tag information about the repository

        Returns:
            List[str]: _description_
        """
        try:
            return self._call("tag", *args).split("\n")
        except subprocess.CalledProcessError as e:
            logging.error(f"Subprocess error: {e}")
            return []

    def add(self, *args) -> None:
        """Adds the changes to the repository

        Returns:
            None
        """
        self._call("add", *args)

    def push(self, *args) -> None:
        """Pushes the changes to the repository

        Returns:
            None
        """
        self._call("push", *args)

    def commit(self, *args) -> None:
        """Commits the changes to the repository

        Returns:
            None
        """
        self._call("commit", *args)

    def diff(self, *args) -> None:
        """Shows the changes made to the repository

        Returns:
            None
        """
        self._call("diff", *args)

    def checkout(self, *args) -> None:
        """Switches to a different branch

        Returns:
            None
        """
        self._call("checkout", *args)

    def create_new_branch(self, *args) -> None:
        """Creates a new branch

        Returns:
            None
        """
        self._call("checkout", "-b", *args)

    def status(self, *args) -> None:
        """Shows the status of the repository

        Returns:
            None
        """
        self._call("status", *args)

    def log(self, *args) -> None:
        """Shows the log of the repository

        Returns:
            None
        """
        return self._call("log", *args)


if __name__ == "__main__":
    git_instance = Git()
    logging.info(git_instance.status())
