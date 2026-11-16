const OPENLAYERS_VERSION = '10.6.1';
const OL_MAPBOX_STYLE_VERSION = '13.1.0';
const GEOTIFF_VERSION = '2.1.3';
const OPENLAYERS_SCRIPT = `https://unpkg.com/ol@${OPENLAYERS_VERSION}/dist/ol.js`;
const OPENLAYERS_STYLES = `https://unpkg.com/ol@${OPENLAYERS_VERSION}/ol.css`;
const OL_MAPBOX_STYLE_SCRIPT = `https://unpkg.com/ol-mapbox-style@${OL_MAPBOX_STYLE_VERSION}/dist/olms.js`;
const GEOTIFF_SCRIPT = `https://cdn.jsdelivr.net/npm/geotiff@${GEOTIFF_VERSION}/dist-browser/geotiff.js`;
const SOURCE_PIXEL_CATALOG_URL = './assets/satellite/source-pixel-catalog.json?v=20260830-1';

const BASEMAPS = new Map([
  ['openfreemap-positron', {
    type: 'vector-style',
    styleUrl: 'https://tiles.openfreemap.org/styles/positron',
    attribution: '<a href="https://openfreemap.org/" target="_blank" rel="noopener noreferrer">OpenFreeMap</a> · <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>',
  }],
  ['openfreemap-liberty', {
    type: 'vector-style',
    styleUrl: 'https://tiles.openfreemap.org/styles/liberty',
    attribution: '<a href="https://openfreemap.org/" target="_blank" rel="noopener noreferrer">OpenFreeMap</a> · <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>',
  }],
  ['openfreemap-bright', {
    type: 'vector-style',
    styleUrl: 'https://tiles.openfreemap.org/styles/bright',
    attribution: '<a href="https://openfreemap.org/" target="_blank" rel="noopener noreferrer">OpenFreeMap</a> · <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>',
  }],
  ['openfreemap-fiord', {
    type: 'vector-style',
    styleUrl: 'https://tiles.openfreemap.org/styles/fiord',
    attribution: '<a href="https://openfreemap.org/" target="_blank" rel="noopener noreferrer">OpenFreeMap</a> · <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>',
  }],
  ['openfreemap-dark', {
    type: 'vector-style',
    styleUrl: 'https://tiles.openfreemap.org/styles/dark',
    attribution: '<a href="https://openfreemap.org/" target="_blank" rel="noopener noreferrer">OpenFreeMap</a> · <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>',
  }],
  ['carto-positron', {
    type: 'xyz',
    style: 'light_all',
    attribution: '<a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> · <a href="https://carto.com/attributions" target="_blank" rel="noopener noreferrer">CARTO</a>',
  }],
  ['carto-voyager', {
    type: 'xyz',
    style: 'rastertiles/voyager',
    attribution: '<a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> · <a href="https://carto.com/attributions" target="_blank" rel="noopener noreferrer">CARTO</a>',
  }],
  ['carto-dark-matter', {
    type: 'xyz',
    style: 'dark_all',
    attribution: '<a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> · <a href="https://carto.com/attributions" target="_blank" rel="noopener noreferrer">CARTO</a>',
  }],
  ['osm-standard', {
    type: 'osm',
    attribution: '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap contributors</a>',
  }],
  ['opentopomap', {
    type: 'xyz-url',
    url: 'https://a.tile.opentopomap.org/{z}/{x}/{y}.png',
    maxZoom: 17,
    attribution: 'Map data © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap contributors</a> · Map style © <a href="https://opentopomap.org/" target="_blank" rel="noopener noreferrer">OpenTopoMap</a> (CC BY-SA)',
  }],
  ['nasa-blue-marble', {
    type: 'nasa-wms',
    attribution: 'Imagery: <a href="https://earthdata.nasa.gov/gibs" target="_blank" rel="noopener noreferrer">NASA GIBS / ESDIS</a>',
  }],
  ['none', {
    type: 'none',
    attribution: '',
  }],
]);

const scriptPromises = new Map();

function loadStylesheet(href) {
  if ([...document.styleSheets].some(sheet => sheet.href === href)) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  document.head.append(link);
}

function loadScript(src, globalName) {
  if (window[globalName]) return Promise.resolve(window[globalName]);
  if (scriptPromises.has(src)) return scriptPromises.get(src);
  const promise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.addEventListener('load', () => {
      if (window[globalName]) resolve(window[globalName]);
      else reject(new Error(`${globalName} did not initialize`));
    }, { once: true });
    script.addEventListener('error', () => reject(new Error(`Unable to load ${src}`)), { once: true });
    document.head.append(script);
  });
  scriptPromises.set(src, promise);
  return promise;
}

async function loadOpenLayers() {
  loadStylesheet(OPENLAYERS_STYLES);
  await loadScript(GEOTIFF_SCRIPT, 'GeoTIFF');
  const openLayers = await loadScript(OPENLAYERS_SCRIPT, 'ol');
  await loadScript(OL_MAPBOX_STYLE_SCRIPT, 'olms');
  return openLayers;
}

function clamp(value, minimum, maximum) {
  return Math.max(minimum, Math.min(maximum, value));
}

function parseHexColour(value) {
  const hex = value.replace('#', '');
  return [
    Number.parseInt(hex.slice(0, 2), 16),
    Number.parseInt(hex.slice(2, 4), 16),
    Number.parseInt(hex.slice(4, 6), 16),
  ];
}

function scientificColour(stops, value) {
  const t = clamp(value, 0, 1);
  for (let index = 1; index < stops.length; index += 1) {
    const right = stops[index];
    if (t > right.position) continue;
    const left = stops[index - 1];
    const span = Math.max(Number.EPSILON, right.position - left.position);
    const local = (t - left.position) / span;
    return [
      left.rgb[0] + (right.rgb[0] - left.rgb[0]) * local,
      left.rgb[1] + (right.rgb[1] - left.rgb[1]) * local,
      left.rgb[2] + (right.rgb[2] - left.rgb[2]) * local,
    ];
  }
  return stops.at(-1).rgb.slice();
}

