# 3040-SCEL-04 / Wanderers

- Wanderers is a collaborative travelling planning platform with features such as collaborative editing, budget splitting, all integrated conveniently into a single web application.
  
## Table of Contents
- [3040-SCEL-04 / Wanderers](#3040-scel-04--wanderers)
  - [Table of Contents](#table-of-contents)
  - [Important Links](#important-links)
  - [Folder Structure](#folder-structure)
  - [Pre-requisities](#pre-requisities)
  - [Setup Guide](#setup-guide)
    - [Front-end](#front-end)
    - [Back-end](#back-end)


## Important Links

- JIRA board: [Wanderers](https://isaacchunn.atlassian.net/jira/software/projects/SCEL/boards/1/backlog)
- Websites for preview:
  - The following websites are automatically updated through Vercel when a corresponding push is done to the branches.
  - prd: https://wanderers-prd.vercel.app/
  - stg: https://wanderers-stg.vercel.app/

## Folder Structure

```
|--> .github
  |--> workflows
|--> backend
|--> docs
|--> frontend
|--> labs
  |-->lab1
  |-->lab2
  |-->lab3
  |-->lab4
  |-->lab5
|--> scripts
```
1. The `.github` folder contains workflows that help us automate several stuff - such as pylint and an automated release process.
2. The `backend` folder contains all codes regarding our server written in Express.
3. The `docs` folder contains all non-lab related documents to aid developer guidelines and provide context on what the project is about. Anybody contributing to this app should look into the documentation in this folder.
4. The `frontend` folder contains all codes regarding our web application written with Next.js.
5. The `labs` folder contains all lab-related documents that are meant for submission.
6. The `scripts` folder contains all automated scripts written in Python

## Pre-requisities
1. Installation of [Node.js](https://nodejs.org/en) is required to get access to npm.

## Setup Guide
1. We store both frontend and backend in the same repository for convenience.

### Front-end
1. From the root directory, run the command
```bash
  cd frontend
```

2. Install dependencies using npm
```bash
  npm install
```

3. Running of local development server
```bash
  npm run dev
```

### Back-end
1. From the root directory, run the command
```bash
  cd backend
```

2. Install dependencies using npm
```bash
  npm install
```

3. Set up your .env file

  - Duplicate .env.example to .env
  - To enable Places API, go to https://console.cloud.google.com/, Enable API & Service for Places API and obtain the API key.
    - For production/staging environments, do set `Key restrictions` in the Google Console to only accept requests from the frontend service.
4. Configure environment variables in the `.env` file.
  - Create a cloud-based postgres instance (for e.g. Supabase) and replace the database `DATABASE_URL`, `DIRECT_URL` strings
  - Create a cloud-based S3 bucket instance and replace the `S3_IMAGE_UPLOAD_ENDPOINT`, `S3_BUCKET_NAME`, `S3_ACCESS_KEY`, `S3_SECRET_ACCESS_KEY` strings
    - e.g. `S3_IMAGE_UPLOAD_ENDPOINT`=`"https://your-project.supabase.co/storage/v1/s3"`, `S3_BUCKET_NAME`=`"wanderers"`
    - Refer to https://supabase.com/docs/guides/storage for our preferred S3 bucket

5. Running of local development server
```bash
  npm run server
```
