# 2026 Nepal Debris Avalanche and Flash Flood

This repository holds the code of a web application that reconstructs the debris avalanche and flash
flood of 26 August 2026 in Nepal on the terrain, in two and three dimensions. The application shows the
pathway of the flood along the river system, the timing of the event and the documented impacts.

The application was made by Niki Evelpidou, Alexandros Liaskos and Evaggelos Spyrou (Department of
Geology and Geoenvironment, National and Kapodistrian University of Athens) and Nitesh Khadka (Centre
for Water Resources Studies, Institute of Engineering, Tribhuvan University, Nepal).

- Site: <https://evelpidou.nkua.cloud/Nepal-Flood-2026/>
- Data catalogue of the event: <https://evelpidou.nkua.cloud/Nepal-Flood-2026-Catalogue/>, with its
  first dated release archived on Zenodo: <https://doi.org/10.5281/zenodo.23034746>

## Status

The repository holds the code only: the server program, the container file and the code of the page,
as they were deployed on 16 November 2026. The data layers of the reconstruction, the imagery and the
key of the basemap service stay on the server; the section [Not included](#not-included) lists them
with the reasons.

## Repository

| Place | Contents |
|---|---|
| `server.py` | The server. It serves the page, the terrain profile of each point of the route (`/api/profile/<index>`), the count of page visits (`/api/visit`) and a health answer (`/api/health`). It uses only the Python standard library. |
| `compose.yaml` | The file that starts the container on the server |
| `public/index.html`, `public/styles.css` | The page and its style |
| `public/app.js` | The main module of the page: the 3D scene, the overview maps and the panels |
| `public/gis-2d-scene.mjs` | The 2D map, drawn with OpenLayers |
| `public/surface-layers.mjs`, `public/native-imagery-tiles.mjs` | The satellite image layers and their controls |
| `public/flood-extent-layers.mjs` | The flood extent layers and their controls |
| `public/damage-evidence.mjs` | The presentation and grouping of the damage records |
| `public/terrain-analysis.mjs` | The terrain profile between two points |
| `public/carto-config.example.js` | Example of the file that holds the CARTO basemap key |
| `public/vendor/` | Three.js r185, the 3D library of the page, with its licence |
| `public/*.png`, `public/*.svg` | Icons and map markers |
| `tests/` | The tests of the server and of the contents of the repository |
| `.github/workflows/` | The automatic checks |

## Not included

| Path on the server | Contents | Reason |
|---|---|---|
| `public/data/` (19 files, 26 MB) | The terrain grid, the route and the terrain profiles along it, the flood extents, the damage and event evidence records, and the manifest of these layers | Data layers of the reconstruction; they are not code |
| `public/assets/` (13 GB) | The satellite image tiles, the source images, the photographs, the video clip and the university logo shown on the page | Size, and imagery and media that remain under the terms of their providers |
| `public/carto-config.js` | The key of the CARTO basemap service | A key is not published in a repository |
| `public/social-preview.jpg` | The preview image that social media show for the page | An image made from satellite imagery; not code |
| `public.tar.gz` | An archive of an earlier copy of `public/` | An archive of files that are already listed here |
| `data/visits.json` | The count of page visits | Written by the server while it runs |
| `public/vendor/three.module.min.js`, `public/vendor/three.core.min.js`, `public/vendor/LICENSE-threejs.txt`, `public/vendor/r185/`, `public/vendor/examples/` | Earlier copies of Three.js | The page does not load them |

The server reads `public/data/manifest.json` whenever it handles a request, so it serves the page only where the data
folder of the server is present.

## Running the application on your own computer

The server needs Python 3.12 (the version of the container) and no other package. The page needs the
data folder and the imagery of the server, which are not in this repository.

```sh
git clone https://github.com/AlexandrosLiaskos/nepal-flood-2026
cd nepal-flood-2026
cp public/carto-config.example.js public/carto-config.js
python server.py --app-dir public --visit-count-file data/visits.json
```

Put the CARTO basemap key between the quotation marks in `public/carto-config.js`. With an empty key the
overview maps show no CARTO tiles, and the 2D map requests the CARTO tiles without a key. The server
answers at <http://127.0.0.1:8765/>.

## Checks

The workflow `Checks` runs on every push and pull request. It compiles `server.py` and runs the tests in
`tests/` with Python 3.12, validates `compose.yaml` with Docker Compose, and checks the syntax of every
JavaScript module of the page with Node.js 22. The tests start the server on a small data folder that
they create, and they check that the repository holds every file that the page and its modules load,
except the folders listed above, and no key or data file.

```sh
python -m py_compile server.py
python -m unittest discover --start-directory tests --verbose
```

## Deployment

On the server, the folder `/opt/nepal-flood-2026` holds `server.py`, `compose.yaml`, `public/` and `data/`.
The container runs the image `python:3.12-alpine` with a read-only file system as user 65534. It mounts
`server.py` and `public/` read-only and `data/` for the count of visits, and it joins the Docker network
`nkua-proxy`. The front web server forwards <https://evelpidou.nkua.cloud/Nepal-Flood-2026/> to the
container on port 8765.

To deploy a change, copy the changed files into the server folder. The server reads the files of the page
at each request, so a change of the page needs no restart; a change of `server.py` needs a restart of the
container (`docker compose up -d --force-recreate` in the server folder).

## Sources

As the page credits them:

- Terrain data: NASA High Mountain Asia DEM and Copernicus DEM.
- Event and impact evidence: USGS, GFZ, United Nations Satellite Centre (UNOSAT), Copernicus Emergency
  Management Service (CEMS), Humanitarian OpenStreetMap Team (HOT), Sentinel Asia, JAXA, Institute of
  Water Modelling (IWM) and Taiwan Space Agency (TASA).
- Mapping and software: OpenStreetMap contributors, OpenFreeMap, CARTO, NASA GIBS, OpenTopoMap,
  Three.js, OpenLayers and Leaflet.

## Third-party software

- Three.js r185, in `public/vendor/`, under the MIT License (`public/vendor/r185-20260828/LICENSE.txt`).
- Loaded by the page from public content delivery networks: Leaflet 1.9.4 (unpkg, BSD-2-Clause),
  OpenLayers 10.6.1 and ol-mapbox-style 13.1.0 (unpkg, BSD-2-Clause) and geotiff.js 2.1.3 (jsDelivr,
  MIT).
- `public/qgis-default-north-arrow.svg` is the default north arrow of QGIS, from the QGIS repository
  (<https://github.com/qgis/QGIS>), which is licensed under the GNU General Public License, version 2.

## Citation and licence

To cite the application, use the entry in [CITATION.cff](CITATION.cff), which follows the citation given
on the page:

> Evelpidou, N., Liaskos, A., Spyrou, E., & Khadka, N. (2026). *2026 Nepal Debris Avalanche and Flash
> Flood: Interactive 2D and 3D terrain reconstruction* [Web application]. National and Kapodistrian
> University of Athens. https://evelpidou.nkua.cloud/Nepal-Flood-2026/

As the page states, the original text, interface, visualisation design and research outputs of the
application are licensed under the [Creative Commons Attribution 4.0 International licence](LICENSE)
(CC BY 4.0), except where third-party data, basemaps, imagery, logos or source materials are credited
separately. Third-party materials, including the software listed above, remain under their own terms.
