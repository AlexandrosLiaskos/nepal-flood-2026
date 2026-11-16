export const FLOOD_EXTENT_LAYERS = [
  {
    id: 'extent-hot-20260827',
    title: 'HOT observed extent · 27 August',
    detail: 'Community-mapped polygon · 31.7 km²',
    colour: '#00747f',
    geojsonUrl: './data/flood-extents/hot-observed-20260827.geojson?v=20260831-1',
    sourceUrl: 'https://data.humdata.org/dataset/hot_flood_npl',
  },
  {
    id: 'extent-unosat-20260826',
    title: 'UNOSAT mudflow and rockflow',
    detail: 'Cumulative satellite-detected extent · 26–27 August',
    colour: '#9a315c',
    geojsonUrl: './data/flood-extents/unosat-mudflow-rockflow-20260826-27.geojson?v=20260831-1',
    sourceUrl: 'https://ihp-wins.unesco.org/en/dataset/nepal-satellite-detected-mudflow-and-rockflow-extent-nepal',
  },
  {
    id: 'extent-cems-aoi01-20260827',
    title: 'CEMS AOI01 · Syapru Besi',
    detail: 'VHR photo-interpretation · GRA v1 · 27 August',
    colour: '#c85c2f',
    geojsonUrl: './data/flood-extents/cems-aoi01-syapru-besi-gra-v1.geojson?v=20260831-1',
    sourceUrl: 'https://mapping.emergency.copernicus.eu/activations/EMSR927/',
  },
  {
    id: 'extent-cems-aoi02-20260827',
    title: 'CEMS AOI02 · Timure',
    detail: 'VHR photo-interpretation · GRA v2 · 27 August',
    colour: '#b78813',
    geojsonUrl: './data/flood-extents/cems-aoi02-timure-gra-v2.geojson?v=20260831-1',
    sourceUrl: 'https://mapping.emergency.copernicus.eu/activations/EMSR927/',
  },
  {
    id: 'extent-cems-aoi03-initial-20260827',
    title: 'CEMS AOI03 · Bidur initial',
    detail: 'VHR photo-interpretation · GRA v1 · 27 August',
    colour: '#7651a3',
    geojsonUrl: './data/flood-extents/cems-aoi03-bidur-gra-v1.geojson?v=20260831-1',
    sourceUrl: 'https://mapping.emergency.copernicus.eu/activations/EMSR927/',
  },
  {
    id: 'extent-cems-aoi03-monitoring-20260828',
    title: 'CEMS AOI03 · Bidur monitoring',
    detail: 'Updated photo-interpretation · MONIT01 v1 · 28 August',
    colour: '#4f337f',
    geojsonUrl: './data/flood-extents/cems-aoi03-bidur-monitoring-v1.geojson?v=20260831-1',
    sourceUrl: 'https://mapping.emergency.copernicus.eu/activations/EMSR927/',
  },
  {
    id: 'extent-iwm-planetscope-20260828',
    title: 'IWM PlanetScope VAP02',
    detail: 'Extended mapped extent · imagery through 28 August',
    colour: '#2f7b59',
    geojsonUrl: './data/flood-extents/iwm-planetscope-vap02-20260828.geojson?v=20260831-1',
    sourceUrl: 'https://sentinel-asia.org/EO/2026/article20260826NP.html',
  },
  {
    id: 'extent-tasa-formosat5-20260828',
    title: 'TASA FORMOSAT-5 affected area',
    detail: 'Satellite-derived polygon · observed 28 August',
    colour: '#2d63a0',
    geojsonUrl: './data/flood-extents/tasa-formosat5-affected-20260828.geojson?v=20260831-1',
    sourceUrl: 'https://sentinel-asia.org/EO/2026/article20260826NP.html',
  },
  {
    id: 'extent-jaxa-alos2-20260828',
    title: 'JAXA ALOS-2 flood proxy',
    detail: 'Automatic radar analysis · observed 28 August · released 31 August',
    colour: '#b43d4c',
    geojsonUrl: './data/flood-extents/jaxa-alos2-automatic-flood-proxy-20260828.geojson?v=20260831-1',
    sourceUrl: 'https://sentinel-asia.org/EO/2026/article20260826NP.html',
  },
];

export const FLOOD_EXTENT_LAYER_IDS = new Set(FLOOD_EXTENT_LAYERS.map(layer => layer.id));

