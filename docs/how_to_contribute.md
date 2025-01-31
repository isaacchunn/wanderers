# How to Contribute

1. Always create a new feature branch such as "feature-XXXX" from develop branch and make changes on that feature branch. (You can treat fixes as features, just with branch name as `fix-XXXX`, or if the fix has a ticket number, you can use that instead.)
2. If your task has a ticket number tagged to it, please create the branch with the ticket number as the prefix: `e.g SCEL-42-update-docs`. This is so that JIRA is able to track the branch progress and if a PR is open for that ticket to improve visibility.
   - This can be done with generally the following steps:
     ```bash
         git checkout stg                    # This ensures you start from stg
         git checkout -b feature-add-view    # -b creates a new branch of name feature-add-view and checkouts that branch so you are on the new branch you created
         git status                          # You can run git status to see the branch you are on and if there are untracked files.
     ```
3. TODO: Modify Changelog.md file for new features to be added to "Pending Release" section, @isaacchunn will make the script for this
4. Make pull request into "develop" branch
