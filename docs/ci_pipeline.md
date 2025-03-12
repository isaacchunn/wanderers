# CI/CD Pipeline

Currently, Wanderers has a base pipeline for deployment and linting.

Here are the current tasks and how they are run
1. Backend linting and running of tests
2. Frontend linting and running of tests
3. Linting of scripts folder
4. Deployment to Vercel

Each respective task/workflow is only run when the changes in the branch are related to the capability. For example, backend tests are only run when there are file changes to the backend folder, but in this scenario, other types of workflows are skipped. Sooner or later, I would put all these into one pipeline to make it easier rather than seperate tasks.

