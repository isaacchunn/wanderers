# How to Contribute

1. Always create a new feature branch such as "feature-XXXX" from develop branch and make changes on that feature branch. (You can treat fixes as features, just with branch name as `fix-XXXX`, or if the fix has a ticket number, you can use that instead.)
   - This can be done with generally the following steps:
     ```bash
         git checkout stg                    # This ensures you start from stg
         git checkout -b feature-add-view    # -b creates a new branch of name feature-add-view and checkouts that branch so you are on the new branch you created
         git status                          # You can run git status to see the branch you are on and if there are untracked files.
     ```
2. TODO: Modify Changelog.md file for new features to be added to "Pending Release" section, @isaachunn will make the script for this
3. Make pull request into "develop" branch