export function wgs84ToUtm45N(longitude, latitude) {
  const semiMajorAxis = 6378137;
  const flattening = 1 / 298.257223563;
  const scaleFactor = 0.9996;
  const eccentricitySquared = flattening * (2 - flattening);
  const eccentricityFourth = eccentricitySquared ** 2;
  const eccentricitySixth = eccentricitySquared ** 3;
  const secondEccentricitySquared = eccentricitySquared / (1 - eccentricitySquared);
  const latitudeRadians = Number(latitude) * Math.PI / 180;
  const longitudeRadians = Number(longitude) * Math.PI / 180;
  const centralMeridianRadians = 87 * Math.PI / 180;
  const sineLatitude = Math.sin(latitudeRadians);
  const cosineLatitude = Math.cos(latitudeRadians);
  const tangentLatitude = Math.tan(latitudeRadians);
  const radiusOfCurvature = semiMajorAxis / Math.sqrt(
    1 - eccentricitySquared * sineLatitude ** 2
  );
  const tangentSquared = tangentLatitude ** 2;
  const curvatureTerm = secondEccentricitySquared * cosineLatitude ** 2;
  const longitudeTerm = cosineLatitude * (longitudeRadians - centralMeridianRadians);
  const meridionalArc = semiMajorAxis * (
    (1 - eccentricitySquared / 4 - 3 * eccentricityFourth / 64 - 5 * eccentricitySixth / 256) * latitudeRadians
    - (3 * eccentricitySquared / 8 + 3 * eccentricityFourth / 32 + 45 * eccentricitySixth / 1024) * Math.sin(2 * latitudeRadians)
    + (15 * eccentricityFourth / 256 + 45 * eccentricitySixth / 1024) * Math.sin(4 * latitudeRadians)
    - 35 * eccentricitySixth / 3072 * Math.sin(6 * latitudeRadians)
  );
  const easting = 500000 + scaleFactor * radiusOfCurvature * (
    longitudeTerm
    + (1 - tangentSquared + curvatureTerm) * longitudeTerm ** 3 / 6
    + (5 - 18 * tangentSquared + tangentSquared ** 2 + 72 * curvatureTerm - 58 * secondEccentricitySquared)
      * longitudeTerm ** 5 / 120
  );
  const northing = scaleFactor * (
    meridionalArc
    + radiusOfCurvature * tangentLatitude * (
      longitudeTerm ** 2 / 2
      + (5 - tangentSquared + 9 * curvatureTerm + 4 * curvatureTerm ** 2) * longitudeTerm ** 4 / 24
      + (61 - 58 * tangentSquared + tangentSquared ** 2 + 600 * curvatureTerm - 330 * secondEccentricitySquared)
        * longitudeTerm ** 6 / 720
    )
  );
  return [easting, northing];
}

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export function renderFloodExtentControls(container) {
  for (const layer of FLOOD_EXTENT_LAYERS) {
    const row = element('div', 'layer-row layer-row-flood-extent');
    row.dataset.layerRow = layer.id;

    const label = element('label', 'layer-visibility-control');
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = layer.id !== 'extent-jaxa-alos2-20260828';
    input.dataset.layerToggle = layer.id;

    const symbol = element('span', 'layer-symbol layer-symbol-extent');
    symbol.style.setProperty('--extent-colour', layer.colour);
    symbol.setAttribute('aria-hidden', 'true');
    symbol.innerHTML = '<svg viewBox="0 0 32 32"><path d="M5 9 13 5l7 3 7-1 1 8-4 6 1 6-9-2-7 2-4-7 3-5z"></path><path d="m9 12 6-3 7 3 2 5-5 5-7-1-3-4z"></path></svg>';

    const copy = element('span', 'layer-label');
    copy.append(element('strong', '', layer.title), element('small', '', layer.detail));
    label.append(input, symbol, copy);

    const source = element('a', 'layer-source-open');
    source.href = layer.sourceUrl;
    source.target = '_blank';
    source.rel = 'noopener noreferrer';
    source.setAttribute('aria-label', `Open source for ${layer.title}`);
    source.title = 'Open source';
    source.innerHTML = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M8 4H4v12h12v-4M11 3h6v6M17 3l-8 8"></path></svg>';

    row.append(label, source);
    container.append(row);
  }
}

export async function loadFloodExtentCollections() {
  const collections = await Promise.all(FLOOD_EXTENT_LAYERS.map(async layer => {
    try {
      const response = await fetch(layer.geojsonUrl, { cache: 'no-store' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return { ...layer, geojson: await response.json() };
    } catch (error) {
      console.warn(`${layer.title} unavailable: ${error.message}`);
      return null;
    }
  }));
  return collections.filter(Boolean);
}