function createDemImage({ terrainX, terrainY, terrainZ, rows, columns, minimumElevation, maximumElevation, hypsometricStops }) {
  const canvas = document.createElement('canvas');
  canvas.width = columns;
  canvas.height = rows;
  const context = canvas.getContext('2d', { alpha: true });
  const image = context.createImageData(columns, rows);
  const pixels = image.data;
  const stops = hypsometricStops.map(stop => ({ position: stop.position, rgb: parseHexColour(stop.css) }));
  const elevationRange = Math.max(Number.EPSILON, maximumElevation - minimumElevation);
  const sourceNorthFirst = terrainY[0] > terrainY[rows - 1];
  const sun = [-0.48, 0.46, 0.75];

  function elevationAt(row, column, fallback) {
    const value = terrainZ[clamp(row, 0, rows - 1) * columns + clamp(column, 0, columns - 1)];
    return Number.isFinite(value) ? value : fallback;
  }

  for (let imageRow = 0; imageRow < rows; imageRow += 1) {
    const sourceRow = sourceNorthFirst ? imageRow : rows - imageRow - 1;
    const previousRow = clamp(sourceRow - 1, 0, rows - 1);
    const nextRow = clamp(sourceRow + 1, 0, rows - 1);
    const dy = terrainY[nextRow] - terrainY[previousRow] || 1;
    for (let column = 0; column < columns; column += 1) {
      const sourceIndex = sourceRow * columns + column;
      const targetIndex = (imageRow * columns + column) * 4;
      const elevation = terrainZ[sourceIndex];
      if (!Number.isFinite(elevation)) {
        pixels[targetIndex + 3] = 0;
        continue;
      }
      const previousColumn = clamp(column - 1, 0, columns - 1);
      const nextColumn = clamp(column + 1, 0, columns - 1);
      const dx = terrainX[nextColumn] - terrainX[previousColumn] || 1;
      const dzdx = (elevationAt(sourceRow, nextColumn, elevation) - elevationAt(sourceRow, previousColumn, elevation)) / dx;
      const dzdy = (elevationAt(nextRow, column, elevation) - elevationAt(previousRow, column, elevation)) / dy;
      const normalLength = Math.hypot(dzdx, dzdy, 1);
      const illumination = clamp((-dzdx * sun[0] - dzdy * sun[1] + sun[2]) / normalLength, -1, 1);
      const shade = clamp(0.72 + illumination * 0.28, 0.48, 1.08);
      const colour = scientificColour(stops, (elevation - minimumElevation) / elevationRange);
      pixels[targetIndex] = Math.round(clamp(colour[0] * shade, 0, 255));
      pixels[targetIndex + 1] = Math.round(clamp(colour[1] * shade, 0, 255));
      pixels[targetIndex + 2] = Math.round(clamp(colour[2] * shade, 0, 255));
      pixels[targetIndex + 3] = 255;
    }
  }
  context.putImageData(image, 0, 0);
  return canvas.toDataURL('image/png');
}

function routeValue(route, columnCount, stationIndex, columnIndex) {
  return route[stationIndex * columnCount + columnIndex];
}

function damageSymbolSvg(assetType, accent) {
  const paths = assetType === 'building'
    ? '<path d="M8 17 18 8l10 9v11H8Z M14 28v-7h8v7"/>'
    : assetType === 'bridge'
      ? '<path d="M6 16h24M9 16v12M27 16v12M5 28h26M10 16c2-5 5-7 8-7s6 2 8 7"/>'
      : assetType === 'cultural_heritage'
        ? '<path d="m6 14 12-7 12 7M8 16h20M10 16v12M15 16v12M21 16v12M26 16v12M7 29h22M5 32h26"/>'
        : '<path d="M8 28V11h20v17M12 11V7h12v4M6 28h24"/><circle cx="18" cy="20" r="4"/><path d="M18 16v8M14 20h8"/>';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36"><circle cx="18" cy="18" r="16" fill="#f7f7f4" stroke="#172126" stroke-width="1.6"/><circle cx="18" cy="18" r="13.5" fill="none" stroke="${accent}" stroke-width="2"/><g fill="none" stroke="#172126" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" transform="translate(0 -1)">${paths}</g></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function featureExtent(features) {
  const coordinates = features.map(feature => feature.getGeometry().getCoordinates());
  if (!coordinates.length) return null;
  const xs = coordinates.map(coordinate => coordinate[0]);
  const ys = coordinates.map(coordinate => coordinate[1]);
  return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
}

