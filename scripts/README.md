# Utility Scripts

This folder holds utility scripts written in Python that would aid us in our release management. The changes are not final as we have to alter it to the course requirements, but the standard release process is usually the same.

## Release Process

1. For each release, a branch is made off the latest `develop/stg` and there should be a code freeze (meaning no PR should be approved into `stg` or any changes to the `stg` branch)
2. To automate the process, we usually use scripts and run them in a `Jenkins` or any automation to prepare our `release branches` and `pipelines`(in this case we probably do not have unless we set up our CI/CD pipelines - out of scope/too much effort lol)

```
|--> stg
    |--> release 1.0.0 (where tests and QA are done)
```

3. Once it is marked as a stable release, we tag the latest commit with a specific tag i.e `v1.0.0`.
4. We then update our Changelog to show all changes that happened in that release. Particularly, this Changelog.md should be maintained by the devs manually to simplify the process.
5. Once changes are done, the changes to our release branch would then be automatically merged back to `stg/develop`, counting as a release and updating `stg/develop/prd` with the updated changelog.

## Prerequisite

These are the environment variables you need, I will be using pythonenv.

## Setup Steps (Developing locally)

1. (First time) Create and init python environment:
   ```bash
   python -m venv .venv
   ```
2. Activate the virtual environment
   - Windows:
   ```bash
       .venv\Scripts\activate
   ```
   - Mac:
   ```bash
    source .venv/bin/activate
   ```
3. Install dependencies
   ```bash
    pip install -r requirements.txt
   ```
4. To deactivate
   ```bash
   deactivate
   ```

## Running the release process

1. Hopefully, this would be onboarded to Jenkins as part of our automation, else the following scripts can be run sequentially.
