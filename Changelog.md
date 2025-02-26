# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Global user state (UserProvider and UserStore) with zustand implemented
- Authentication and User state integrated
- Protect Activity, Places route

### Fixed

### Changed

### Removed

## [0.0.4] - 2025-02-19

### Added

- (BE) CRUD routes for backend Itinerary API
- (BE) CRUD routes for backend Activity API
- (BE) Query Google Places API through backend (rate-limit protected)
- (FE) Base layout web pages for Home, Login, Register, Itinerary viewing/creation and Activity viewing/creation
- (FE) Itinerary handler for frontend to access backend Itinerary API for CRUD
- (FE) Activity handler for frontend to access backend Activity API for CRUD and Google Places API
- (FE) Mock Google Autocomplete for searching of activities in Itinerary page
- (FE) Integration for viewing of Itineraries in Home page
- CI/CD check for running tests and ESLint
- Deployment to Vercel via Github Actions

### Fixed

- (BE) An issue with Registration, Login and Confirm Account Backend API setting multiple HTTP responses
- (BE) Bypass CORS error with wildcard

### Changed

- (BE) Moved backend package.json to correct directory

## [0.0.3] - 2025-02-01

### Added

- Initial Express API Backend with Signup and Login
- Initial next.js project with TailwindCSS
- Landing page for Wanderers web site
- Pylint workflow that runs per commit
- Release workflows for tagging prd branch and creating the releases

### Changed

- All python files that failed the pylint checl

## [0.0.2] - 2025-01-27

### Added

- Full automation of our release process by running generate_release.py

### Changed

- File name of generate_release.py file

## [0.0.1] - 2025-01-27

### Added

- This changelog file to hopefully serve as an evolving example of a standardized changelog.
- Script for updating this changelog in the file `scripts/release/update_changelog.py`
- Added base docs (README and contribution guidelines) for this repository
- CODEOWNERS file to track mandatory reviewers of certain PRs

---

[unreleased]: https://github.com/isaacchunn/wanderers/compare/v0.0.4...HEAD
[0.0.4]: https://github.com/isaacchunn/wanderers/compare/v0.0.3...v0.0.4
[0.0.3]: https://github.com/isaacchunn/wanderers/compare/v0.0.2...v0.0.3
[0.0.2]: https://github.com/isaacchunn/wanderers/compare/v0.0.1...v0.0.2
[0.0.1]: https://github.com/isaacchunn/wanderers/releases/tag/v0.0.1