export async function createGis2DScene(options) {
  const ol = await loadOpenLayers();
  const {
    container,
    cartoBasemapKey = '',
    terrainX,
    terrainY,
    terrainZ,
    rows,
    columns,
    minimumElevation,
    maximumElevation,
    hypsometricStops,
    route,
    routeColumnCount,
    stationCount,
    sourceControl,
    bridgeControl,
    damageFeatures,
    eventEvidence,
    floodExtentCollections = [],
    initialBasemap = 'openfreemap-positron',
    onRouteSelect = () => {},
    onControlSelect = () => {},
    onDamageSelect = () => {},
    onTerrainPointSelect = () => {},
    sampleTerrainElevation = () => NaN,
    onViewChange = () => {},
    onStatus = () => {},
  } = options;

  const fromLonLat = ol.proj.fromLonLat;
  const transformExtent = ol.proj.transformExtent;
  const routeCoordinates = new Array(stationCount);
  for (let index = 0; index < stationCount; index += 1) {
    routeCoordinates[index] = fromLonLat([
      routeValue(route, routeColumnCount, index, 2),
      routeValue(route, routeColumnCount, index, 3),
    ]);
  }

  const routeFeature = new ol.Feature({
    geometry: new ol.geom.LineString(routeCoordinates),
    kind: 'route',
  });
  const routeSource = new ol.source.Vector({ features: [routeFeature], wrapX: false });
  const routeLayer = new ol.layer.Vector({
    source: routeSource,
    declutter: false,
    style: [
      new ol.style.Style({ stroke: new ol.style.Stroke({ color: '#f3f3f0', width: 7, lineCap: 'round', lineJoin: 'round' }) }),
      new ol.style.Style({ stroke: new ol.style.Stroke({ color: '#8b201b', width: 3.2, lineCap: 'round', lineJoin: 'round' }) }),
    ],
  });
  routeLayer.setZIndex(26);

  const detachmentFeatures = (eventEvidence?.features ?? [])
    .filter(feature => feature.layer_id === 'detachment-zone')
    .map(payload => new ol.Feature({
      geometry: new ol.geom.Polygon(
        payload.coordinates_wgs84.map(ring => ring.map(coordinate => fromLonLat(coordinate)))
      ),
      kind: 'event-evidence',
      payload,
    }));
  const detachmentLayer = new ol.layer.Vector({
    source: new ol.source.Vector({ features: detachmentFeatures, wrapX: false }),
    style: new ol.style.Style({
      fill: new ol.style.Fill({ color: 'rgba(155, 60, 47, 0.16)' }),
      stroke: new ol.style.Stroke({ color: '#9b3c2f', width: 2.5, lineJoin: 'round' }),
    }),
  });
  detachmentLayer.setZIndex(28);

  const floodExtentLayers = new Map();
  const geoJsonFormat = new ol.format.GeoJSON();
  for (const collection of floodExtentCollections) {
    const features = geoJsonFormat.readFeatures(collection.geojson, {
      dataProjection: 'EPSG:4326',
      featureProjection: 'EPSG:3857',
    });
    for (const feature of features) {
      feature.set('kind', 'flood-extent');
      feature.set('layerId', collection.id);
    }
    const [red, green, blue] = parseHexColour(collection.colour);
    const source = new ol.source.Vector({ features, wrapX: false });
    const layer = new ol.layer.Vector({
      source,
      declutter: false,
      style: [
        new ol.style.Style({
          fill: new ol.style.Fill({ color: `rgba(${red}, ${green}, ${blue}, 0.14)` }),
          stroke: new ol.style.Stroke({ color: 'rgba(247, 247, 244, 0.94)', width: 4.6, lineJoin: 'round' }),
        }),
        new ol.style.Style({
          stroke: new ol.style.Stroke({ color: collection.colour, width: 2.25, lineJoin: 'round' }),
        }),
      ],
    });
    layer.set('layerId', collection.id);
    layer.setVisible(false);
    layer.setZIndex(27);
    floodExtentLayers.set(collection.id, { collection, layer, source });
  }

  const eventFeatures = [sourceControl, bridgeControl].filter(Boolean).map(control => new ol.Feature({
    geometry: new ol.geom.Point(fromLonLat([control.longitude, control.latitude])),
    kind: 'control',
    control,
    layerId: control.id === 'SOURCE' ? 'source' : 'bridge-reference',
  }));
  const eventSource = new ol.source.Vector({ features: eventFeatures, wrapX: false });
  let selected = null;
  const eventStyles = new Map();
  function eventStyle(feature) {
    const control = feature.get('control');
    const isSource = control.id === 'SOURCE';
    const key = `${control.id}:${selected?.type === 'control' && selected.id === control.id ? 'selected' : 'normal'}`;
    if (eventStyles.has(key)) return eventStyles.get(key);
    const styles = [];
    if (key.endsWith('selected')) {
      styles.push(new ol.style.Style({
        image: new ol.style.Circle({
          radius: isSource ? 30 : 27,
          fill: new ol.style.Fill({ color: 'rgba(255,255,255,0.32)' }),
          stroke: new ol.style.Stroke({ color: '#005b76', width: 4 }),
        }),
      }));
    }
    styles.push(new ol.style.Style({
      image: new ol.style.Icon({
        src: isSource ? './marker-source.svg?v=20260828-2' : './marker-bridge.svg?v=20260828-2',
        scale: isSource ? 0.22 : 0.195,
      }),
    }));
    eventStyles.set(key, styles);
    return styles;
  }
  const eventLayer = new ol.layer.Vector({ source: eventSource, style: eventStyle, declutter: true });
  eventLayer.setZIndex(42);

  const damageAccents = {
    building: '#7d5b83',
    bridge: '#7e3531',
    hydropower_facility: '#456b73',
    cultural_heritage: '#8b6a35',
  };
  const damageLayers = new Map();
  const damageStyleCache = new Map();
  for (const assetType of Object.keys(damageAccents)) {
    const originals = damageFeatures
      .filter(feature => feature.asset_type === assetType)
      .map(payload => new ol.Feature({
        geometry: new ol.geom.Point(fromLonLat([Number(payload.longitude), Number(payload.latitude)])),
        kind: 'damage',
        payload,
      }));
    const originalSource = new ol.source.Vector({ features: originals, wrapX: false });
    const clusterSource = new ol.source.Cluster({ distance: 34, minDistance: 12, source: originalSource });
    const layer = new ol.layer.Vector({
      source: clusterSource,
      declutter: true,
      style(clusterFeature) {
        const members = clusterFeature.get('features') || [];
        const isSelected = members.some(member => selected?.type === 'damage' && member.get('payload').id === selected.id);
        const key = `${assetType}:${members.length}:${isSelected}`;
        if (damageStyleCache.has(key)) return damageStyleCache.get(key);
        const styles = [];
        if (isSelected) {
          styles.push(new ol.style.Style({
            image: new ol.style.Circle({
              radius: members.length > 1 ? 24 : 21,
              fill: new ol.style.Fill({ color: 'rgba(255,255,255,0.28)' }),
              stroke: new ol.style.Stroke({ color: '#005b76', width: 4 }),
            }),
          }));
        }
        if (members.length > 1) {
          const radius = members.length > 99 ? 20 : members.length > 9 ? 18 : 16;
          styles.push(new ol.style.Style({
            image: new ol.style.Circle({
              radius,
              fill: new ol.style.Fill({ color: '#f7f7f4' }),
              stroke: new ol.style.Stroke({ color: damageAccents[assetType], width: 2.5 }),
            }),
            text: new ol.style.Text({
              text: String(members.length),
              fill: new ol.style.Fill({ color: '#111719' }),
              font: '700 12px Arial, Helvetica, sans-serif',
            }),
          }));
        } else {
          styles.push(new ol.style.Style({
            image: new ol.style.Icon({ src: damageSymbolSvg(assetType, damageAccents[assetType]) }),
          }));
        }
        damageStyleCache.set(key, styles);
        return styles;
      },
    });
    layer.set('layerId', assetType);
    layer.setZIndex(40);
    damageLayers.set(assetType, { layer, clusterSource, originalSource });
  }

  const selectedFeature = new ol.Feature({ geometry: null, kind: 'selection' });
  const selectionSource = new ol.source.Vector({ features: [selectedFeature], wrapX: false });
  const selectionLayer = new ol.layer.Vector({
    source: selectionSource,
    style: new ol.style.Style({
      image: new ol.style.Circle({
        radius: 10,
        fill: new ol.style.Fill({ color: '#ffffff' }),
        stroke: new ol.style.Stroke({ color: '#005b76', width: 3 }),
      }),
    }),
  });
  selectionLayer.setZIndex(46);

  const measurementSource = new ol.source.Vector({ wrapX: false });
  const measurementLayer = new ol.layer.Vector({
    source: measurementSource,
    style(feature) {
      if (feature.getGeometry().getType() === 'LineString') {
        return [
          new ol.style.Style({ stroke: new ol.style.Stroke({ color: '#f3f3f0', width: 8 }) }),
          new ol.style.Style({ stroke: new ol.style.Stroke({ color: '#005b76', width: 4 }) }),
        ];
      }
      return new ol.style.Style({
        image: new ol.style.Circle({
          radius: 12,
          fill: new ol.style.Fill({ color: '#005b76' }),
          stroke: new ol.style.Stroke({ color: '#f7f7f4', width: 3 }),
        }),
        text: new ol.style.Text({
          text: feature.get('label'),
          fill: new ol.style.Fill({ color: '#ffffff' }),
          font: '700 11px Arial, Helvetica, sans-serif',
        }),
      });
    },
  });
  measurementLayer.setZIndex(45);

  const analysisSource = new ol.source.Vector({ wrapX: false });
  const analysisLayer = new ol.layer.Vector({
    source: analysisSource,
    style(feature) {
      if (feature.getGeometry().getType() === 'LineString') {
        return [
          new ol.style.Style({ stroke: new ol.style.Stroke({ color: '#f3f3f0', width: 8, lineCap: 'round' }) }),
          new ol.style.Style({ stroke: new ol.style.Stroke({ color: '#005b76', width: 4, lineCap: 'round' }) }),
        ];
      }
      return new ol.style.Style({
        image: new ol.style.Circle({
          radius: 12,
          fill: new ol.style.Fill({ color: feature.get('label') === 'A' ? '#005b76' : '#9b5c28' }),
          stroke: new ol.style.Stroke({ color: '#f7f7f4', width: 3 }),
        }),
        text: new ol.style.Text({
          text: feature.get('label'),
          fill: new ol.style.Fill({ color: '#ffffff' }),
          font: '700 11px Arial, Helvetica, sans-serif',
        }),
      });
    },
  });
  analysisLayer.setZIndex(47);

  const nativePixelGridSource = new ol.source.Vector({ wrapX: false });
  const nativePixelGridLayer = new ol.layer.Vector({
    source: nativePixelGridSource,
    declutter: false,
    updateWhileAnimating: false,
    updateWhileInteracting: false,
    style: [
      new ol.style.Style({
        stroke: new ol.style.Stroke({ color: 'rgba(8, 16, 18, 0.58)', width: 2 }),
      }),
      new ol.style.Style({
        stroke: new ol.style.Stroke({ color: 'rgba(255, 255, 255, 0.72)', width: 0.75 }),
      }),
    ],
  });
  nativePixelGridLayer.setVisible(false);
  nativePixelGridLayer.setZIndex(24);

  onStatus('Preparing 2D terrain…');
  const terrainExtentUtm = [
    Math.min(terrainX[0], terrainX[columns - 1]),
    Math.min(terrainY[0], terrainY[rows - 1]),
    Math.max(terrainX[0], terrainX[columns - 1]),
    Math.max(terrainY[0], terrainY[rows - 1]),
  ];
  const terrainExtentMap = transformExtent(terrainExtentUtm, 'EPSG:32645', 'EPSG:3857');
  const demImageUrl = createDemImage({
    terrainX,
    terrainY,
    terrainZ,
    rows,
    columns,
    minimumElevation,
    maximumElevation,
    hypsometricStops,
  });
  const demLayer = new ol.layer.Image({
    opacity: 0.78,
    extent: terrainExtentMap,
    source: new ol.source.ImageStatic({
      url: demImageUrl,
      projection: 'EPSG:32645',
      imageExtent: terrainExtentUtm,
      interpolate: true,
    }),
  });
  demLayer.setZIndex(10);

  const view = new ol.View({
    center: routeCoordinates[Math.floor(routeCoordinates.length / 2)],
    zoom: 8,
    minZoom: 3,
    maxZoom: 24,
    enableRotation: false,
  });
  const controls = [
    new ol.control.Zoom(),
    new ol.control.ScaleLine({ units: 'metric', minWidth: 96 }),
  ];
  const map = new ol.Map({
    target: container,
    layers: [demLayer, nativePixelGridLayer, ...[...floodExtentLayers.values()].map(entry => entry.layer), detachmentLayer, routeLayer, ...[...damageLayers.values()].map(entry => entry.layer), eventLayer, measurementLayer, selectionLayer, analysisLayer],
    controls,
    view,
    pixelRatio: Math.min(window.devicePixelRatio || 1, 2),
  });
  view.fit(routeFeature.getGeometry().getExtent(), {
    padding: [58, 58, 58, 58],
    maxZoom: 12,
  });

  const providerCredit = document.createElement('div');
  providerCredit.className = 'gis2d-provider-credit';
  providerCredit.setAttribute('aria-label', 'Basemap attribution');
  container.append(providerCredit);

  const northIndicator = document.createElement('div');
  northIndicator.className = 'gis2d-north-indicator';
  northIndicator.setAttribute('role', 'img');
  northIndicator.setAttribute('aria-label', 'North direction');
  const northIndicatorImage = document.createElement('img');
  northIndicatorImage.src = './qgis-default-north-arrow.svg?v=20260829-1';
  northIndicatorImage.alt = '';
  northIndicatorImage.width = 44;
  northIndicatorImage.height = 44;
  northIndicator.append(northIndicatorImage);
  container.append(northIndicator);

  const basemapLayers = new Map();
  let activeBasemapId = null;
  let basemapRequestSequence = 0;

  function cartoUrl(style) {
    const key = cartoBasemapKey.trim();
    return `https://a.basemaps.cartocdn.com/${style}/{z}/{x}/{y}.png${key ? `?key=${encodeURIComponent(key)}` : ''}`;
  }

  function rasterBasemap(specification) {
    if (specification.type === 'osm') {
      return new ol.layer.Tile({
        source: new ol.source.XYZ({
          url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
          maxZoom: 19,
          crossOrigin: 'anonymous',
          wrapX: true,
        }),
      });
    }
    if (specification.type === 'nasa-wms') {
      return new ol.layer.Tile({
        source: new ol.source.TileWMS({
          url: 'https://gibs.earthdata.nasa.gov/wms/epsg3857/best/wms.cgi',
          params: {
            LAYERS: 'BlueMarble_ShadedRelief_Bathymetry',
            FORMAT: 'image/jpeg',
            VERSION: '1.3.0',
          },
          crossOrigin: 'anonymous',
          transition: 180,
        }),
      });
    }
    const url = specification.type === 'xyz'
      ? cartoUrl(specification.style)
      : specification.url;
    return new ol.layer.Tile({
      source: new ol.source.XYZ({
        url,
        maxZoom: specification.maxZoom || 20,
        crossOrigin: 'anonymous',
        wrapX: true,
        transition: 180,
      }),
    });
  }

  async function getBasemapLayer(id) {
    if (basemapLayers.has(id)) return basemapLayers.get(id);
    const specification = BASEMAPS.get(id);
    if (!specification || specification.type === 'none') return null;
    let layer;
    if (specification.type === 'vector-style') {
      layer = new ol.layer.Group({ visible: false });
      layer.setZIndex(0);
      map.getLayers().insertAt(0, layer);
      basemapLayers.set(id, layer);
      await window.olms.apply(layer, specification.styleUrl);
    } else {
      layer = rasterBasemap(specification);
      layer.setVisible(false);
      layer.setZIndex(0);
      map.getLayers().insertAt(0, layer);
      basemapLayers.set(id, layer);
    }
    return layer;
  }

  async function setBasemap(id) {
    const specification = BASEMAPS.get(id) || BASEMAPS.get('openfreemap-positron');
    const resolvedId = BASEMAPS.has(id) ? id : 'openfreemap-positron';
    const sequence = ++basemapRequestSequence;
    activeBasemapId = resolvedId;
    for (const layer of basemapLayers.values()) layer.setVisible(false);
    providerCredit.innerHTML = specification.attribution;
    providerCredit.hidden = !specification.attribution;
    if (specification.type === 'none') return;
    onStatus('Loading basemap…');
    try {
      const layer = await getBasemapLayer(resolvedId);
      if (sequence !== basemapRequestSequence || activeBasemapId !== resolvedId) return;
      layer?.setVisible(true);
      onStatus('');
    } catch (error) {
      if (sequence !== basemapRequestSequence) return;
      onStatus(`Basemap unavailable: ${error.message}`);
    }
  }

  let optimizedSurfaceLayer = null;
  let nativeSurfaceLayer = null;
  let sourcePixelLayers = [];
  let activeSurfaceLayerId = null;
  let activeSurfaceMetadata = null;
  let activeImageryDetailMode = 'optimized';
  let activeNativeManifest = null;
  let activeSourceScenes = [];
  let surfaceRequestSequence = 0;
  const nativeManifestCache = new Map();
  let sourcePixelCatalogPromise = null;

  function removeSurfaceLayer(layer) {
    if (layer) map.removeLayer(layer);
  }

  function clearSurfaceLayers() {
    removeSurfaceLayer(optimizedSurfaceLayer);
    removeSurfaceLayer(nativeSurfaceLayer);
    for (const layer of sourcePixelLayers) removeSurfaceLayer(layer);
    optimizedSurfaceLayer = null;
    nativeSurfaceLayer = null;
    sourcePixelLayers = [];
    activeNativeManifest = null;
    activeSourceScenes = [];
    nativePixelGridSource.clear();
    nativePixelGridLayer.setVisible(false);
  }

  function createOptimizedSurface(metadata) {
    const sourceExtent = metadata.bounds_utm_32645.map(Number);
    const layer = new ol.layer.Image({
      extent: transformExtent(sourceExtent, 'EPSG:32645', 'EPSG:3857'),
      source: new ol.source.ImageStatic({
        url: metadata.texture_url,
        projection: 'EPSG:32645',
        imageExtent: sourceExtent,
        interpolate: true,
      }),
    });
    layer.setZIndex(20);
    return layer;
  }

  async function loadNativeManifest(url) {
    if (!nativeManifestCache.has(url)) {
      nativeManifestCache.set(url, fetch(url).then(response => {
        if (!response.ok) throw new Error(`Native imagery manifest: HTTP ${response.status}`);
        return response.json();
      }));
    }
    return nativeManifestCache.get(url);
  }

  async function loadSourcePixelCatalog() {
    if (!sourcePixelCatalogPromise) {
      sourcePixelCatalogPromise = fetch(SOURCE_PIXEL_CATALOG_URL, { cache: 'no-store' }).then(response => {
        if (!response.ok) throw new Error(`Source-pixel catalogue: HTTP ${response.status}`);
        return response.json();
      });
    }
    return sourcePixelCatalogPromise;
  }

  async function createSourcePixelSurface(scene) {
    if (!ol.source.GeoTIFF || !ol.layer.WebGLTile) {
      throw new Error('GeoTIFF rendering is unavailable in this browser');
    }
    const sourceInformation = {
      url: new URL(scene.url, window.location.href).href,
      bands: [...scene.display_bands],
    };
    let hasAlpha = false;
    if (Number.isInteger(scene.alpha_band)) {
      sourceInformation.bands.push(scene.alpha_band);
      hasAlpha = true;
    } else if (scene.nodata !== null && scene.nodata !== undefined && Number.isFinite(Number(scene.nodata))) {
      sourceInformation.nodata = Number(scene.nodata);
      hasAlpha = true;
    }
    const source = new ol.source.GeoTIFF({
      sources: [sourceInformation],
      sourceOptions: {
        allowFullFile: false,
        cacheSize: 64,
        maxRanges: 4,
      },
      convertToRGB: 'auto',
      normalize: true,
      interpolate: false,
      transition: 0,
      wrapX: false,
    });
    await source.getView();
    const layer = new ol.layer.WebGLTile({
      source,
      extent: transformExtent(scene.extent, scene.projection, 'EPSG:3857', 8),
      preload: 0,
      cacheSize: 64,
      style: {
        color: [
          'color',
          ['*', 255, ['band', 1]],
          ['*', 255, ['band', 2]],
          ['*', 255, ['band', 3]],
          hasAlpha ? ['band', 4] : 1,
        ],
      },
    });
    layer.setZIndex(21);
    return layer;
  }

  function createNativeSurface(manifest) {
    const levels = [...manifest.levels].sort((left, right) => left.zoom - right.zoom);
    const levelByZoom = new Map(levels.map(level => [Number(level.zoom), level]));
    const resolutions = levels.map(level => Number(level.pixel_size_m));
    const sourceExtent = manifest.bounds_utm_32645.map(Number);
    const template = new URL(manifest.tile_url_template, window.location.href).href;
    const tileGrid = new ol.tilegrid.TileGrid({
      extent: sourceExtent,
      origin: [sourceExtent[0], sourceExtent[3]],
      resolutions,
      tileSize: Number(manifest.tile_size),
      minZoom: 0,
    });
    const source = new ol.source.XYZ({
      projection: manifest.crs || 'EPSG:32645',
      tileGrid,
      wrapX: false,
      interpolate: false,
      transition: 0,
      tileUrlFunction(tileCoordinate) {
        if (!tileCoordinate) return undefined;
        const [zoom, column, row] = tileCoordinate;
        const level = levelByZoom.get(zoom);
        if (!level || column < 0 || row < 0 || column >= level.columns || row >= level.rows) return undefined;
        return template
          .replace('{z}', String(zoom))
          .replace('{x}', String(column))
          .replace('{y}', String(row));
      },
    });
    const layer = new ol.layer.Tile({
      source,
      extent: transformExtent(sourceExtent, manifest.crs || 'EPSG:32645', 'EPSG:3857'),
      preload: 0,
    });
    layer.setZIndex(21);
    return layer;
  }

  function affineCoordinate(transform, column, row) {
    const [a, b, c, d, e, f] = transform.map(Number);
    return [a * column + b * row + c, d * column + e * row + f];
  }

  function inverseAffineCoordinate(transform, coordinate) {
    const [a, b, c, d, e, f] = transform.map(Number);
    const determinant = a * e - b * d;
    if (!Number.isFinite(determinant) || Math.abs(determinant) < Number.EPSILON) return null;
    const x = coordinate[0] - c;
    const y = coordinate[1] - f;
    return [(e * x - b * y) / determinant, (-d * x + a * y) / determinant];
  }

  function sourceSceneGrid() {
    const mapCenter = view.getCenter();
    if (!mapCenter) return null;
    for (let index = activeSourceScenes.length - 1; index >= 0; index -= 1) {
      const scene = activeSourceScenes[index];
      const center = ol.proj.transform(mapCenter, 'EPSG:3857', scene.projection);
      const extent = scene.extent.map(Number);
      if (center[0] >= extent[0] && center[0] <= extent[2]
        && center[1] >= extent[1] && center[1] <= extent[3]) {
        return {
          projection: scene.projection,
          width: Number(scene.width),
          height: Number(scene.height),
          transform: scene.transform,
        };
      }
    }
    return null;
  }

  function activePixelGrid() {
    if (activeImageryDetailMode === 'source') {
      const sourceGrid = sourceSceneGrid();
      if (sourceGrid) return sourceGrid;
    }
    if ((activeImageryDetailMode !== 'native' && activeImageryDetailMode !== 'source') || !activeNativeManifest) return null;
    const pixelSize = Number(activeNativeManifest.native_pixel_size_m);
    const extent = activeNativeManifest.bounds_utm_32645?.map(Number);
    if (!extent || extent.length !== 4 || !Number.isFinite(pixelSize) || pixelSize <= 0) return null;
    return {
      projection: activeNativeManifest.crs || 'EPSG:32645',
      width: Math.ceil((extent[2] - extent[0]) / pixelSize),
      height: Math.ceil((extent[3] - extent[1]) / pixelSize),
      transform: [pixelSize, 0, extent[0], 0, -pixelSize, extent[3]],
    };
  }

  function updatePixelGrid() {
    nativePixelGridSource.clear();
    nativePixelGridLayer.setVisible(false);
    const grid = activePixelGrid();
    if (!grid) return;

    const sourceProjection = grid.projection;
    const width = Number(grid.width);
    const height = Number(grid.height);
    const mapSize = map.getSize();
    const mapResolution = Number(view.getResolution());
    const mapCenter = view.getCenter();
    if (!mapSize || !mapCenter || !Number.isFinite(width) || !Number.isFinite(height)
      || width <= 0 || height <= 0
      || !Number.isFinite(mapResolution) || mapResolution <= 0) return;

    const sourceCenter = ol.proj.transform(mapCenter, 'EPSG:3857', sourceProjection);
    const sourceCenterPixel = inverseAffineCoordinate(grid.transform, sourceCenter);
    if (!sourceCenterPixel) return;
    const centerOnMap = ol.proj.transform(
      affineCoordinate(grid.transform, sourceCenterPixel[0], sourceCenterPixel[1]),
      sourceProjection,
      'EPSG:3857',
    );
    const eastOnMap = ol.proj.transform(
      affineCoordinate(grid.transform, sourceCenterPixel[0] + 1, sourceCenterPixel[1]),
      sourceProjection,
      'EPSG:3857',
    );
    const southOnMap = ol.proj.transform(
      affineCoordinate(grid.transform, sourceCenterPixel[0], sourceCenterPixel[1] + 1),
      sourceProjection,
      'EPSG:3857',
    );
    const cellWidthPixels = Math.hypot(
      eastOnMap[0] - centerOnMap[0],
      eastOnMap[1] - centerOnMap[1],
    ) / mapResolution;
    const cellHeightPixels = Math.hypot(
      southOnMap[0] - centerOnMap[0],
      southOnMap[1] - centerOnMap[1],
    ) / mapResolution;
    if (Math.min(cellWidthPixels, cellHeightPixels) < 7) return;

    const visibleMapExtent = view.calculateExtent(mapSize);
    const visibleMapCorners = [
      [visibleMapExtent[0], visibleMapExtent[1]],
      [visibleMapExtent[0], visibleMapExtent[3]],
      [visibleMapExtent[2], visibleMapExtent[1]],
      [visibleMapExtent[2], visibleMapExtent[3]],
    ];
    const visiblePixels = visibleMapCorners
      .map(coordinate => ol.proj.transform(coordinate, 'EPSG:3857', sourceProjection))
      .map(coordinate => inverseAffineCoordinate(grid.transform, coordinate))
      .filter(Boolean);
    if (!visiblePixels.length) return;
    const columns = visiblePixels.map(coordinate => coordinate[0]);
    const rows = visiblePixels.map(coordinate => coordinate[1]);
    const firstColumn = Math.max(0, Math.floor(Math.min(...columns)));
    const lastColumn = Math.min(width, Math.ceil(Math.max(...columns)));
    const firstRow = Math.max(0, Math.floor(Math.min(...rows)));
    const lastRow = Math.min(height, Math.ceil(Math.max(...rows)));
    if (firstColumn >= lastColumn || firstRow >= lastRow) return;
    if ((lastColumn - firstColumn + 1) + (lastRow - firstRow + 1) > 700) return;

    const features = [];
    for (let column = firstColumn; column <= lastColumn; column += 1) {
      features.push(new ol.Feature({
        geometry: new ol.geom.LineString([
          ol.proj.transform(affineCoordinate(grid.transform, column, firstRow), sourceProjection, 'EPSG:3857'),
          ol.proj.transform(affineCoordinate(grid.transform, column, lastRow), sourceProjection, 'EPSG:3857'),
        ]),
      }));
    }
    for (let row = firstRow; row <= lastRow; row += 1) {
      features.push(new ol.Feature({
        geometry: new ol.geom.LineString([
          ol.proj.transform(affineCoordinate(grid.transform, firstColumn, row), sourceProjection, 'EPSG:3857'),
          ol.proj.transform(affineCoordinate(grid.transform, lastColumn, row), sourceProjection, 'EPSG:3857'),
        ]),
      }));
    }
    nativePixelGridSource.addFeatures(features);
    nativePixelGridLayer.setVisible(features.length > 0);
  }

  async function setSurface(layerId, metadata, detailMode = activeImageryDetailMode) {
    const sequence = ++surfaceRequestSequence;
    activeSurfaceLayerId = layerId || null;
    activeSurfaceMetadata = metadata || null;
    activeImageryDetailMode = detailMode === 'source' ? 'source' : detailMode === 'native' ? 'native' : 'optimized';
    clearSurfaceLayers();
    if (!metadata) return;
    optimizedSurfaceLayer = createOptimizedSurface(metadata);
    map.addLayer(optimizedSurfaceLayer);

    if (activeImageryDetailMode === 'source') {
      onStatus('Loading original source pixels…');
      try {
        const catalog = await loadSourcePixelCatalog();
        const scenes = catalog.layers?.[layerId]?.scenes || [];
        if (scenes.length) {
          const prepared = await Promise.allSettled(scenes.map(async scene => ({
            scene,
            layer: await createSourcePixelSurface(scene),
          })));
          if (sequence !== surfaceRequestSequence || activeSurfaceLayerId !== layerId) return;
          const available = prepared
            .filter(result => result.status === 'fulfilled')
            .map(result => result.value);
          if (available.length) {
            activeSourceScenes = available.map(entry => entry.scene);
            sourcePixelLayers = available.map((entry, index) => {
              entry.layer.setZIndex(21 + index / 1000);
              map.addLayer(entry.layer);
              return entry.layer;
            });
            requestAnimationFrame(updatePixelGrid);
            onStatus(available.length === scenes.length ? '' : 'Some original source scenes are unavailable.');
            return;
          }
        }
      } catch (error) {
        if (sequence !== surfaceRequestSequence) return;
        console.warn(`Source pixels unavailable: ${error.message}`);
      }
      if (!metadata.native_tiles_url) {
        onStatus('Original source pixels are unavailable for this layer; optimized imagery remains visible.');
        return;
      }
      onStatus('Original source pixels are unavailable for this derived layer; loading native detail.');
    }

    if (activeImageryDetailMode === 'optimized' || !metadata.native_tiles_url) return;
    onStatus('Loading native imagery tiles…');
    try {
      const manifest = await loadNativeManifest(metadata.native_tiles_url);
      if (sequence !== surfaceRequestSequence || activeSurfaceLayerId !== layerId) return;
      activeNativeManifest = manifest;
      nativeSurfaceLayer = createNativeSurface(manifest);
      map.addLayer(nativeSurfaceLayer);
      requestAnimationFrame(updatePixelGrid);
      onStatus(activeImageryDetailMode === 'source'
        ? 'Original source pixels are unavailable for this derived layer; native detail is shown.'
        : '');
    } catch (error) {
      if (sequence !== surfaceRequestSequence) return;
      onStatus(`Native imagery unavailable: ${error.message}`);
    }
  }

  function setImageryDetailMode(mode) {
    const nextMode = mode === 'source' ? 'source' : mode === 'native' ? 'native' : 'optimized';
    if (nextMode === activeImageryDetailMode) return;
    activeImageryDetailMode = nextMode;
    void setSurface(activeSurfaceLayerId, activeSurfaceMetadata, nextMode);
  }

  function setLayerVisibility(layerId, visible) {
    if (layerId === 'terrain') demLayer.setVisible(visible);
    else if (layerId === 'flow-path') routeLayer.setVisible(visible);
    else if (layerId === 'detachment-zone') detachmentLayer.setVisible(visible);
    else if (floodExtentLayers.has(layerId)) floodExtentLayers.get(layerId).layer.setVisible(visible);
    else if (layerId === 'source' || layerId === 'bridge-reference') {
      eventLayer.changed();
      for (const feature of eventFeatures) {
        if (feature.get('layerId') === layerId) feature.setStyle(visible ? null : new ol.style.Style({}));
      }
    } else if (damageLayers.has(layerId)) {
      damageLayers.get(layerId).layer.setVisible(visible);
    }
    selectionLayer.setVisible(!selected?.layerId || selected.layerId === layerId ? visible : selectionLayer.getVisible());
  }

  function updateSelectionStyles() {
    eventStyles.clear();
    damageStyleCache.clear();
    eventLayer.changed();
    for (const entry of damageLayers.values()) entry.layer.changed();
  }

  function setSelected(nextSelection) {
    selected = nextSelection ? { ...nextSelection } : null;
    if (selected && Number.isFinite(selected.longitude) && Number.isFinite(selected.latitude)) {
      selectedFeature.setGeometry(new ol.geom.Point(fromLonLat([selected.longitude, selected.latitude])));
      selectionLayer.setVisible(true);
    } else {
      selectedFeature.setGeometry(null);
    }
    updateSelectionStyles();
  }

  function clearSelection() {
    selected = null;
    selectedFeature.setGeometry(null);
    updateSelectionStyles();
  }

  function focusCoordinate(coordinate, targetZoom) {
    const zoom = Math.max(Number(view.getZoom()) || 0, targetZoom);
    view.animate({ center: coordinate, zoom, duration: 420 });
  }

  function focusControl(control) {
    focusCoordinate(fromLonLat([control.longitude, control.latitude]), control.id === 'SOURCE' ? 14.25 : 15);
  }

  function focusDamage(feature) {
    const targetZoom = feature.asset_type === 'building' ? 16 : feature.asset_type === 'bridge' ? 15.5 : 15;
    focusCoordinate(fromLonLat([Number(feature.longitude), Number(feature.latitude)]), targetZoom);
  }

  function focusRouteIndex(index) {
    focusCoordinate(routeCoordinates[clamp(index, 0, routeCoordinates.length - 1)], 14.5);
  }

  function focusFloodExtent(layerId) {
    const entry = floodExtentLayers.get(layerId);
    if (!entry) return;
    const extent = entry.source.getExtent();
    if (ol.extent.isEmpty(extent)) return;
    view.fit(extent, { padding: [70, 70, 70, 70], duration: 420, maxZoom: 15 });
  }

  function setMeasurement(indices = []) {
    measurementSource.clear();
    const validIndices = indices.filter(index => Number.isInteger(index) && index >= 0 && index < routeCoordinates.length);
    validIndices.forEach((index, order) => {
      measurementSource.addFeature(new ol.Feature({
        geometry: new ol.geom.Point(routeCoordinates[index]),
        label: order === 0 ? 'A' : 'B',
      }));
    });
    if (validIndices.length > 1) {
      const start = Math.min(validIndices[0], validIndices[1]);
      const end = Math.max(validIndices[0], validIndices[1]);
      measurementSource.addFeature(new ol.Feature({
        geometry: new ol.geom.LineString(routeCoordinates.slice(start, end + 1)),
      }));
    }
  }

  let analysisMode = null;

  function setAnalysisMode(mode) {
    analysisMode = mode === 'distance' || mode === 'profile' ? mode : null;
    map.getTargetElement().style.cursor = analysisMode ? 'crosshair' : '';
  }

  function setAnalysisPoints(points = []) {
    analysisSource.clear();
    const coordinates = points
      .filter(point => Number.isFinite(point.easting) && Number.isFinite(point.northing))
      .map(point => ol.proj.transform([point.easting, point.northing], 'EPSG:32645', 'EPSG:3857'));
    coordinates.forEach((coordinate, index) => {
      analysisSource.addFeature(new ol.Feature({
        geometry: new ol.geom.Point(coordinate),
        label: index === 0 ? 'A' : 'B',
      }));
    });
    if (coordinates.length > 1) {
      analysisSource.addFeature(new ol.Feature({ geometry: new ol.geom.LineString(coordinates) }));
    }
  }

  function nearestRouteIndex(coordinate) {
    let nearestIndex = 0;
    let nearestDistance = Infinity;
    for (let index = 0; index < routeCoordinates.length; index += 1) {
      const dx = routeCoordinates[index][0] - coordinate[0];
      const dy = routeCoordinates[index][1] - coordinate[1];
      const distance = dx * dx + dy * dy;
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }
    }
    return nearestIndex;
  }

  map.on('singleclick', event => {
    if (analysisMode) {
      const [easting, northing] = ol.proj.transform(event.coordinate, 'EPSG:3857', 'EPSG:32645');
      const withinTerrain = easting >= terrainExtentUtm[0] && easting <= terrainExtentUtm[2]
        && northing >= terrainExtentUtm[1] && northing <= terrainExtentUtm[3];
      const elevation = withinTerrain ? sampleTerrainElevation(easting, northing) : NaN;
      if (!Number.isFinite(elevation)) {
        onStatus('Select a location within the DEM terrain.');
        return;
      }
      const [longitude, latitude] = ol.proj.toLonLat(event.coordinate);
      onStatus('');
      onTerrainPointSelect({ easting, northing, elevation, longitude, latitude });
      return;
    }
    const hits = [];
    map.forEachFeatureAtPixel(event.pixel, (feature, layer) => {
      hits.push({ feature, layer });
    }, { hitTolerance: 7 });
    const controlHit = hits.find(hit => hit.feature.get('kind') === 'control');
    if (controlHit) {
      onControlSelect(controlHit.feature.get('control'));
      return;
    }
    const clusterHit = hits.find(hit => Array.isArray(hit.feature.get('features')));
    if (clusterHit) {
      const members = clusterHit.feature.get('features');
      if (members.length === 1) {
        onDamageSelect(members[0].get('payload'));
      } else {
        const extent = featureExtent(members);
        if (extent) view.fit(extent, { padding: [70, 70, 70, 70], duration: 420, maxZoom: 17 });
      }
      return;
    }
    const routeHit = hits.find(hit => hit.feature === routeFeature);
    if (routeHit) onRouteSelect(nearestRouteIndex(event.coordinate));
  });

  map.on('pointermove', event => {
    if (event.dragging) return;
    if (analysisMode) {
      map.getTargetElement().style.cursor = 'crosshair';
      return;
    }
    const hit = map.hasFeatureAtPixel(event.pixel, { hitTolerance: 6 });
    map.getTargetElement().style.cursor = hit ? 'pointer' : '';
  });
  map.on('moveend', () => {
    updatePixelGrid();
    onViewChange();
  });

  function getViewportPixel(longitude, latitude) {
    return map.getPixelFromCoordinate(fromLonLat([longitude, latitude]));
  }

  function setActive(active) {
    if (active) requestAnimationFrame(() => map.updateSize());
  }

  function updateSize() {
    map.updateSize();
  }

  await setBasemap(initialBasemap);
  onStatus('');

  return {
    setActive,
    setBasemap,
    setLayerVisibility,
    setSurface,
    setImageryDetailMode,
    setSelected,
    clearSelection,
    focusControl,
    focusDamage,
    focusRouteIndex,
    focusFloodExtent,
    setMeasurement,
    setAnalysisMode,
    setAnalysisPoints,
    getViewportPixel,
    updateSize,
  };
}
