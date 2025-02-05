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
  - Accessible only by developers for now

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
TO ADD @albert
