# Contributing

Contributions are welcome through pull requests. The branch `main` receives a change only through a
pull request whose checks have passed.

## Licence

Contributions are accepted under the licence of the application, the Creative Commons Attribution 4.0
International licence (see [LICENSE](LICENSE)).

## Code

- The page has no build step: it is HTML, CSS and JavaScript modules. Three.js is loaded from
  `public/vendor/` through the import map in `index.html`; Leaflet, OpenLayers, ol-mapbox-style and
  geotiff.js are loaded from public content delivery networks at the versions fixed in the code.
- The server uses only the Python standard library.
- The imports and links of the page carry a version query (`?v=...`). Change it together with the file it
  points to, so that browsers load the new file.
- Run the checks listed in [README.md](README.md) before opening a pull request.

## Data

Data files, imagery and keys are not committed. `public/data/`, `public/assets/`, `public/carto-config.js`
and the count of visits stay on the server (see [README.md](README.md)), and the tests fail when such files
are added.

## Commits

Write the subject of a commit in the imperative, in at most 72 characters, and describe one change in each
commit.

## Changes

Record every notable change in [CHANGELOG.md](CHANGELOG.md).
