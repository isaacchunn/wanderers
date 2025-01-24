# Branch Information

Our branch would follow the structure in the hierachy as follows:

```
|--> prod (versions that we release)
    |--> stg (where main development is mostly done and merged into)
        |-->feature-branches (this is where u mainly work on your own features) --^
```

---

1. `stg` is the default branch, so all your pull requests would always automatically merge into stg
2. `stg` is also protected, meaning no pushes can be done, and only PRs would enter `stg`
3. squash and merge has also been enabled, so `stg` is not bloated with the individual commits of your PRs
4. You should be able to see the branch protection rules in https://github.com/isaacchunn/wanderers/settings/branches
5. All PRs require at least one approval before it can be merged into `stg`.

---
1. During release, whatever is in stg would be merged into prod as our stable release.
