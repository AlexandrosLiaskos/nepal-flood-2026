# Changelog

All notable changes to this repository are recorded in this file. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added

- The code of the application as it was deployed at <https://evelpidou.nkua.cloud/Nepal-Flood-2026/>
  on 16 November 2026: the server program, the container file, the page, its style and its modules, the
  icons and map markers, and Three.js r185 with its licence.
- The example of the file that holds the CARTO basemap key (`public/carto-config.example.js`).
- The tests of the server and of the contents of the repository, and the workflow that runs them together
  with the syntax check of the modules.
- The README, the licence, the citation file, the contributing guide, the code of conduct and this
  changelog.

### Changed

- `compose.yaml` stops the container with SIGINT. `server.py` runs as PID 1 without a SIGTERM handler,
  so it ignored the default stop signal and was killed after 10 seconds.
- The given name of Evangelos Spyrou is spelled "Evangelos" in the author lines of the page, in the
  citation file and in the README, as on the team page of <https://evelpidou.nkua.cloud/>.
