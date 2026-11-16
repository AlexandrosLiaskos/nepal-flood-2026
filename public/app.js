import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Line2 } from 'three/addons/lines/Line2.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { LineSegments2 } from 'three/addons/lines/LineSegments2.js';
import { LineSegmentsGeometry } from 'three/addons/lines/LineSegmentsGeometry.js';
import { CARTO_BASEMAP_KEY } from './carto-config.js?v=20260828-1';
import {
  clusterProjectedDamageFeatures,
  damageClusterPresentation,
  damageFeaturePresentation,
} from './damage-evidence.mjs?v=20260829-1';
import { renderSurfaceLayerControls } from './surface-layers.mjs?v=20260830-1';
import {
  FLOOD_EXTENT_LAYERS,
  loadFloodExtentCollections,
  renderFloodExtentControls,
  wgs84ToUtm45N,
} from './flood-extent-layers.mjs?v=20260831-6';
import { createNativeImageryTileManager } from './native-imagery-tiles.mjs?v=20260830-2';
import { analyzeTerrainTransect } from './terrain-analysis.mjs?v=20260829-1';

const canvas = document.getElementById('terrain-3d');
const gis2dContainer = document.getElementById('terrain-2d');
const orientationCanvas = document.getElementById('orientation-3d');
const terrainPanel = document.getElementById('terrain-panel');
const sceneModeButtons = [...document.querySelectorAll('#scene-mode-switch [data-scene-mode]')];
const basemapSelect = document.getElementById('basemap-select');
const loadStatus = document.getElementById('load-status');
const profileSvg = document.getElementById('cross-section');
const longitudinalSvg = document.getElementById('longitudinal-profile');
const overviewPanel = document.getElementById('overview-panel');
const overviewMapContainer = document.getElementById('overview-route-map');
const overviewContextMapContainer = document.getElementById('overview-context-map');
const recordPopover = document.getElementById('record-popover');
const recordPopoverTitle = document.getElementById('record-popover-title');
const recordPopoverContext = document.getElementById('record-popover-context');
const recordPopoverPrimary = document.getElementById('record-popover-primary');
const recordPopoverSecondary = document.getElementById('record-popover-secondary');
const recordPopoverMedia = document.getElementById('record-popover-media');
const recordPopoverMediaLink = document.getElementById('record-popover-media-link');
const recordPopoverMediaImage = document.getElementById('record-popover-media-image');
const recordPopoverMediaVideo = document.getElementById('record-popover-media-video');
const recordPopoverMediaSource = document.getElementById('record-popover-media-source');
const recordPopoverSensitiveMedia = document.getElementById('record-popover-sensitive-media');
const recordPopoverMediaWarning = document.getElementById('record-popover-media-warning');
const recordPopoverMediaReveal = document.getElementById('record-popover-media-reveal');
const recordPopoverCloseButton = document.getElementById('record-popover-close');
const recordReadMoreButton = document.getElementById('record-read-more');
const recordDialog = document.getElementById('record-dialog');
const recordDialogTitle = document.getElementById('record-dialog-title');
const recordDialogContext = document.getElementById('record-dialog-context');
const recordDialogCloseButton = document.getElementById('record-dialog-close');
const featureInspection = document.getElementById('feature-inspection');
const featureSourceEvidence = document.getElementById('feature-source-evidence');
const featureSourceImages = [...document.querySelectorAll('[data-source-image]')];
const featureBridgeEvidence = document.getElementById('feature-bridge-evidence');
const featureBridgeVideo = document.getElementById('feature-bridge-video');
const featureBridgeWarning = document.getElementById('feature-bridge-warning');
const featureBridgeReveal = document.getElementById('feature-bridge-reveal');
const damageInspection = document.getElementById('damage-inspection');
const damageSourceList = document.getElementById('damage-source-list');
const damageContextEvidence = document.getElementById('damage-context-evidence');
const damageContextHeading = document.getElementById('damage-context-heading');
const damageContextScope = document.getElementById('damage-context-scope');
const damageContextMedia = document.getElementById('damage-context-media');
const damageContextMediaLink = document.getElementById('damage-context-media-link');
const damageContextMediaImage = document.getElementById('damage-context-media-image');
const damageContextMediaSource = document.getElementById('damage-context-media-source');
const damageContextSourceList = document.getElementById('damage-context-source-list');
const damageLocationData = document.getElementById('damage-location-data');
const zoomToDamageClusterButton = document.getElementById('zoom-to-damage-cluster');
const measurementPanel = document.getElementById('measurement-panel');
const measurementResults = document.getElementById('measurement-results');
const measurementInstruction = document.getElementById('measurement-instruction');
const pointInspection = document.getElementById('point-inspection');
const panelHeader = document.getElementById('panel-header');
const panelTitle = document.getElementById('panel-title');
const panelContext = document.getElementById('panel-context');
const panelExitButton = document.getElementById('panel-exit');
const overviewAuthorship = document.getElementById('overview-authorship');
const pointMeasureButton = document.getElementById('measure-from-point');
const newMeasurementButton = document.getElementById('new-measurement');
const terrainToolButtons = [...document.querySelectorAll('[data-terrain-tool]')];
const guidedJourneyLaunchButton = document.getElementById('guided-journey-launch');
const guidedJourneyControls = document.getElementById('guided-journey-controls');
const guidedJourneyTitle = document.getElementById('guided-journey-title');
const guidedJourneyStatus = document.getElementById('guided-journey-status');
const guidedJourneyProgress = document.getElementById('guided-journey-progress');
const guidedJourneyProgressFill = document.getElementById('guided-journey-progress-fill');
const guidedJourneySpeedSelect = document.getElementById('guided-journey-speed');
const guidedJourneyLayersButton = document.getElementById('guided-journey-layers');
const guidedJourneyPauseButton = document.getElementById('guided-journey-pause');
const guidedJourneyExitButton = document.getElementById('guided-journey-exit');
const terrainAnalysisPanel = document.getElementById('terrain-analysis-panel');
const terrainAnalysisInstruction = document.getElementById('terrain-analysis-instruction');
const terrainAnalysisStepA = document.getElementById('terrain-analysis-step-a');
const terrainAnalysisStepB = document.getElementById('terrain-analysis-step-b');
const terrainAnalysisADetail = document.getElementById('terrain-analysis-a-detail');
const terrainAnalysisBDetail = document.getElementById('terrain-analysis-b-detail');
const terrainAnalysisResults = document.getElementById('terrain-analysis-results');
const terrainAnalysisProfileRegion = document.getElementById('terrain-analysis-profile-region');
const terrainAnalysisProfile = document.getElementById('terrain-analysis-profile');
const newTerrainAnalysisButton = document.getElementById('new-terrain-analysis');
const crossProfileStatus = document.getElementById('cross-profile-status');
const measurementStepA = document.getElementById('measurement-step-a');
const measurementStepB = document.getElementById('measurement-step-b');
const measurementADetail = document.getElementById('measurement-a-detail');
const measurementBDetail = document.getElementById('measurement-b-detail');
const helpButton = document.getElementById('help-button');
const fullViewButton = document.getElementById('full-view-button');
const fullViewExitButton = document.getElementById('full-view-exit');
const helpDialog = document.getElementById('help-dialog');
const helpCloseButton = document.getElementById('help-close');
const informationButton = document.getElementById('information-button');
const informationReadMoreButton = document.getElementById('information-read-more');
const overviewLayersButton = document.getElementById('overview-layers-button');
const informationDialog = document.getElementById('information-dialog');
const informationCloseButton = document.getElementById('information-close');
const copyCitationButton = document.getElementById('copy-citation');
const citationText = document.getElementById('citation-text');
const visitCount = document.getElementById('visit-count');
const layersButton = document.getElementById('layers-button');
const layersDrawer = document.getElementById('layers-drawer');
const layersCloseButton = document.getElementById('layers-close');
const layersScrim = document.getElementById('layers-scrim');
const layerListDialog = document.getElementById('layer-list-dialog');
const layerListTitle = document.getElementById('layer-list-title');
const layerListSummary = document.getElementById('layer-list-summary');
const layerListCloseButton = document.getElementById('layer-list-close');
const layerFeatureList = document.getElementById('layer-feature-list');
const surfaceLayerGroups = document.getElementById('surface-layer-groups');
await renderSurfaceLayerControls(surfaceLayerGroups);
const floodExtentLayerGroups = document.getElementById('flood-extent-layer-groups');
renderFloodExtentControls(floodExtentLayerGroups);
const elevationLegend = document.getElementById('elevation-legend');
const elevationLegendTitle = elevationLegend.querySelector('.elevation-legend-heading span:first-child');
const verticalExaggerationSelect = document.getElementById('vertical-exaggeration');
const imageryDetailMode = document.getElementById('imagery-detail-mode');
const imageryLegend = document.getElementById('imagery-legend');
const imageryLegendTitle = document.getElementById('imagery-legend-title');
const imageryLegendDetail = document.getElementById('imagery-legend-detail');
const imageryLegendScale = document.getElementById('imagery-legend-scale');
const imageryLegendRamp = document.getElementById('imagery-legend-ramp');
const imageryLegendValues = document.getElementById('imagery-legend-values');
const imageryLegendCategories = document.getElementById('imagery-legend-categories');
const imageryLegendNote = document.getElementById('imagery-legend-note');
const imageryLegendSource = document.getElementById('imagery-legend-source');
const satelliteSurfaceToggles = [...document.querySelectorAll('[data-layer-toggle^="satellite-"]')];

let pauseGuidedJourneyForOverlay = () => {};
let refreshGuidedPaletteForCamera = () => {};

helpButton.addEventListener('click', () => {
  pauseGuidedJourneyForOverlay();
  if (!helpDialog.open) helpDialog.showModal();
});
helpCloseButton.addEventListener('click', () => helpDialog.close());
helpDialog.addEventListener('click', event => {
  if (event.target === helpDialog) helpDialog.close();
});
helpDialog.addEventListener('close', () => helpButton.focus({ preventScroll: true }));

let informationReturnTarget = informationButton;
function openInformationDialog(trigger) {
  pauseGuidedJourneyForOverlay();
  informationReturnTarget = trigger;
  if (!informationDialog.open) informationDialog.showModal();
}
informationButton.addEventListener('click', () => openInformationDialog(informationButton));
informationReadMoreButton.addEventListener('click', () => openInformationDialog(informationReadMoreButton));
informationCloseButton.addEventListener('click', () => informationDialog.close());
informationDialog.addEventListener('click', event => {
  if (event.target === informationDialog) informationDialog.close();
});
informationDialog.addEventListener('close', () => informationReturnTarget.focus({ preventScroll: true }));

copyCitationButton.addEventListener('click', async () => {
  const citation = citationText.textContent.replace(/\s+/g, ' ').trim();
  try {
    await navigator.clipboard.writeText(citation);
    copyCitationButton.textContent = 'Citation copied';
  } catch {
    copyCitationButton.textContent = 'Copy unavailable';
  }
});

async function recordPageVisit() {
  const storageKey = 'nepal-flood-2026-visit-counted-v1';
  let alreadyCounted = false;
  try {
    alreadyCounted = sessionStorage.getItem(storageKey) === 'yes';
  } catch {
    alreadyCounted = false;
  }

  try {
    const response = await fetch('./api/visit', {
      method: alreadyCounted ? 'GET' : 'POST',
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload = await response.json();
    visitCount.textContent = Number(payload.count).toLocaleString('en');
    if (!alreadyCounted) {
      try {
        sessionStorage.setItem(storageKey, 'yes');
      } catch {
        // The counter remains functional when browser storage is unavailable.
      }
    }
  } catch {
    visitCount.textContent = 'Unavailable';
  }
}

recordPageVisit();

function setLayersDrawerOpen(open) {
  if (open) pauseGuidedJourneyForOverlay();
  layersDrawer.setAttribute('aria-hidden', String(!open));
  layersButton.setAttribute('aria-expanded', String(open));
  layersScrim.hidden = !open;
  if (open) layersCloseButton.focus({ preventScroll: true });
  else layersButton.focus({ preventScroll: true });
}

function setMapFullView(open) {
  document.body.classList.toggle('map-full-view', open);
  terrainPanel.dataset.fullView = String(open);
  fullViewButton.setAttribute('aria-pressed', String(open));
  fullViewExitButton.hidden = !open;
  if (open) fullViewExitButton.focus({ preventScroll: true });
  else fullViewButton.focus({ preventScroll: true });
}

fullViewButton.addEventListener('click', () => setMapFullView(true));
fullViewExitButton.addEventListener('click', () => setMapFullView(false));

layersButton.addEventListener('click', () => setLayersDrawerOpen(true));
overviewLayersButton.addEventListener('click', () => setLayersDrawerOpen(true));
layersCloseButton.addEventListener('click', () => setLayersDrawerOpen(false));
layersScrim.addEventListener('click', () => setLayersDrawerOpen(false));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && layersDrawer.getAttribute('aria-hidden') === 'false' && !layerListDialog.open) {
    setLayersDrawerOpen(false);
    return;
  }
  if (
    event.key === 'Escape' &&
    terrainPanel.dataset.fullView === 'true' &&
    !helpDialog.open &&
    !informationDialog.open &&
    !recordDialog.open &&
    !layerListDialog.open
  ) {
    setMapFullView(false);
  }
});

layerListCloseButton.addEventListener('click', () => layerListDialog.close());
layerListDialog.addEventListener('click', event => {
  if (event.target === layerListDialog) layerListDialog.close();
});

const HYPSOMETRIC_STOPS = [
  { position: 0.00, css: '#164a5b', color: new THREE.Color('#164a5b') },
  { position: 0.18, css: '#2f6f60', color: new THREE.Color('#2f6f60') },
  { position: 0.36, css: '#70935d', color: new THREE.Color('#70935d') },
  { position: 0.54, css: '#b6aa69', color: new THREE.Color('#b6aa69') },
  { position: 0.70, css: '#c08b62', color: new THREE.Color('#c08b62') },
  { position: 0.84, css: '#8f7a73', color: new THREE.Color('#8f7a73') },
  { position: 1.00, css: '#eeeef0', color: new THREE.Color('#eeeef0') },
];
let verticalExaggeration = 2;
const SATELLITE_SURFACE_METADATA_URLS = new Map(
  satelliteSurfaceToggles.map(toggle => [toggle.dataset.layerToggle, toggle.dataset.metadataUrl]),
);

async function fetchBinary(url, ArrayType = Float64Array) {
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  return new ArrayType(await response.arrayBuffer());
}

async function fetchJson(url) {
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  return response.json();
}

function scientificColor(value, target) {
  const t = Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 0;
  for (let index = 1; index < HYPSOMETRIC_STOPS.length; index += 1) {
    const right = HYPSOMETRIC_STOPS[index];
    if (t <= right.position) {
      const left = HYPSOMETRIC_STOPS[index - 1];
      const fraction = (t - left.position) / (right.position - left.position);
      return target.copy(left.color).lerp(right.color, fraction);
    }
  }
  return target.copy(HYPSOMETRIC_STOPS.at(-1).color);
}

const TERRAIN_RELIEF_LIGHTS = [
  { direction: new THREE.Vector3(-0.56, 0.78, -0.36).normalize(), weight: 0.52 },
  { direction: new THREE.Vector3(0.58, 0.79, -0.22).normalize(), weight: 0.30 },
  { direction: new THREE.Vector3(-0.18, 0.72, 0.67).normalize(), weight: 0.18 },
];

function applyTerrainReliefShading(geometry, baseColors) {
  const normals = geometry.getAttribute('normal');
  const colors = geometry.getAttribute('color');
  const landform = geometry.getAttribute('terrainLandform');
  if (!normals || !colors || baseColors.length !== colors.array.length) return;
  let relief = geometry.getAttribute('terrainRelief');
  if (!relief || relief.count !== normals.count) {
    relief = new THREE.BufferAttribute(new Float32Array(normals.count), 1);
    geometry.setAttribute('terrainRelief', relief);
  }

  for (let index = 0; index < normals.count; index += 1) {
    let normalX = normals.getX(index);
    let normalY = normals.getY(index);
    let normalZ = normals.getZ(index);
    if (normalY < 0) {
      normalX *= -1;
      normalY *= -1;
      normalZ *= -1;
    }

    let illumination = 0;
    for (const light of TERRAIN_RELIEF_LIGHTS) {
      illumination += Math.max(
        0,
        normalX * light.direction.x + normalY * light.direction.y + normalZ * light.direction.z
      ) * light.weight;
    }
    const slope = 1 - THREE.MathUtils.clamp(normalY, 0, 1);
    const shade = THREE.MathUtils.clamp(
      1 + (illumination - 0.77) * (0.78 + slope * 0.32) - slope * 0.045,
      0.70,
      1.18
    );
    const reliefTone = shade * (landform ? landform.getX(index) : 1);
    relief.setX(index, shade);
    const colorOffset = index * 3;
    colors.setXYZ(
      index,
      baseColors[colorOffset] * reliefTone,
      baseColors[colorOffset + 1] * reliefTone,
      baseColors[colorOffset + 2] * reliefTone
    );
  }
  colors.needsUpdate = true;
  relief.needsUpdate = true;
}

function terrainPaletteShaderSource() {
  const vector = color => `vec3(${color.r.toFixed(8)}, ${color.g.toFixed(8)}, ${color.b.toFixed(8)})`;
  const lines = ['vec3 guidedTerrainPalette(float value) {', '  float t = clamp(value, 0.0, 1.0);'];
  for (let index = 1; index < HYPSOMETRIC_STOPS.length; index += 1) {
    const left = HYPSOMETRIC_STOPS[index - 1];
    const right = HYPSOMETRIC_STOPS[index];
    const span = right.position - left.position;
    lines.push(
      `  if (t <= ${right.position.toFixed(8)}) {`,
      `    float f = smoothstep(0.0, 1.0, (t - ${left.position.toFixed(8)}) / ${span.toFixed(8)});`,
      `    return mix(${vector(left.color)}, ${vector(right.color)}, f);`,
      '  }'
    );
  }
  lines.push(`  return ${vector(HYPSOMETRIC_STOPS.at(-1).color)};`, '}');
  return lines.join('\n');
}

function fixed(value, digits) {
  return Number.isFinite(value) ? Number(value).toFixed(digits) : '—';
}

function svgElement(name, attributes = {}, text = null) {
  const element = document.createElementNS('http://www.w3.org/2000/svg', name);
  for (const [key, value] of Object.entries(attributes)) element.setAttribute(key, String(value));
  if (text !== null) element.textContent = text;
  return element;
}

function drawElevationProfile(svg, xValues, elevations, { title, xAxisLabel, centerValue = null }) {
  svg.replaceChildren();
  const width = 380;
  const height = 285;
  const margin = { left: 54, right: 12, top: 10, bottom: 42 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  const finiteElevations = Array.from(elevations).filter(Number.isFinite);
  const minimumElevation = Math.min(...finiteElevations);
  const maximumElevation = Math.max(...finiteElevations);
  const elevationPadding = Math.max(10, (maximumElevation - minimumElevation) * 0.05);
  const yMinimum = minimumElevation - elevationPadding;
  const yMaximum = maximumElevation + elevationPadding;
  const xMinimum = xValues[0];
  const xMaximum = xValues[xValues.length - 1] === xMinimum ? xMinimum + 1 : xValues[xValues.length - 1];
  const xScale = value => margin.left + ((value - xMinimum) / (xMaximum - xMinimum)) * innerWidth;
  const yScale = value => margin.top + ((yMaximum - value) / (yMaximum - yMinimum)) * innerHeight;

  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.append(svgElement('title', {}, title));

  for (let index = 0; index <= 4; index += 1) {
    const offset = xMinimum + (index / 4) * (xMaximum - xMinimum);
    const x = xScale(offset);
    svg.append(svgElement('line', { x1: x, y1: margin.top, x2: x, y2: margin.top + innerHeight, class: 'profile-grid' }));
    svg.append(svgElement('text', { x, y: height - 23, 'text-anchor': 'middle', class: 'profile-label' }, `${offset.toFixed(xMaximum <= 30 ? 1 : 0)}`));
  }
  for (let index = 0; index <= 4; index += 1) {
    const elevation = yMinimum + (index / 4) * (yMaximum - yMinimum);
    const y = yScale(elevation);
    svg.append(svgElement('line', { x1: margin.left, y1: y, x2: margin.left + innerWidth, y2: y, class: 'profile-grid' }));
    svg.append(svgElement('text', { x: margin.left - 7, y: y + 4, 'text-anchor': 'end', class: 'profile-label' }, `${elevation.toFixed(0)}`));
  }

  svg.append(svgElement('line', { x1: margin.left, y1: margin.top + innerHeight, x2: margin.left + innerWidth, y2: margin.top + innerHeight, class: 'profile-axis' }));
  svg.append(svgElement('line', { x1: margin.left, y1: margin.top, x2: margin.left, y2: margin.top + innerHeight, class: 'profile-axis' }));
  if (centerValue !== null && centerValue >= xMinimum && centerValue <= xMaximum) {
    svg.append(svgElement('line', { x1: xScale(centerValue), y1: margin.top, x2: xScale(centerValue), y2: margin.top + innerHeight, class: 'profile-center' }));
  }

  let path = '';
  for (let index = 0; index < elevations.length; index += 1) {
    if (!Number.isFinite(elevations[index])) continue;
    path += `${path ? 'L' : 'M'}${xScale(xValues[index]).toFixed(2)},${yScale(elevations[index]).toFixed(2)}`;
  }
  svg.append(svgElement('path', { d: path, class: 'profile-line' }));
  svg.append(svgElement('text', { x: margin.left + innerWidth / 2, y: height - 4, 'text-anchor': 'middle', class: 'profile-label' }, xAxisLabel));
  svg.append(svgElement('text', { x: 13, y: margin.top + innerHeight / 2, transform: `rotate(-90 13 ${margin.top + innerHeight / 2})`, 'text-anchor': 'middle', class: 'profile-label' }, 'Elevation (m)'));
}

function drawProfile(offsets, elevations) {
  drawElevationProfile(profileSvg, offsets, elevations, {
    title: 'Cross-valley elevation profile',
    xAxisLabel: 'Cross-valley offset (m)',
    centerValue: 0,
  });
}

function routeValue(route, columnCount, stationIndex, columnIndex) {
  return route[stationIndex * columnCount + columnIndex];
}

function createOverviewRouteMap(route, columnCount, stationCount) {
  const leaflet = window.L;
  if (!leaflet || !overviewMapContainer || !overviewContextMapContainer) return null;

  const map = leaflet.map(overviewMapContainer, {
    attributionControl: true,
    boxZoom: false,
    doubleClickZoom: false,
    dragging: false,
    keyboard: false,
    preferCanvas: true,
    scrollWheelZoom: false,
    touchZoom: false,
    zoomControl: false,
  });
  map.attributionControl.setPrefix(false);

  const contextMap = leaflet.map(overviewContextMapContainer, {
    attributionControl: false,
    boxZoom: false,
    doubleClickZoom: false,
    dragging: false,
    fadeAnimation: false,
    keyboard: false,
    preferCanvas: true,
    scrollWheelZoom: false,
    touchZoom: false,
    zoomAnimation: false,
    zoomControl: false,
    zoomSnap: 0.25,
  });

  const cartoKey = CARTO_BASEMAP_KEY.trim();
  if (cartoKey) {
    const detailTileUrl = `https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png?key=${encodeURIComponent(cartoKey)}`;
    const contextTileUrl = `https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}.png?key=${encodeURIComponent(cartoKey)}`;
    leaflet.tileLayer(detailTileUrl,
      {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        maxZoom: 20,
        subdomains: 'abcd',
      }
    ).addTo(map);
    leaflet.tileLayer(contextTileUrl, {
      maxZoom: 20,
      subdomains: 'abcd',
    }).addTo(contextMap);
  }

  const routeLatLngs = new Array(stationCount);
  for (let index = 0; index < stationCount; index += 1) {
    routeLatLngs[index] = [
      routeValue(route, columnCount, index, 3),
      routeValue(route, columnCount, index, 2),
    ];
  }

  const lineOptions = {
    interactive: false,
    lineCap: 'round',
    lineJoin: 'round',
    smoothFactor: 0,
  };
  leaflet.polyline(routeLatLngs, {
    ...lineOptions,
    color: '#fafaf8',
    opacity: 0.96,
    weight: 6,
  }).addTo(map);
  leaflet.polyline(routeLatLngs, {
    ...lineOptions,
    color: '#8b201b',
    opacity: 1,
    weight: 3,
  }).addTo(map);

  const routeBounds = leaflet.latLngBounds(routeLatLngs);
  leaflet.circleMarker(routeBounds.getCenter(), {
    color: '#ffffff',
    fill: true,
    fillColor: '#8b201b',
    fillOpacity: 1,
    interactive: false,
    opacity: 1,
    radius: 3,
    weight: 1.25,
  }).addTo(contextMap);

  const regionalBounds = leaflet.latLngBounds([
    [5.0, 58.0],
    [48.0, 115.0],
  ]);
  const fitRoute = () => {
    map.invalidateSize({ animate: false });
    map.fitBounds(routeBounds, { animate: false, padding: [12, 12] });
  };
  const fitContext = () => {
    contextMap.invalidateSize({ animate: false });
    contextMap.fitBounds(regionalBounds, { animate: false, padding: [2, 2] });
  };
  requestAnimationFrame(() => {
    fitRoute();
    fitContext();
  });
  new ResizeObserver(fitRoute).observe(overviewMapContainer);
  new ResizeObserver(fitContext).observe(overviewContextMapContainer);
  return { detail: map, context: contextMap };
}

function letterTexture(letter, color) {
  const canvas = document.createElement('canvas');
  canvas.width = 96;
  canvas.height = 96;
  const context = canvas.getContext('2d');
  context.fillStyle = '#f7f7f3';
  context.strokeStyle = color;
  context.lineWidth = 8;
  context.beginPath();
  context.arc(48, 48, 38, 0, Math.PI * 2);
  context.fill();
  context.stroke();
  context.fillStyle = '#171717';
  context.font = '600 44px Arial';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(letter, 48, 51);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function orientationLabelTexture(label, color) {
  const labelCanvas = document.createElement('canvas');
  labelCanvas.width = 96;
  labelCanvas.height = 96;
  const context = labelCanvas.getContext('2d');
  context.font = '600 40px Arial';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.lineJoin = 'round';
  context.lineWidth = 9;
  context.strokeStyle = 'rgba(243, 243, 240, 0.94)';
  context.strokeText(label, 48, 50);
  context.fillStyle = color;
  context.fillText(label, 48, 50);
  const texture = new THREE.CanvasTexture(labelCanvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function assetGlyphTexture(assetType) {
  const glyphCanvas = document.createElement('canvas');
  glyphCanvas.width = 256;
  glyphCanvas.height = 256;
  const context = glyphCanvas.getContext('2d');
  context.clearRect(0, 0, 256, 256);
  context.scale(2, 2);
  context.strokeStyle = '#111719';
  context.fillStyle = '#111719';
  context.lineWidth = 8;
  context.lineCap = 'round';
  context.lineJoin = 'round';

  if (assetType === 'building') {
    context.beginPath();
    context.moveTo(27, 58);
    context.lineTo(64, 27);
    context.lineTo(101, 58);
    context.lineTo(101, 99);
    context.lineTo(27, 99);
    context.closePath();
    context.stroke();
    context.strokeRect(55, 72, 18, 27);
  } else if (assetType === 'bridge') {
    context.beginPath();
    context.moveTo(20, 54);
    context.lineTo(108, 54);
    context.moveTo(28, 54);
    context.lineTo(28, 98);
    context.moveTo(100, 54);
    context.lineTo(100, 98);
    context.moveTo(20, 98);
    context.lineTo(108, 98);
    context.moveTo(31, 54);
    context.bezierCurveTo(42, 30, 86, 30, 97, 54);
    context.stroke();
  } else if (assetType === 'cultural_heritage') {
    context.beginPath();
    context.moveTo(18, 46);
    context.lineTo(64, 20);
    context.lineTo(110, 46);
    context.moveTo(23, 50);
    context.lineTo(105, 50);
    for (const x of [31, 49, 67, 85]) {
      context.moveTo(x, 50);
      context.lineTo(x, 97);
    }
    context.moveTo(19, 100);
    context.lineTo(109, 100);
    context.moveTo(13, 111);
    context.lineTo(115, 111);
    context.stroke();
  } else {
    context.strokeRect(25, 37, 78, 65);
    context.beginPath();
    context.moveTo(39, 37);
    context.lineTo(39, 24);
    context.lineTo(89, 24);
    context.lineTo(89, 37);
    context.moveTo(17, 102);
    context.lineTo(111, 102);
    context.stroke();
    context.beginPath();
    context.arc(64, 69, 17, 0, Math.PI * 2);
    context.moveTo(64, 52);
    context.lineTo(64, 86);
    context.moveTo(47, 69);
    context.lineTo(81, 69);
    context.stroke();
  }

  const texture = new THREE.CanvasTexture(glyphCanvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  return texture;
}

const clusterBadgeTextureCache = new Map();
function clusterBadgeTexture(count) {
  if (clusterBadgeTextureCache.has(count)) return clusterBadgeTextureCache.get(count);
  const badgeCanvas = document.createElement('canvas');
  badgeCanvas.width = 256;
  badgeCanvas.height = 256;
  const context = badgeCanvas.getContext('2d');
  context.clearRect(0, 0, 256, 256);
  context.scale(2, 2);
  context.beginPath();
  context.arc(64, 64, 55, 0, Math.PI * 2);
  context.fillStyle = '#f7f7f4';
  context.fill();
  context.lineWidth = 7;
  context.strokeStyle = '#314b53';
  context.stroke();
  context.fillStyle = '#111719';
  context.font = count > 99 ? '700 36px Arial' : '700 44px Arial';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(String(count), 64, 66);
  const texture = new THREE.CanvasTexture(badgeCanvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  clusterBadgeTextureCache.set(count, texture);
  return texture;
}

async function start() {
  const manifest = await fetchJson('./data/manifest.json');
  const specs = manifest.arrays;
  const [terrainX, terrainY, terrainZ, route, profileOffsets, damagePayload, eventEvidence, floodExtentCollections] = await Promise.all([
    fetchBinary(`./data/${specs.terrain_x.file}`),
    fetchBinary(`./data/${specs.terrain_y.file}`),
    fetchBinary(`./data/${specs.terrain_z.file}`),
    fetchBinary(`./data/${specs.route.file}`),
    fetchBinary(`./data/${specs.profile_offsets.file}`),
    fetchJson('./data/damage-features.json'),
    fetchJson('./data/event-evidence.json'),
    loadFloodExtentCollections(),
  ]);

  const rows = specs.terrain_z.shape[0];
  const columns = specs.terrain_z.shape[1];
  const stationCount = specs.route.shape[0];
  const routeColumnCount = specs.route.shape[1];
  const overviewMaps = createOverviewRouteMap(route, routeColumnCount, stationCount);
  const originX = manifest.terrain.origin_easting_m;
  const originY = manifest.terrain.origin_northing_m;
  const minimumElevation = manifest.terrain.minimum_elevation_m;
  const maximumElevation = manifest.terrain.maximum_elevation_m;
  const elevationRange = maximumElevation - minimumElevation;
  const layerVisibility = new Map([
    ...[...SATELLITE_SURFACE_METADATA_URLS.keys()].map(layerId => [layerId, false]),
    ...FLOOD_EXTENT_LAYERS.map(layer => [layer.id, layer.id !== 'extent-jaxa-alos2-20260828']),
    ['terrain', true],
    ['flow-path', true],
    ['detachment-zone', true],
    ['source', true],
    ['bridge-reference', true],
    ['building', true],
    ['bridge', true],
    ['hydropower_facility', true],
    ['cultural_heritage', true],
  ]);
  const layerIsVisible = layerId => layerVisibility.get(layerId) !== false;
  let activeSceneMode = '3d';
  let gis2dScene = null;
  let gis2dScenePromise = null;
  const displayElevationY = elevation => (elevation - minimumElevation) * verticalExaggeration;
  document.getElementById('elevation-ramp').style.background = `linear-gradient(90deg, ${HYPSOMETRIC_STOPS.map(stop => `${stop.css} ${stop.position * 100}%`).join(', ')})`;
  const elevationNumber = new Intl.NumberFormat('en', { maximumFractionDigits: 0 });
  document.getElementById('elevation-low').textContent = elevationNumber.format(minimumElevation);
  document.getElementById('elevation-mid').textContent = elevationNumber.format((minimumElevation + maximumElevation) / 2);
  document.getElementById('elevation-high').textContent = elevationNumber.format(maximumElevation);

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  logarithmicDepthBuffer: true,
  powerPreference: 'high-performance',
});
  const settledRendererPixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
  const movingRendererPixelRatio = Math.min(settledRendererPixelRatio, 0.9);
  renderer.setPixelRatio(settledRendererPixelRatio);
  const movementPerformance = new URLSearchParams(window.location.search).has('perf')
    ? {
        startedAt: null,
        inputAt: null,
        previousFrameAt: null,
        inputToFirstFrameMs: null,
        frameIntervals: [],
        renderCosts: [],
        detailUpdateCosts: [],
        drawCalls: [],
        triangles: [],
        visibleGeometry: null,
      }
    : null;

  function performanceSampleStats(samples) {
    if (!samples.length) return null;
    const sorted = [...samples].sort((left, right) => left - right);
    const percentile = value => sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * value))];
    return {
      mean: samples.reduce((sum, value) => sum + value, 0) / samples.length,
      median: percentile(0.5),
      p95: percentile(0.95),
      p99: percentile(0.99),
      maximum: sorted[sorted.length - 1],
    };
  }

  function visibleGeometryBreakdown() {
    const entries = [];
    scene.traverseVisible(object => {
      if (!object.isMesh || !object.geometry) return;
      const indexCount = object.geometry.index?.count;
      const positionCount = object.geometry.getAttribute('position')?.count ?? 0;
      const trianglesPerInstance = indexCount ? indexCount / 3 : positionCount / 3;
      const instances = object.isInstancedMesh ? object.count : 1;
      const triangles = trianglesPerInstance * instances;
      if (triangles <= 0) return;
      entries.push({
        name: object.name || object.parent?.name || object.type,
        triangles,
        instances,
      });
    });
    return entries.sort((left, right) => right.triangles - left.triangles).slice(0, 16);
  }

  function beginMovementPerformanceSample() {
    if (!movementPerformance) return;
    movementPerformance.startedAt = performance.now();
    movementPerformance.inputAt = movementPerformance.startedAt;
    movementPerformance.previousFrameAt = null;
    movementPerformance.inputToFirstFrameMs = null;
    movementPerformance.frameIntervals.length = 0;
    movementPerformance.renderCosts.length = 0;
    movementPerformance.detailUpdateCosts.length = 0;
    movementPerformance.drawCalls.length = 0;
    movementPerformance.triangles.length = 0;
    movementPerformance.visibleGeometry = null;
  }

  function recordMovementPerformanceFrame(time) {
    if (!movementPerformance || movementPerformance.startedAt === null) return;
    if (movementPerformance.previousFrameAt === null) {
      movementPerformance.inputToFirstFrameMs = Math.max(0, time - movementPerformance.inputAt);
    } else {
      movementPerformance.frameIntervals.push(time - movementPerformance.previousFrameAt);
    }
    movementPerformance.previousFrameAt = time;
  }

  function finishMovementPerformanceSample() {
    if (!movementPerformance || movementPerformance.startedAt === null) return;
    const frameStats = performanceSampleStats(movementPerformance.frameIntervals);
    const report = {
      durationMs: performance.now() - movementPerformance.startedAt,
      frames: movementPerformance.frameIntervals.length + 1,
      averageFps: frameStats ? 1000 / frameStats.mean : null,
      medianFrameMs: frameStats?.median ?? null,
      p95FrameMs: frameStats?.p95 ?? null,
      p99FrameMs: frameStats?.p99 ?? null,
      longestFrameMs: frameStats?.maximum ?? null,
      framesOver20Ms: movementPerformance.frameIntervals.filter(value => value > 20).length,
      framesOver33Ms: movementPerformance.frameIntervals.filter(value => value > 33.34).length,
      inputToFirstFrameMs: movementPerformance.inputToFirstFrameMs,
      renderCpuMs: performanceSampleStats(movementPerformance.renderCosts),
      cameraDetailCpuMs: performanceSampleStats(movementPerformance.detailUpdateCosts),
      movingPixelRatio: movingRendererPixelRatio,
      drawCalls: performanceSampleStats(movementPerformance.drawCalls),
      triangles: performanceSampleStats(movementPerformance.triangles),
      visibleGeometry: movementPerformance.visibleGeometry,
      points: renderer.info.render.points,
    };
    console.info('[3d-performance]', JSON.stringify(report));
    movementPerformance.startedAt = null;
  }
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const maximumTextureAnisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xe8e8e4);
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 500000);
  camera.up.set(0, 1, 0);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = false;
  controls.screenSpacePanning = true;
  controls.minDistance = 0;
  controls.maxDistance = 350000;
  const recordState = { anchor: null, geographicAnchor: null, mode: null, cluster: null };
  const recordProjection = new THREE.Vector3();

  const orientationRenderer = new THREE.WebGLRenderer({
    canvas: orientationCanvas,
    antialias: true,
    alpha: true,
  });
  orientationRenderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  orientationRenderer.outputColorSpace = THREE.SRGBColorSpace;
  orientationRenderer.setClearColor(0x000000, 0);
  const orientationScene = new THREE.Scene();
  const orientationCamera = new THREE.OrthographicCamera(-1.55, 1.55, 1.55, -1.55, 0.1, 10);
  orientationCamera.position.set(0, 0, 4);
  const orientationGroup = new THREE.Group();
  orientationScene.add(orientationGroup);

  function addOrientationAxis(direction, color, label) {
    const arrow = new THREE.ArrowHelper(direction, new THREE.Vector3(), 1, color, 0.2, 0.1);
    orientationGroup.add(arrow);
    const labelSprite = new THREE.Sprite(new THREE.SpriteMaterial({
      map: orientationLabelTexture(label, `#${color.toString(16).padStart(6, '0')}`),
      transparent: true,
      depthTest: false,
      depthWrite: false,
    }));
    labelSprite.position.copy(direction).multiplyScalar(1.2);
    labelSprite.scale.set(0.6, 0.6, 1);
    labelSprite.renderOrder = 10;
    orientationGroup.add(labelSprite);
  }

  addOrientationAxis(new THREE.Vector3(1, 0, 0), 0x9b5c28, 'E');
  addOrientationAxis(new THREE.Vector3(0, 0, -1), 0x005b76, 'N');
  addOrientationAxis(new THREE.Vector3(0, 1, 0), 0x555b5e, 'Z');
  orientationGroup.add(new THREE.Mesh(
    new THREE.SphereGeometry(0.055, 14, 10),
    new THREE.MeshBasicMaterial({ color: 0x171717 })
  ));

  scene.add(new THREE.HemisphereLight(0xffffff, 0x5c6570, 1.65));
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.7);
  directionalLight.position.set(-10000, 18000, 12000);
  scene.add(directionalLight);

  const positions = new Float32Array(rows * columns * 3);
  const colors = new Float32Array(rows * columns * 3);
  const terrainElevationOffsets = new Float32Array(rows * columns);
  const terrainLandform = new Float32Array(rows * columns);
  const valid = new Uint8Array(rows * columns);
  const terrainColor = new THREE.Color();
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const sourceIndex = row * columns + column;
      const positionIndex = sourceIndex * 3;
      const elevation = terrainZ[sourceIndex];
      valid[sourceIndex] = Number.isFinite(elevation) ? 1 : 0;
      terrainElevationOffsets[sourceIndex] = Number.isFinite(elevation) ? elevation - minimumElevation : 0;
      positions[positionIndex] = terrainX[column] - originX;
      positions[positionIndex + 1] = displayElevationY(Number.isFinite(elevation) ? elevation : minimumElevation);
      positions[positionIndex + 2] = -(terrainY[row] - originY);
      scientificColor((elevation - minimumElevation) / elevationRange, terrainColor);
      colors[positionIndex] = terrainColor.r;
      colors[positionIndex + 1] = terrainColor.g;
      colors[positionIndex + 2] = terrainColor.b;
    }
  }
  const landformRadius = 2;
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const sourceIndex = row * columns + column;
      if (!valid[sourceIndex]) {
        terrainLandform[sourceIndex] = 1;
        continue;
      }
      let nearbyElevation = 0;
      let nearbyCount = 0;
      const rowStart = Math.max(0, row - landformRadius);
      const rowEnd = Math.min(rows - 1, row + landformRadius);
      const columnStart = Math.max(0, column - landformRadius);
      const columnEnd = Math.min(columns - 1, column + landformRadius);
      for (let nearbyRow = rowStart; nearbyRow <= rowEnd; nearbyRow += 1) {
        for (let nearbyColumn = columnStart; nearbyColumn <= columnEnd; nearbyColumn += 1) {
          if (nearbyRow === row && nearbyColumn === column) continue;
          const nearbyIndex = nearbyRow * columns + nearbyColumn;
          if (!valid[nearbyIndex]) continue;
          nearbyElevation += terrainZ[nearbyIndex];
          nearbyCount += 1;
        }
      }
      const localResidual = nearbyCount > 0
        ? terrainZ[sourceIndex] - nearbyElevation / nearbyCount
        : 0;
      terrainLandform[sourceIndex] = 1 + Math.tanh(localResidual / 72) * 0.15;
    }
  }
  const baseTerrainColors = colors.slice();

  const maximumIndexCount = (rows - 1) * (columns - 1) * 6;
  const IndexArray = rows * columns > 65535 ? Uint32Array : Uint16Array;
  const terrainIndices = new IndexArray(maximumIndexCount);
  let terrainIndexCount = 0;
  for (let row = 0; row < rows - 1; row += 1) {
    for (let column = 0; column < columns - 1; column += 1) {
      const a = row * columns + column;
      const b = a + 1;
      const c = a + columns;
      const d = c + 1;
      if (valid[a] && valid[b] && valid[c]) {
        terrainIndices[terrainIndexCount++] = a;
        terrainIndices[terrainIndexCount++] = c;
        terrainIndices[terrainIndexCount++] = b;
      }
      if (valid[b] && valid[c] && valid[d]) {
        terrainIndices[terrainIndexCount++] = b;
        terrainIndices[terrainIndexCount++] = c;
        terrainIndices[terrainIndexCount++] = d;
      }
    }
  }

  const terrainGeometry = new THREE.BufferGeometry();
  terrainGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  terrainGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  terrainGeometry.setAttribute('terrainElevation', new THREE.BufferAttribute(terrainElevationOffsets, 1));
  terrainGeometry.setAttribute('terrainLandform', new THREE.BufferAttribute(terrainLandform, 1));
  terrainGeometry.setIndex(new THREE.BufferAttribute(terrainIndices.subarray(0, terrainIndexCount), 1));
  terrainGeometry.computeVertexNormals();
  terrainGeometry.computeBoundingSphere();
  applyTerrainReliefShading(terrainGeometry, baseTerrainColors);
  const terrainMaterial = new THREE.MeshBasicMaterial({
    vertexColors: true,
    side: THREE.DoubleSide,
    toneMapped: false,
  });
  const terrainPaletteUniforms = {
    blend: { value: 0 },
    minimum: { value: 0 },
    range: { value: elevationRange },
  };
  const guidedTerrainMaterial = terrainMaterial.clone();
  const terrainPaletteFunction = terrainPaletteShaderSource();
  guidedTerrainMaterial.onBeforeCompile = shader => {
    shader.uniforms.uGuidedTerrainBlend = terrainPaletteUniforms.blend;
    shader.uniforms.uGuidedTerrainMinimum = terrainPaletteUniforms.minimum;
    shader.uniforms.uGuidedTerrainRange = terrainPaletteUniforms.range;
    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        `#include <common>
attribute float terrainElevation;
attribute float terrainRelief;
attribute float terrainLandform;
varying float vGuidedTerrainElevation;
varying float vGuidedTerrainRelief;
varying float vGuidedTerrainLandform;`
      )
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
vGuidedTerrainElevation = terrainElevation;
vGuidedTerrainRelief = terrainRelief;
vGuidedTerrainLandform = terrainLandform;`
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
uniform float uGuidedTerrainBlend;
uniform float uGuidedTerrainMinimum;
uniform float uGuidedTerrainRange;
varying float vGuidedTerrainElevation;
varying float vGuidedTerrainRelief;
varying float vGuidedTerrainLandform;
${terrainPaletteFunction}`
      )
      .replace(
        '#include <color_fragment>',
        `#include <color_fragment>
  if (uGuidedTerrainBlend > 0.001) {
    float guidedTerrainT = (vGuidedTerrainElevation - uGuidedTerrainMinimum) / max(uGuidedTerrainRange, 1.0);
    float guidedTerrainTone = clamp(vGuidedTerrainRelief * vGuidedTerrainLandform, 0.62, 1.30);
    vec3 guidedTerrainColour = guidedTerrainPalette(guidedTerrainT) * guidedTerrainTone;
    diffuseColor.rgb = mix(diffuseColor.rgb, guidedTerrainColour, uGuidedTerrainBlend);
  }`
      );
  };
  guidedTerrainMaterial.customProgramCacheKey = () => 'guided-local-terrain-palette-r185-v4';
  const terrainMesh = new THREE.Mesh(terrainGeometry, terrainMaterial);
  terrainMesh.name = 'DEM terrain';
  scene.add(terrainMesh);


  const navigationTerrainStep = 4;
  function navigationSampleIndices(length) {
    const indices = [];
    for (let index = 0; index < length; index += navigationTerrainStep) indices.push(index);
    if (indices.at(-1) !== length - 1) indices.push(length - 1);
    return indices;
  }
  const navigationRows = navigationSampleIndices(rows);
  const navigationColumns = navigationSampleIndices(columns);
  const navigationVertexCount = navigationRows.length * navigationColumns.length;
  const navigationPositions = new Float32Array(navigationVertexCount * 3);
  const navigationColors = new Float32Array(navigationVertexCount * 3);
  const navigationBaseColors = new Float32Array(navigationVertexCount * 3);
  const navigationElevationOffsets = new Float32Array(navigationVertexCount);
  const navigationLandform = new Float32Array(navigationVertexCount);
  const navigationValid = new Uint8Array(navigationVertexCount);
  const navigationTerrainSourceIndices = new Uint32Array(navigationVertexCount);
  for (let row = 0; row < navigationRows.length; row += 1) {
    for (let column = 0; column < navigationColumns.length; column += 1) {
      const navigationIndex = row * navigationColumns.length + column;
      const sourceIndex = navigationRows[row] * columns + navigationColumns[column];
      navigationTerrainSourceIndices[navigationIndex] = sourceIndex;
      navigationValid[navigationIndex] = valid[sourceIndex];
      navigationPositions.set(positions.subarray(sourceIndex * 3, sourceIndex * 3 + 3), navigationIndex * 3);
      navigationElevationOffsets[navigationIndex] = terrainElevationOffsets[sourceIndex];
      navigationLandform[navigationIndex] = terrainLandform[sourceIndex];
      navigationBaseColors.set(baseTerrainColors.subarray(sourceIndex * 3, sourceIndex * 3 + 3), navigationIndex * 3);
      navigationColors.set(baseTerrainColors.subarray(sourceIndex * 3, sourceIndex * 3 + 3), navigationIndex * 3);
    }
  }
  const maximumNavigationIndexCount = (navigationRows.length - 1) * (navigationColumns.length - 1) * 6;
  const NavigationIndexArray = navigationVertexCount > 65535 ? Uint32Array : Uint16Array;
  const navigationIndices = new NavigationIndexArray(maximumNavigationIndexCount);
  let navigationIndexCount = 0;
  for (let row = 0; row < navigationRows.length - 1; row += 1) {
    for (let column = 0; column < navigationColumns.length - 1; column += 1) {
      const a = row * navigationColumns.length + column;
      const b = a + 1;
      const c = a + navigationColumns.length;
      const d = c + 1;
      if (navigationValid[a] && navigationValid[b] && navigationValid[c]) {
        navigationIndices[navigationIndexCount++] = a;
        navigationIndices[navigationIndexCount++] = c;
        navigationIndices[navigationIndexCount++] = b;
      }
      if (navigationValid[b] && navigationValid[c] && navigationValid[d]) {
        navigationIndices[navigationIndexCount++] = b;
        navigationIndices[navigationIndexCount++] = c;
        navigationIndices[navigationIndexCount++] = d;
      }
    }
  }
  const navigationTerrainGeometry = new THREE.BufferGeometry();
  navigationTerrainGeometry.setAttribute('position', new THREE.BufferAttribute(navigationPositions, 3));
  navigationTerrainGeometry.setAttribute('color', new THREE.BufferAttribute(navigationColors, 3));
  navigationTerrainGeometry.setAttribute('terrainElevation', new THREE.BufferAttribute(navigationElevationOffsets, 1));
  navigationTerrainGeometry.setAttribute('terrainLandform', new THREE.BufferAttribute(navigationLandform, 1));
  navigationTerrainGeometry.setIndex(new THREE.BufferAttribute(navigationIndices.subarray(0, navigationIndexCount), 1));
  navigationTerrainGeometry.computeVertexNormals();
  navigationTerrainGeometry.computeBoundingSphere();
  applyTerrainReliefShading(navigationTerrainGeometry, navigationBaseColors);
  const navigationTerrainMesh = new THREE.Mesh(navigationTerrainGeometry, terrainMaterial);
  navigationTerrainMesh.name = 'DEM terrain · navigation detail';
  navigationTerrainMesh.visible = false;
  scene.add(navigationTerrainMesh);

  const satelliteSurfaceState = { mesh: null, navigationMesh: null, activeLayerId: null, metadata: null, requestSequence: 0 };
  let nativeImageryTileManager = null;

  function updateSurfaceLegend(metadata = null) {
    const satelliteVisible = Boolean(metadata);
    elevationLegend.hidden = satelliteVisible || !layerIsVisible('terrain');
    imageryLegend.hidden = !satelliteVisible;
    imageryLegendScale.hidden = true;
    imageryLegendCategories.hidden = true;
    imageryLegendNote.hidden = true;
    imageryLegendValues.replaceChildren();
    imageryLegendCategories.replaceChildren();
    if (!metadata) return;
    imageryLegendTitle.textContent = metadata.title;
    imageryLegendDetail.textContent = metadata.detail;
    imageryLegendSource.textContent = `${metadata.provider} / ${metadata.catalog}`;
    imageryLegendSource.href = metadata.source_url;
    const legend = metadata.legend;
    if (!legend) return;
    if (legend.type === 'continuous' && Array.isArray(legend.stops) && legend.stops.length > 1) {
      const minimum = Number(legend.stops[0][0]);
      const maximum = Number(legend.stops.at(-1)[0]);
      const span = Math.max(maximum - minimum, Number.EPSILON);
      imageryLegendRamp.style.background = `linear-gradient(90deg, ${legend.stops.map(([value, colour]) => `${colour} ${((Number(value) - minimum) / span) * 100}%`).join(', ')})`;
      for (const value of legend.values || []) imageryLegendValues.append(Object.assign(document.createElement('span'), { textContent: value }));
      imageryLegendScale.hidden = false;
    } else if (legend.type === 'categorical' && Array.isArray(legend.items)) {
      for (const [label, colour] of legend.items) {
        const item = document.createElement('span');
        item.className = 'imagery-legend-category';
        const swatch = document.createElement('i');
        swatch.style.background = colour;
        item.append(swatch, document.createTextNode(label));
        imageryLegendCategories.append(item);
      }
      imageryLegendCategories.hidden = false;
    }
    if (legend.note) {
      imageryLegendNote.textContent = legend.note;
      imageryLegendNote.hidden = false;
    }
  }

  function loadThreeTexture(url) {
    return new Promise((resolve, reject) => {
      new THREE.TextureLoader().load(url, resolve, undefined, reject);
    });
  }

  function createSatelliteSurfaceMesh(metadata, texture) {
    const [west, south, east, north] = metadata.bounds_utm_32645;
    const includedColumns = [];
    const includedRows = [];
    for (let column = 0; column < columns; column += 1) {
      if (terrainX[column] >= west && terrainX[column] <= east) includedColumns.push(column);
    }
    for (let row = 0; row < rows; row += 1) {
      if (terrainY[row] >= south && terrainY[row] <= north) includedRows.push(row);
    }
    if (includedColumns.length < 2 || includedRows.length < 2) {
      throw new Error('Imagery footprint does not intersect the displayed terrain.');
    }

    const columnStart = includedColumns[0];
    const columnEnd = includedColumns.at(-1);
    const rowStart = includedRows[0];
    const rowEnd = includedRows.at(-1);
    const overlayColumns = columnEnd - columnStart + 1;
    const overlayRows = rowEnd - rowStart + 1;
    const overlayVertexCount = overlayRows * overlayColumns;
    const overlayPositions = new Float32Array(overlayVertexCount * 3);
    const overlayUvs = new Float32Array(overlayVertexCount * 2);
    const overlayValid = new Uint8Array(overlayVertexCount);
    const overlayTerrainIndices = new Uint32Array(overlayVertexCount);
    for (let row = 0; row < overlayRows; row += 1) {
      for (let column = 0; column < overlayColumns; column += 1) {
        const terrainRow = rowStart + row;
        const terrainColumn = columnStart + column;
        const terrainIndex = terrainRow * columns + terrainColumn;
        const overlayIndex = row * overlayColumns + column;
        overlayPositions.set(positions.subarray(terrainIndex * 3, terrainIndex * 3 + 3), overlayIndex * 3);
        overlayUvs[overlayIndex * 2] = (terrainX[terrainColumn] - west) / (east - west);
        overlayUvs[overlayIndex * 2 + 1] = (terrainY[terrainRow] - south) / (north - south);
        overlayValid[overlayIndex] = valid[terrainIndex];
        overlayTerrainIndices[overlayIndex] = terrainIndex;
      }
    }

    const maximumOverlayIndexCount = (overlayRows - 1) * (overlayColumns - 1) * 6;
    const OverlayIndexArray = overlayVertexCount > 65535 ? Uint32Array : Uint16Array;
    const overlayIndices = new OverlayIndexArray(maximumOverlayIndexCount);
    let overlayIndexCount = 0;
    for (let row = 0; row < overlayRows - 1; row += 1) {
      for (let column = 0; column < overlayColumns - 1; column += 1) {
        const a = row * overlayColumns + column;
        const b = a + 1;
        const c = a + overlayColumns;
        const d = c + 1;
        if (overlayValid[a] && overlayValid[b] && overlayValid[c]) {
          overlayIndices[overlayIndexCount++] = a;
          overlayIndices[overlayIndexCount++] = c;
          overlayIndices[overlayIndexCount++] = b;
        }
        if (overlayValid[b] && overlayValid[c] && overlayValid[d]) {
          overlayIndices[overlayIndexCount++] = b;
          overlayIndices[overlayIndexCount++] = c;
          overlayIndices[overlayIndexCount++] = d;
        }
      }
    }

    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = maximumTextureAnisotropy;
    texture.generateMipmaps = true;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;

    const overlayGeometry = new THREE.BufferGeometry();
    overlayGeometry.setAttribute('position', new THREE.BufferAttribute(overlayPositions, 3));
    overlayGeometry.setAttribute('uv', new THREE.BufferAttribute(overlayUvs, 2));
    overlayGeometry.setIndex(new THREE.BufferAttribute(overlayIndices.subarray(0, overlayIndexCount), 1));
    overlayGeometry.userData.terrainIndices = overlayTerrainIndices;
    overlayGeometry.userData.gridRows = overlayRows;
    overlayGeometry.userData.gridColumns = overlayColumns;
    overlayGeometry.userData.valid = overlayValid;
    overlayGeometry.computeBoundingSphere();
    const overlayMaterial = new THREE.MeshBasicMaterial({
      map: texture,
      alphaTest: 0.02,
      side: THREE.DoubleSide,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -4,
    });
    const overlayMesh = new THREE.Mesh(overlayGeometry, overlayMaterial);
    overlayMesh.name = metadata.title;
    overlayMesh.renderOrder = 1;
    overlayMesh.visible = false;
    return overlayMesh;
  }

  function createSatelliteNavigationSurfaceMesh(surfaceMesh) {
    const sourceGeometry = surfaceMesh.geometry;
    const sourcePositions = sourceGeometry.getAttribute('position');
    const sourceUvs = sourceGeometry.getAttribute('uv');
    const sourceTerrainIndices = sourceGeometry.userData.terrainIndices;
    const sourceValid = sourceGeometry.userData.valid;
    const sourceRows = sourceGeometry.userData.gridRows;
    const sourceColumns = sourceGeometry.userData.gridColumns;
    const sampledRows = navigationSampleIndices(sourceRows);
    const sampledColumns = navigationSampleIndices(sourceColumns);
    const vertexCount = sampledRows.length * sampledColumns.length;
    const positions = new Float32Array(vertexCount * 3);
    const uvs = new Float32Array(vertexCount * 2);
    const sampledValid = new Uint8Array(vertexCount);
    const terrainIndices = new Uint32Array(vertexCount);
    for (let row = 0; row < sampledRows.length; row += 1) {
      for (let column = 0; column < sampledColumns.length; column += 1) {
        const destinationIndex = row * sampledColumns.length + column;
        const sourceIndex = sampledRows[row] * sourceColumns + sampledColumns[column];
        positions.set(sourcePositions.array.subarray(sourceIndex * 3, sourceIndex * 3 + 3), destinationIndex * 3);
        uvs.set(sourceUvs.array.subarray(sourceIndex * 2, sourceIndex * 2 + 2), destinationIndex * 2);
        sampledValid[destinationIndex] = sourceValid[sourceIndex];
        terrainIndices[destinationIndex] = sourceTerrainIndices[sourceIndex];
      }
    }
    const maximumIndexCount = (sampledRows.length - 1) * (sampledColumns.length - 1) * 6;
    const IndexArray = vertexCount > 65535 ? Uint32Array : Uint16Array;
    const indices = new IndexArray(maximumIndexCount);
    let indexCount = 0;
    for (let row = 0; row < sampledRows.length - 1; row += 1) {
      for (let column = 0; column < sampledColumns.length - 1; column += 1) {
        const a = row * sampledColumns.length + column;
        const b = a + 1;
        const c = a + sampledColumns.length;
        const d = c + 1;
        if (sampledValid[a] && sampledValid[b] && sampledValid[c]) {
          indices[indexCount++] = a;
          indices[indexCount++] = c;
          indices[indexCount++] = b;
        }
        if (sampledValid[b] && sampledValid[c] && sampledValid[d]) {
          indices[indexCount++] = b;
          indices[indexCount++] = c;
          indices[indexCount++] = d;
        }
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    geometry.setIndex(new THREE.BufferAttribute(indices.subarray(0, indexCount), 1));
    geometry.userData.terrainIndices = terrainIndices;
    geometry.computeBoundingSphere();
    const mesh = new THREE.Mesh(geometry, surfaceMesh.material);
    mesh.name = `${surfaceMesh.name} · navigation detail`;
    mesh.renderOrder = surfaceMesh.renderOrder;
    mesh.visible = false;
    return mesh;
  }

  function disposeSatelliteNavigationSurfaceMesh(mesh) {
    if (!mesh) return;
    if (mesh.parent) mesh.parent.remove(mesh);
    mesh.geometry.dispose();
  }

  function disposeSatelliteSurfaceMesh(mesh) {
    if (!mesh) return;
    if (mesh.parent) mesh.parent.remove(mesh);
    mesh.geometry.dispose();
    if (mesh.material.map) mesh.material.map.dispose();
    mesh.material.dispose();
  }

  function clearActiveSatelliteSurface() {
    nativeImageryTileManager?.setSurface(null);
    disposeSatelliteNavigationSurfaceMesh(satelliteSurfaceState.navigationMesh);
    disposeSatelliteSurfaceMesh(satelliteSurfaceState.mesh);
    satelliteSurfaceState.mesh = null;
    satelliteSurfaceState.navigationMesh = null;
    satelliteSurfaceState.activeLayerId = null;
    satelliteSurfaceState.metadata = null;
    void gis2dScene?.setSurface(null, null, imageryDetailMode.value);
  }

  async function loadSatelliteSurface(layerId) {
    const metadataUrl = SATELLITE_SURFACE_METADATA_URLS.get(layerId);
    const metadata = await fetchJson(metadataUrl);
    const texture = await loadThreeTexture(metadata.texture_url);
    const mesh = createSatelliteSurfaceMesh(metadata, texture);
    return { metadata, mesh, navigationMesh: createSatelliteNavigationSurfaceMesh(mesh) };
  }

  async function setSatelliteSurfaceVisibility(layerId, visible) {
    const toggle = satelliteSurfaceToggles.find(candidate => candidate.dataset.layerToggle === layerId);
    if (!visible) {
      satelliteSurfaceState.requestSequence += 1;
      layerVisibility.set(layerId, false);
      if (toggle) toggle.checked = false;
      if (satelliteSurfaceState.activeLayerId === layerId) {
        clearActiveSatelliteSurface();
        updateSurfaceLegend();
        loadStatus.hidden = true;
      }
      render();
      return;
    }

    const requestSequence = ++satelliteSurfaceState.requestSequence;
    for (const surfaceToggle of satelliteSurfaceToggles) {
      const candidateLayerId = surfaceToggle.dataset.layerToggle;
      const selected = candidateLayerId === layerId;
      surfaceToggle.checked = selected;
      layerVisibility.set(candidateLayerId, selected);
    }
    clearActiveSatelliteSurface();
    updateSurfaceLegend();
    if (toggle) toggle.disabled = true;
    loadStatus.textContent = 'Loading satellite imagery…';
    loadStatus.hidden = false;
    try {
      const result = await loadSatelliteSurface(layerId);
      if (requestSequence !== satelliteSurfaceState.requestSequence || !layerVisibility.get(layerId)) {
        disposeSatelliteNavigationSurfaceMesh(result.navigationMesh);
        disposeSatelliteSurfaceMesh(result.mesh);
        return;
      }
      satelliteSurfaceState.mesh = result.mesh;
      satelliteSurfaceState.navigationMesh = result.navigationMesh;
      satelliteSurfaceState.activeLayerId = layerId;
      satelliteSurfaceState.metadata = result.metadata;
      result.mesh.visible = true;
      scene.add(result.mesh);
      scene.add(result.navigationMesh);
      nativeImageryTileManager?.setSurface(result.metadata);
      void gis2dScene?.setSurface(layerId, result.metadata, imageryDetailMode.value);
      updateSurfaceLegend(result.metadata);
      loadStatus.hidden = true;
    } catch (error) {
      if (requestSequence !== satelliteSurfaceState.requestSequence) return;
      layerVisibility.set(layerId, false);
      if (toggle) toggle.checked = false;
      clearActiveSatelliteSurface();
      updateSurfaceLegend();
      loadStatus.textContent = `Satellite imagery unavailable: ${error.message}`;
      loadStatus.hidden = false;
    } finally {
      if (toggle) toggle.disabled = false;
      render();
    }
  }

  function terrainCellIndex(values, value) {
    const lastIndex = values.length - 1;
    const ascending = values[lastIndex] >= values[0];
    if ((ascending && value <= values[0]) || (!ascending && value >= values[0])) return 0;
    if ((ascending && value >= values[lastIndex]) || (!ascending && value <= values[lastIndex])) return lastIndex - 1;
    let lower = 0;
    let upper = lastIndex;
    while (upper - lower > 1) {
      const middle = (lower + upper) >> 1;
      if ((values[middle] <= value) === ascending) lower = middle;
      else upper = middle;
    }
    return lower;
  }

  function renderedTerrainElevation(easting, northing) {
    const column = terrainCellIndex(terrainX, easting);
    const row = terrainCellIndex(terrainY, northing);
    const tx = (easting - terrainX[column]) / (terrainX[column + 1] - terrainX[column]);
    const ty = (northing - terrainY[row]) / (terrainY[row + 1] - terrainY[row]);
    const a = terrainZ[row * columns + column];
    const b = terrainZ[row * columns + column + 1];
    const c = terrainZ[(row + 1) * columns + column];
    const d = terrainZ[(row + 1) * columns + column + 1];
    if (![a, b, c, d].every(Number.isFinite)) return NaN;
    if (tx + ty <= 1) return a + (b - a) * tx + (c - a) * ty;
    return d + (c - d) * (1 - tx) + (b - d) * (1 - ty);
  }

  const detachmentZoneFeature = eventEvidence.features.find(
    feature => feature.layer_id === 'detachment-zone'
  );
  const detachmentZoneGroup = new THREE.Group();
  detachmentZoneGroup.name = 'UNOSAT detachment zone';
  const detachmentZoneMaterials = [
    new LineMaterial({ color: 0xf4f1eb, linewidth: 7.5, depthTest: true, depthWrite: false }),
    new LineMaterial({ color: 0x9b3c2f, linewidth: 3.5, depthTest: true, depthWrite: false }),
  ];
  const detachmentZoneLines = detachmentZoneMaterials.map(material => {
    const geometry = new LineGeometry();
    const line = new Line2(geometry, material);
    line.renderOrder = 5;
    detachmentZoneGroup.add(line);
    return line;
  });
  function updateDetachmentZoneGeometry() {
    const ring = detachmentZoneFeature?.coordinates_utm_32645?.[0] ?? [];
    const positions = [];
    for (const [easting, northing] of ring) {
      const elevation = renderedTerrainElevation(Number(easting), Number(northing));
      positions.push(
        Number(easting) - originX,
        displayElevationY(Number.isFinite(elevation) ? elevation : minimumElevation) + 24,
        -(Number(northing) - originY)
      );
    }
    for (const line of detachmentZoneLines) {
      line.geometry.setPositions(positions);
      line.geometry.computeBoundingSphere();
    }
    detachmentZoneGroup.visible = positions.length > 0 && layerIsVisible('detachment-zone');
  }
  updateDetachmentZoneGeometry();
  scene.add(detachmentZoneGroup);

  const floodExtentTerrainBounds = {
    minimumEasting: Math.min(terrainX[0], terrainX[terrainX.length - 1]),
    maximumEasting: Math.max(terrainX[0], terrainX[terrainX.length - 1]),
    minimumNorthing: Math.min(terrainY[0], terrainY[terrainY.length - 1]),
    maximumNorthing: Math.max(terrainY[0], terrainY[terrainY.length - 1]),
  };
  const floodExtent3DLayers = new Map();
  const floodExtent3DMaterials = [];

  function collectFloodExtentRings(geometry, rings) {
    if (!geometry) return;
    if (geometry.type === 'Polygon') {
      rings.push(...geometry.coordinates);
      return;
    }
    if (geometry.type === 'MultiPolygon') {
      for (const polygon of geometry.coordinates) rings.push(...polygon);
      return;
    }
    if (geometry.type === 'GeometryCollection') {
      for (const child of geometry.geometries ?? []) collectFloodExtentRings(child, rings);
    }
  }

  function floodExtentRings(geojson) {
    const rings = [];
    if (geojson?.type === 'FeatureCollection') {
      for (const feature of geojson.features ?? []) collectFloodExtentRings(feature.geometry, rings);
    } else if (geojson?.type === 'Feature') {
      collectFloodExtentRings(geojson.geometry, rings);
    } else {
      collectFloodExtentRings(geojson, rings);
    }
    return rings;
  }

  function updateFloodExtent3DGeometry() {
    for (const [layerId, layer] of floodExtent3DLayers) {
      const positions = [];
      for (const ring of layer.rings) {
        let previousPosition = null;
        for (const coordinate of ring) {
          const longitude = Number(coordinate?.[0]);
          const latitude = Number(coordinate?.[1]);
          if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) {
            previousPosition = null;
            continue;
          }
          const [easting, northing] = wgs84ToUtm45N(longitude, latitude);
          const insideTerrain = easting >= floodExtentTerrainBounds.minimumEasting
            && easting <= floodExtentTerrainBounds.maximumEasting
            && northing >= floodExtentTerrainBounds.minimumNorthing
            && northing <= floodExtentTerrainBounds.maximumNorthing;
          if (!insideTerrain) {
            previousPosition = null;
            continue;
          }
          const elevation = renderedTerrainElevation(easting, northing);
          if (!Number.isFinite(elevation)) {
            previousPosition = null;
            continue;
          }
          const position = [
            easting - originX,
            displayElevationY(elevation) + 28,
            -(northing - originY),
          ];
          if (previousPosition) positions.push(...previousPosition, ...position);
          previousPosition = position;
        }
      }
      layer.geometry.setPositions(positions);
      layer.geometry.computeBoundingSphere();
      layer.segmentCount = positions.length / 6;
      layer.group.visible = layer.segmentCount > 0 && layerIsVisible(layerId);
    }
  }

  for (const collection of floodExtentCollections) {
    const group = new THREE.Group();
    group.name = collection.title;
    const geometry = new LineSegmentsGeometry();
    const materials = [
      new LineMaterial({
        color: 0xf7f4ee,
        linewidth: 4.6,
        depthTest: true,
        depthWrite: false,
      }),
      new LineMaterial({
        color: new THREE.Color(collection.colour).getHex(),
        linewidth: 3,
        depthTest: true,
        depthWrite: false,
      }),
    ];
    for (const [materialIndex, material] of materials.entries()) {
      const line = new LineSegments2(geometry, material);
      line.renderOrder = 6 + materialIndex;
      group.add(line);
    }
    group.visible = false;
    floodExtent3DMaterials.push(...materials);
    floodExtent3DLayers.set(collection.id, {
      geometry,
      group,
      rings: floodExtentRings(collection.geojson),
      segmentCount: 0,
    });
    scene.add(group);
  }
  updateFloodExtent3DGeometry();

  nativeImageryTileManager = createNativeImageryTileManager({
    THREE,
    scene,
    camera,
    controls,
    canvas,
    originX,
    originY,
    terrainX,
    terrainY,
    renderedTerrainElevation,
    displayElevationY,
    maximumTextureAnisotropy,
    render,
    onStatus(message) {
      if (message) {
        loadStatus.textContent = message;
        loadStatus.hidden = false;
      } else if (satelliteSurfaceState.activeLayerId) {
        loadStatus.hidden = true;
      }
    },
  });
  function applyImageryInspectionDistance() {
    controls.minDistance = 0;
    controls.update();
    render();
  }
  applyImageryInspectionDistance(imageryDetailMode.value);
  imageryDetailMode.addEventListener('change', event => {
    const mode = event.currentTarget.value;
    applyImageryInspectionDistance(mode);
    nativeImageryTileManager.setMode(mode === 'source' ? 'optimized' : mode);
    if (mode === 'source') {
      void setSceneMode('2d').then(() => gis2dScene?.setImageryDetailMode(mode));
    } else {
      gis2dScene?.setImageryDetailMode(mode);
    }
  });

  const routeSurfaceClearance = 16;
  const routePositions = new Float32Array(stationCount * 3);
  const routeElevations = new Float32Array(stationCount);
  for (let index = 0; index < stationCount; index += 1) {
    const easting = routeValue(route, routeColumnCount, index, 0);
    const northing = routeValue(route, routeColumnCount, index, 1);
    const analyticalElevation = routeValue(route, routeColumnCount, index, 5);
    const surfaceElevation = renderedTerrainElevation(easting, northing);
    const displayElevation = Number.isFinite(surfaceElevation) ? surfaceElevation : analyticalElevation;
    routeElevations[index] = displayElevation;
    routePositions[index * 3] = easting - originX;
    routePositions[index * 3 + 1] = displayElevationY(displayElevation) + routeSurfaceClearance;
    routePositions[index * 3 + 2] = -(northing - originY);
  }

  const routeVisualSpacing = 4;
  const routeVisualPositionList = [];
  const routeVisualElevationList = [];
  for (let index = 0; index < stationCount - 1; index += 1) {
    const startEasting = routeValue(route, routeColumnCount, index, 0);
    const startNorthing = routeValue(route, routeColumnCount, index, 1);
    const startElevation = routeValue(route, routeColumnCount, index, 5);
    const endEasting = routeValue(route, routeColumnCount, index + 1, 0);
    const endNorthing = routeValue(route, routeColumnCount, index + 1, 1);
    const endElevation = routeValue(route, routeColumnCount, index + 1, 5);
    const segmentLength = Math.hypot(endEasting - startEasting, endNorthing - startNorthing);
    const segmentSteps = Math.max(1, Math.ceil(segmentLength / routeVisualSpacing));
    for (let step = 0; step < segmentSteps; step += 1) {
      const fraction = step / segmentSteps;
      const easting = startEasting + (endEasting - startEasting) * fraction;
      const northing = startNorthing + (endNorthing - startNorthing) * fraction;
      const analyticalElevation = startElevation + (endElevation - startElevation) * fraction;
      const surfaceElevation = renderedTerrainElevation(easting, northing);
      const displayElevation = Number.isFinite(surfaceElevation) ? surfaceElevation : analyticalElevation;
      routeVisualPositionList.push(
        easting - originX,
        displayElevationY(displayElevation) + routeSurfaceClearance,
        -(northing - originY)
      );
      routeVisualElevationList.push(displayElevation);
    }
  }
  routeVisualPositionList.push(
    routePositions[(stationCount - 1) * 3],
    routePositions[(stationCount - 1) * 3 + 1],
    routePositions[(stationCount - 1) * 3 + 2]
  );
  routeVisualElevationList.push(routeElevations[stationCount - 1]);
  const routeVisualPositions = new Float32Array(routeVisualPositionList);
  const routeVisualElevations = new Float32Array(routeVisualElevationList);

  const routeGeometry = new THREE.BufferGeometry();
  routeGeometry.setAttribute('position', new THREE.BufferAttribute(routePositions, 3));

  const routeVisualGeometry = new LineGeometry();
  routeVisualGeometry.setPositions(routeVisualPositions);
  const routeCasingMaterial = new LineMaterial({
    color: 0x171c1e,
    linewidth: 4,
    depthTest: true,
    depthWrite: false,
  });
  const routeMaterial = new LineMaterial({
    color: 0xf05a47,
    linewidth: 2.2,
    depthTest: true,
    depthWrite: false,
  });
  const routeCasing = new Line2(routeVisualGeometry, routeCasingMaterial);
  routeCasing.name = 'Reconstructed thalweg casing';
  routeCasing.renderOrder = 1;
  const routeLine = new Line2(routeVisualGeometry, routeMaterial);
  routeLine.name = 'Reconstructed thalweg';
  routeLine.renderOrder = 2;
  scene.add(routeCasing, routeLine);
  const routePoints = new THREE.Points(
    routeGeometry,
    new THREE.PointsMaterial({ color: 0xffffff, size: 80, sizeAttenuation: true, transparent: true, opacity: 0, depthWrite: false })
  );
  routePoints.name = 'Route interaction surface';
  scene.add(routePoints);

  const selectionOuterMaterial = new THREE.MeshBasicMaterial({ color: 0x171c1e, depthTest: true, depthWrite: false });
  const selectionInnerMaterial = new THREE.MeshBasicMaterial({ color: 0xffd84d, depthTest: true, depthWrite: false });
  const selectedMarker = new THREE.Group();
  const selectionOuterRing = new THREE.Mesh(
    new THREE.BufferGeometry(),
    selectionOuterMaterial
  );
  const selectionInnerRing = new THREE.Mesh(
    new THREE.BufferGeometry(),
    selectionInnerMaterial
  );
  selectionInnerRing.position.y = 2;
  const selectionOuterPoint = new THREE.Mesh(new THREE.SphereGeometry(52, 18, 14), selectionOuterMaterial);
  const selectionInnerPoint = new THREE.Mesh(new THREE.SphereGeometry(30, 18, 14), selectionInnerMaterial);
  selectionOuterPoint.position.y = 56;
  selectionInnerPoint.position.y = 56;
  selectionOuterRing.renderOrder = 20;
  selectionOuterPoint.renderOrder = 20;
  selectionInnerRing.renderOrder = 21;
  selectionInnerPoint.renderOrder = 21;
  selectedMarker.add(selectionOuterRing, selectionInnerRing, selectionOuterPoint, selectionInnerPoint);
  selectedMarker.visible = false;
  scene.add(selectedMarker);

  const crossLine = new THREE.Group();
  const crossOuter = new THREE.Mesh(new THREE.BufferGeometry(), selectionOuterMaterial);
  const crossInner = new THREE.Mesh(new THREE.BufferGeometry(), selectionInnerMaterial);
  const crossStart = new THREE.Mesh(new THREE.SphereGeometry(34, 14, 10), selectionInnerMaterial);
  const crossEnd = new THREE.Mesh(new THREE.SphereGeometry(34, 14, 10), selectionInnerMaterial);
  crossOuter.renderOrder = 20;
  crossInner.renderOrder = 21;
  crossStart.renderOrder = 21;
  crossEnd.renderOrder = 21;
  crossLine.add(crossOuter, crossInner, crossStart, crossEnd);
  crossLine.visible = false;
  scene.add(crossLine);

  function routeScenePosition(index, lift = 0) {
    return new THREE.Vector3(
      routePositions[index * 3],
      routePositions[index * 3 + 1] + lift,
      routePositions[index * 3 + 2]
    );
  }

  function updateSelectionMarker(index) {
    const centerEasting = routeValue(route, routeColumnCount, index, 0);
    const centerNorthing = routeValue(route, routeColumnCount, index, 1);
    const centerPosition = routeScenePosition(index);
    const centerSurfaceY = centerPosition.y - routeSurfaceClearance;
    const ringRadius = 118;
    const ringClearance = 40;
    const ringSamples = 96;
    const ringPoints = [];

    for (let sample = 0; sample < ringSamples; sample += 1) {
      const angle = (sample / ringSamples) * Math.PI * 2;
      const easting = centerEasting + Math.cos(angle) * ringRadius;
      const northing = centerNorthing + Math.sin(angle) * ringRadius;
      const surfaceElevation = renderedTerrainElevation(easting, northing);
      const surfaceY = Number.isFinite(surfaceElevation)
        ? displayElevationY(surfaceElevation)
        : centerSurfaceY;
      ringPoints.push(new THREE.Vector3(
        easting - centerEasting,
        surfaceY + ringClearance - centerPosition.y,
        -(northing - centerNorthing)
      ));
    }

    const ringCurve = new THREE.CatmullRomCurve3(ringPoints, true, 'centripetal');
    selectionOuterRing.geometry.dispose();
    selectionInnerRing.geometry.dispose();
    selectionOuterRing.geometry = new THREE.TubeGeometry(ringCurve, ringSamples, 20, 8, true);
    selectionInnerRing.geometry = new THREE.TubeGeometry(ringCurve, ringSamples, 8, 8, true);
    selectedMarker.position.copy(centerPosition);
  }

  const featureHitTargets = [];
  const featureMarkers = [];
  const featureMarkerByControl = new Map();
  function addFeatureMarker(kind, control) {
    if (!control) return;
    const index = control.route_index;
    const group = new THREE.Group();
    group.position.copy(routeScenePosition(index));
    const isSource = kind === 'source';
    const layerId = isSource ? 'source' : 'bridge-reference';
    const accentColor = isSource ? 0x6f9fac : 0x7e3531;
    const darkMaterial = new THREE.MeshStandardMaterial({ color: 0x1b2022, roughness: 0.9, metalness: 0 });
    const accentMaterial = new THREE.MeshStandardMaterial({
      color: accentColor,
      emissive: 0x000000,
      emissiveIntensity: 0,
      roughness: 0.82,
      metalness: 0,
    });

    const groundOuter = new THREE.Mesh(new THREE.TorusGeometry(34, 4, 8, 30), darkMaterial);
    const groundInner = new THREE.Mesh(new THREE.TorusGeometry(34, 1.5, 6, 30), accentMaterial);
    groundOuter.rotation.x = Math.PI / 2;
    groundInner.rotation.x = Math.PI / 2;
    groundOuter.position.y = 7;
    groundInner.position.y = 9;

    const anchor = new THREE.Mesh(
      new THREE.CylinderGeometry(11, 11, 6, 18),
      accentMaterial
    );
    anchor.position.y = 10;

    const pinHeight = isSource ? 260 : 230;
    const stemStart = 15;
    const stemEnd = pinHeight - 104;
    const stemLength = stemEnd - stemStart;
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 2.5, stemLength, 8), darkMaterial);
    stem.position.y = stemStart + stemLength / 2;
    const collar = new THREE.Mesh(new THREE.SphereGeometry(6, 12, 8), accentMaterial);
    collar.position.y = stemEnd;

    const symbolTexture = new THREE.TextureLoader().load(
      isSource ? './marker-source.svg?v=20260828-2' : './marker-bridge.svg?v=20260828-2',
      () => render()
    );
    symbolTexture.colorSpace = THREE.SRGBColorSpace;
    symbolTexture.generateMipmaps = true;
    symbolTexture.minFilter = THREE.LinearMipmapLinearFilter;
    symbolTexture.magFilter = THREE.LinearFilter;
    symbolTexture.anisotropy = maximumTextureAnisotropy;
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
      map: symbolTexture,
      transparent: true,
      alphaTest: 0.05,
      depthTest: true,
      depthWrite: false,
      toneMapped: false,
    }));
    sprite.position.y = pinHeight;
    sprite.scale.set(190, 190, 1);

    for (const target of [groundOuter, groundInner, anchor, stem, collar, sprite]) {
      target.userData.featureControl = control;
      target.userData.featureLayerId = layerId;
    }
    group.add(groundOuter, groundInner, anchor, stem, collar, sprite);
    scene.add(group);
    featureHitTargets.push(groundOuter, groundInner, anchor, stem, collar, sprite);
    const marker = {
      group,
      control,
      layerId,
      darkMaterial,
      accentMaterial,
      localPlaqueDiameter: 190,
      targetPlaqueDiameter: isSource ? 58 : 50,
    };
    featureMarkers.push(marker);
    featureMarkerByControl.set(control, marker);
  }

  const sourceControl = manifest.controls.find(control => control.id === 'SOURCE');
  const bridgeControl = manifest.controls.find(control => control.id === 'BRIDGE');
  addFeatureMarker('source', sourceControl);
  addFeatureMarker('bridge', bridgeControl);

  function updateFeatureMarkerScale() {
    for (const marker of featureMarkers) {
      marker.group.visible = layerIsVisible(marker.layerId);
      const scale = screenScaleAtPosition(
        marker.group.position,
        marker.localPlaqueDiameter,
        marker.targetPlaqueDiameter
      );
      marker.group.scale.setScalar(scale);
    }
  }

  const damageMarkerCollections = [];
  const damageEntries = [];
  const damageEntryByFeature = new Map();
  const damageClusterRadiusPx = 30;
  const damageStatusColors = {
    destroyed: new THREE.Color(0x7d5b83),
    damaged: new THREE.Color(0xa77b3a),
  };
  const damageStructureMaterial = new THREE.MeshBasicMaterial({
    color: 0x252b2d,
    toneMapped: false,
  });
  const damagePlaqueMaterial = new THREE.MeshBasicMaterial({
    color: 0xf3f3f0,
    toneMapped: false,
  });
  const damageStatusMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    toneMapped: false,
  });
  const damageClusterMaterial = new THREE.MeshBasicMaterial({
    color: 0x49636b,
    toneMapped: false,
  });
  const damageGlyphMaterials = new Map(
    ['building', 'bridge', 'hydropower_facility', 'cultural_heritage'].map(assetType => {
      const texture = assetGlyphTexture(assetType);
      texture.anisotropy = maximumTextureAnisotropy;
      return [assetType, new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        alphaTest: 0.08,
        depthTest: true,
        depthWrite: false,
        toneMapped: false,
      })];
    })
  );
  const damageHitMaterial = new THREE.MeshBasicMaterial({
    transparent: true,
    opacity: 0,
    depthWrite: false,
    colorWrite: false,
  });
  const damageTransform = new THREE.Object3D();
  const damageScaledPosition = new THREE.Vector3();
  const damageScaledScale = new THREE.Vector3();

  function damageBasePosition(feature) {
    const surfaceElevation = renderedTerrainElevation(feature.easting_m, feature.northing_m);
    const elevation = Number.isFinite(surfaceElevation) ? surfaceElevation : minimumElevation;
    return new THREE.Vector3(
      feature.easting_m - originX,
      displayElevationY(elevation) + 8,
      -(feature.northing_m - originY)
    );
  }

  function setDamageInstance(mesh, index, position, rotation, scale, color = null, quaternion = null) {
    damageTransform.position.copy(position);
    if (quaternion) damageTransform.quaternion.copy(quaternion);
    else damageTransform.rotation.set(rotation.x, rotation.y, rotation.z);
    damageTransform.scale.set(scale.x, scale.y, scale.z);
    damageTransform.updateMatrix();
    mesh.setMatrixAt(index, damageTransform.matrix);
    if (color) mesh.setColorAt(index, color);
  }

  function updateDamageComponent(component, symbolScales) {
    const { mesh, features, basePositions, transform, statusColored } = component;
    const writeColors = !component.colorsWritten;
    for (let index = 0; index < features.length; index += 1) {
      const base = basePositions[index];
      const symbolScale = symbolScales[index] ?? 0;
      if (symbolScale <= 0) {
        setDamageInstance(
          mesh,
          index,
          base,
          { x: 0, y: 0, z: 0 },
          { x: 0, y: 0, z: 0 },
          writeColors && statusColored ? damageStatusColors[features[index].status] : null
        );
        continue;
      }
      const values = transform(base, features[index]);
      const instanceScale = values.scale ?? { x: 1, y: 1, z: 1 };
      damageScaledPosition.set(
        base.x + (values.position.x - base.x) * symbolScale,
        base.y + (values.position.y - base.y) * symbolScale,
        base.z + (values.position.z - base.z) * symbolScale
      );
      damageScaledScale.set(
        instanceScale.x * symbolScale,
        instanceScale.y * symbolScale,
        instanceScale.z * symbolScale
      );
      setDamageInstance(
        mesh,
        index,
        damageScaledPosition,
        values.rotation ?? { x: 0, y: 0, z: 0 },
        damageScaledScale,
        writeColors && statusColored ? damageStatusColors[features[index].status] : null,
        values.quaternion ?? null
      );
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (writeColors && mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    component.colorsWritten = true;
  }

  function damageComponent(group, features, basePositions, geometry, material, transform, statusColored = false) {
    const mesh = new THREE.InstancedMesh(geometry, material, features.length);
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    mesh.frustumCulled = false;
    const component = {
      mesh,
      features,
      basePositions,
      transform,
      statusColored,
      colorsWritten: false,
    };
    updateDamageComponent(component, new Float32Array(features.length));
    group.userData.damageComponents ??= [];
    group.userData.damageComponents.push(component);
    group.add(mesh);
    return mesh;
  }

  function createDamageMarkerCollection(assetType, features) {
    if (!features.length) return;
    const group = new THREE.Group();
    group.name = `${assetType} impact markers`;
    const basePositions = features.map(damageBasePosition);
    const stemHeight = assetType === 'building' ? 108 : assetType === 'bridge' ? 118 : 124;

    function plaquePosition(base, cameraOffset = 0) {
      const towardCamera = camera.position.clone().sub(base).normalize().multiplyScalar(cameraOffset);
      return new THREE.Vector3(
        base.x + towardCamera.x,
        base.y + stemHeight + towardCamera.y,
        base.z + towardCamera.z
      );
    }

    damageComponent(
      group,
      features,
      basePositions,
      new THREE.TorusGeometry(11, 1.8, 6, 20),
      damageStatusMaterial,
      base => ({
        position: new THREE.Vector3(base.x, base.y + 3, base.z),
        rotation: { x: Math.PI / 2, y: 0, z: 0 },
      }),
      true
    );
    damageComponent(
      group,
      features,
      basePositions,
      new THREE.CylinderGeometry(1.4, 1.4, 1, 7),
      damageStructureMaterial,
      base => ({
        position: new THREE.Vector3(base.x, base.y + stemHeight / 2, base.z),
        scale: { x: 1, y: stemHeight, z: 1 },
      })
    );

    damageComponent(
      group,
      features,
      basePositions,
      new THREE.RingGeometry(27, 32, 32),
      damageStatusMaterial,
      base => ({
        position: plaquePosition(base),
        quaternion: camera.quaternion,
      }),
      true
    );
    damageComponent(
      group,
      features,
      basePositions,
      new THREE.CircleGeometry(26, 32),
      damagePlaqueMaterial,
      base => ({
        position: plaquePosition(base, 0.8),
        quaternion: camera.quaternion,
      })
    );
    damageComponent(
      group,
      features,
      basePositions,
      new THREE.PlaneGeometry(42, 42),
      damageGlyphMaterials.get(assetType),
      base => ({
        position: plaquePosition(base, 1.6),
        quaternion: camera.quaternion,
      })
    );

    const hitGeometry = assetType === 'building'
      ? new THREE.BoxGeometry(76, 145, 70)
      : new THREE.BoxGeometry(82, 155, 76);
    const hitTarget = damageComponent(
      group,
      features,
      basePositions,
      hitGeometry,
      damageHitMaterial,
      base => ({ position: new THREE.Vector3(base.x, base.y + stemHeight / 2, base.z) })
    );
    hitTarget.userData.damageFeatures = features;
    scene.add(group);
    const collection = {
      assetType,
      layerId: assetType,
      group,
      features,
      basePositions,
      hitTarget,
      components: group.userData.damageComponents,
      visible: false,
    };
    damageMarkerCollections.push(collection);
    for (let index = 0; index < features.length; index += 1) {
      const entry = {
        feature: features[index],
        basePosition: basePositions[index],
        collection,
        collectionIndex: index,
      };
      damageEntries.push(entry);
      damageEntryByFeature.set(features[index], entry);
    }
  }

  for (const assetType of ['building', 'bridge', 'hydropower_facility', 'cultural_heritage']) {
    createDamageMarkerCollection(
      assetType,
      damagePayload.features.filter(feature => feature.asset_type === assetType)
    );
  }

  const clusterCapacity = damageEntries.length;
  const damageClusterGroup = new THREE.Group();
  damageClusterGroup.name = 'Grouped impact markers';

  function createDamageClusterMesh(geometry, material) {
    const mesh = new THREE.InstancedMesh(geometry, material, clusterCapacity);
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    mesh.frustumCulled = false;
    mesh.count = 0;
    damageClusterGroup.add(mesh);
    return mesh;
  }

  const damageClusterRing = createDamageClusterMesh(
    new THREE.TorusGeometry(13, 2, 6, 20),
    damageClusterMaterial
  );
  const damageClusterStem = createDamageClusterMesh(
    new THREE.CylinderGeometry(1.6, 1.6, 1, 7),
    damageStructureMaterial
  );
  const damageClusterBadges = [];
  function ensureDamageClusterBadge(index) {
    while (damageClusterBadges.length <= index) {
      const badge = new THREE.Sprite(new THREE.SpriteMaterial({
        transparent: true,
        alphaTest: 0.05,
        depthTest: true,
        depthWrite: false,
        toneMapped: false,
      }));
      badge.visible = false;
      badge.frustumCulled = false;
      damageClusterGroup.add(badge);
      damageClusterBadges.push(badge);
    }
    return damageClusterBadges[index];
  }
  const damageClusterHit = createDamageClusterMesh(
    new THREE.BoxGeometry(1, 1, 1),
    damageHitMaterial
  );
  damageClusterHit.userData.damageClusters = [];
  scene.add(damageClusterGroup);

  const activePinOutlineMaterial = new THREE.MeshBasicMaterial({
    color: 0x121719,
    depthTest: true,
    depthWrite: false,
    toneMapped: false,
  });
  const activePinLuminousMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    depthTest: true,
    depthWrite: false,
    toneMapped: false,
  });
  const activePinMarker = new THREE.Group();
  const activeOuterRing = new THREE.Mesh(
    new THREE.TorusGeometry(43, 5, 8, 30),
    activePinOutlineMaterial
  );
  const activeInnerRing = new THREE.Mesh(
    new THREE.TorusGeometry(43, 2.2, 8, 30),
    activePinLuminousMaterial
  );
  activeOuterRing.rotation.x = Math.PI / 2;
  activeInnerRing.rotation.x = Math.PI / 2;
  activeOuterRing.position.y = 10;
  activeInnerRing.position.y = 13;
  activePinMarker.add(activeOuterRing, activeInnerRing);
  activePinMarker.visible = false;
  activePinMarker.renderOrder = 24;
  scene.add(activePinMarker);

  const activePinState = { layerId: null, position: null };
  let selectedFeatureMarker = null;
  let selectedDamageFeature = null;

  function updateActivePinScale() {
    if (!activePinState.position) {
      activePinMarker.visible = false;
      return;
    }
    activePinMarker.visible = activePinState.layerId === null || layerIsVisible(activePinState.layerId);
    if (!activePinMarker.visible) return;
    const viewportHeight = Math.max(1, canvas.clientHeight);
    const verticalWorldUnitsPerPixel = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov * 0.5)) / viewportHeight;
    const cameraDistance = camera.position.distanceTo(activePinMarker.position);
    const scale = THREE.MathUtils.clamp(
      cameraDistance * verticalWorldUnitsPerPixel * 44 / 96,
      0.12,
      18
    );
    activePinMarker.scale.setScalar(scale);
  }

  function clearActivePin() {
    if (selectedFeatureMarker) {
      selectedFeatureMarker.accentMaterial.emissive.setHex(0x000000);
      selectedFeatureMarker.accentMaterial.emissiveIntensity = 0;
      selectedFeatureMarker = null;
    }
    selectedDamageFeature = null;
    activePinState.layerId = null;
    activePinState.position = null;
    activePinMarker.visible = false;
    gis2dScene?.clearSelection();
  }

  function placeActivePin(layerId, position) {
    activePinState.layerId = layerId;
    activePinState.position = position;
    activePinMarker.position.copy(position);
    updateActivePinScale();
  }

  function activateFeaturePin(control) {
    clearActivePin();
    const marker = featureMarkerByControl.get(control);
    if (!marker) return;
    selectedFeatureMarker = marker;
    marker.accentMaterial.emissive.copy(marker.accentMaterial.color);
    marker.accentMaterial.emissiveIntensity = 1.8;
    placeActivePin(marker.layerId, marker.group.position);
    gis2dScene?.setSelected({
      type: 'control',
      id: control.id,
      layerId: marker.layerId,
      longitude: Number(control.longitude),
      latitude: Number(control.latitude),
    });
  }

  function activateDamagePin(feature) {
    clearActivePin();
    const entry = damageEntryByFeature.get(feature);
    if (!entry) return;
    selectedDamageFeature = feature;
    placeActivePin(entry.collection.layerId, entry.basePosition);
    gis2dScene?.setSelected({
      type: 'damage',
      id: feature.id,
      layerId: entry.collection.layerId,
      longitude: Number(feature.longitude),
      latitude: Number(feature.latitude),
    });
  }

  function activateDamageCluster(cluster) {
    clearActivePin();
    placeActivePin(null, cluster.anchorPosition);
    const longitude = cluster.features.reduce((sum, feature) => sum + Number(feature.longitude), 0) / cluster.features.length;
    const latitude = cluster.features.reduce((sum, feature) => sum + Number(feature.latitude), 0) / cluster.features.length;
    gis2dScene?.setSelected({ type: 'cluster', id: null, layerId: null, longitude, latitude });
  }

  function syncGis2DSelection() {
    if (!gis2dScene) return;
    if (selectedFeatureMarker) {
      const control = selectedFeatureMarker.control;
      gis2dScene.setSelected({
        type: 'control',
        id: control.id,
        layerId: selectedFeatureMarker.layerId,
        longitude: Number(control.longitude),
        latitude: Number(control.latitude),
      });
      return;
    }
    if (selectedDamageFeature) {
      const entry = damageEntryByFeature.get(selectedDamageFeature);
      gis2dScene.setSelected({
        type: 'damage',
        id: selectedDamageFeature.id,
        layerId: entry?.collection.layerId ?? selectedDamageFeature.asset_type,
        longitude: Number(selectedDamageFeature.longitude),
        latitude: Number(selectedDamageFeature.latitude),
      });
      return;
    }
    if (recordState.cluster?.features?.length) {
      const longitude = recordState.cluster.features.reduce((sum, feature) => sum + Number(feature.longitude), 0) / recordState.cluster.features.length;
      const latitude = recordState.cluster.features.reduce((sum, feature) => sum + Number(feature.latitude), 0) / recordState.cluster.features.length;
      gis2dScene.setSelected({ type: 'cluster', id: null, layerId: null, longitude, latitude });
      return;
    }
    if (panelState.mode === 'point' && panelState.selectedIndex !== null) {
      const index = panelState.selectedIndex;
      gis2dScene.setSelected({
        type: 'route',
        id: index,
        layerId: 'flow-path',
        longitude: routeValue(route, routeColumnCount, index, 2),
        latitude: routeValue(route, routeColumnCount, index, 3),
      });
      return;
    }
    gis2dScene.clearSelection();
  }

  async function ensureGis2DScene() {
    if (gis2dScene) return gis2dScene;
    if (gis2dScenePromise) return gis2dScenePromise;
    gis2dScenePromise = (async () => {
      const { createGis2DScene } = await import('./gis-2d-scene.mjs?v=20260831-2');
      const scene2d = await createGis2DScene({
        container: gis2dContainer,
        cartoBasemapKey: CARTO_BASEMAP_KEY,
        terrainX,
        terrainY,
        terrainZ,
        rows,
        columns,
        minimumElevation,
        maximumElevation,
        hypsometricStops: HYPSOMETRIC_STOPS.map(({ position, css }) => ({ position, css })),
        route,
        routeColumnCount,
        stationCount,
        sourceControl,
        bridgeControl,
        damageFeatures: damagePayload.features,
        eventEvidence,
        floodExtentCollections,
        initialBasemap: basemapSelect.value,
        onRouteSelect: handleRouteSelection,
        onControlSelect: showFeature,
        onDamageSelect: showDamageFeature,
        onTerrainPointSelect: addTerrainAnalysisPoint,
        sampleTerrainElevation: renderedTerrainElevation,
        onViewChange: positionRecordPopover,
        onStatus(message) {
          if (message) {
            loadStatus.textContent = message;
            loadStatus.hidden = false;
          } else if (terrainPanel.dataset.sceneMode === '2d') {
            loadStatus.hidden = true;
          }
        },
      });
      gis2dScene = scene2d;
      for (const [layerId, visible] of layerVisibility) {
        if (!SATELLITE_SURFACE_METADATA_URLS.has(layerId)) scene2d.setLayerVisibility(layerId, visible);
      }
      if (satelliteSurfaceState.metadata) {
        await scene2d.setSurface(
          satelliteSurfaceState.activeLayerId,
          satelliteSurfaceState.metadata,
          imageryDetailMode.value
        );
      }
      scene2d.setMeasurement(measurementState.indices);
      scene2d.setAnalysisMode(terrainAnalysisState.mode);
      scene2d.setAnalysisPoints(terrainAnalysisState.points);
      syncGis2DSelection();
      return scene2d;
    })().catch(error => {
      gis2dScenePromise = null;
      throw error;
    });
    return gis2dScenePromise;
  }

  function updateSceneModeButtons(disabled = false) {
    for (const button of sceneModeButtons) {
      button.disabled = disabled;
      button.setAttribute('aria-pressed', String(button.dataset.sceneMode === activeSceneMode));
    }
  }

  async function setSceneMode(mode) {
    if (mode !== '2d' && mode !== '3d') return;
    if (mode === activeSceneMode && !(mode === '2d' && !gis2dScene)) return;
    updateSceneModeButtons(true);
    if (mode === '2d') {
      activeSceneMode = '2d';
      terrainPanel.dataset.sceneMode = '2d';
      canvas.hidden = true;
      gis2dContainer.hidden = false;
      loadStatus.textContent = 'Preparing 2D GIS scene…';
      loadStatus.hidden = false;
      try {
        const scene2d = await ensureGis2DScene();
        scene2d.setActive(true);
        syncGis2DSelection();
        loadStatus.hidden = true;
      } catch (error) {
        activeSceneMode = '3d';
        terrainPanel.dataset.sceneMode = '3d';
        gis2dContainer.hidden = true;
        canvas.hidden = false;
        loadStatus.textContent = `2D scene unavailable: ${error.message}`;
        loadStatus.hidden = false;
        resize();
      }
    } else {
      activeSceneMode = '3d';
      terrainPanel.dataset.sceneMode = '3d';
      gis2dContainer.hidden = true;
      canvas.hidden = false;
      gis2dScene?.setActive(false);
      loadStatus.hidden = true;
      resize();
    }
    updateSceneModeButtons(false);
    positionRecordPopover();
  }

  const damageProjection = new THREE.Vector3();

  function makeDamageCluster(projectedMembers) {
    const centerWorld = new THREE.Vector3();
    for (const member of projectedMembers) centerWorld.add(member.entry.basePosition);
    centerWorld.multiplyScalar(1 / projectedMembers.length);

    let anchorMember = projectedMembers[0];
    let anchorDistanceSquared = Infinity;
    let horizontalRadius = 0;
    for (const member of projectedMembers) {
      const base = member.entry.basePosition;
      const dx = base.x - centerWorld.x;
      const dz = base.z - centerWorld.z;
      const distanceSquared = dx * dx + dz * dz;
      horizontalRadius = Math.max(horizontalRadius, Math.sqrt(distanceSquared));
      if (distanceSquared < anchorDistanceSquared) {
        anchorDistanceSquared = distanceSquared;
        anchorMember = member;
      }
    }

    return {
      features: projectedMembers.map(member => member.entry.feature),
      anchorPosition: anchorMember.entry.basePosition.clone(),
      centerWorld,
      horizontalRadius,
    };
  }

  function closeRangePixelBoost(cameraDistance) {
    const proximity = THREE.MathUtils.clamp((26000 - cameraDistance) / 23800, 0, 1);
    return 1 + proximity * 0.28;
  }

  function screenScaleAtPosition(position, localSize, targetPixelSize) {
    const viewportHeight = Math.max(1, canvas.clientHeight);
    const verticalWorldUnitsPerPixel = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov * 0.5)) / viewportHeight;
    const cameraDistance = camera.position.distanceTo(position);
    return THREE.MathUtils.clamp(
      cameraDistance * verticalWorldUnitsPerPixel * targetPixelSize * closeRangePixelBoost(cameraDistance) / localSize,
      0.04,
      48
    );
  }

  function updateDamageClusterInstances(clusters) {
    for (let index = 0; index < clusters.length; index += 1) {
      const cluster = clusters[index];
      const base = cluster.anchorPosition;
      const targetPlaqueDiameter = 52 + Math.min(8, Math.log2(cluster.features.length) * 2);
      const symbolScale = screenScaleAtPosition(base, 72, targetPlaqueDiameter);

      damageScaledPosition.set(base.x, base.y + 3 * symbolScale, base.z);
      damageScaledScale.set(symbolScale, symbolScale, symbolScale);
      setDamageInstance(
        damageClusterRing,
        index,
        damageScaledPosition,
        { x: Math.PI / 2, y: 0, z: 0 },
        damageScaledScale
      );

      damageScaledPosition.set(base.x, base.y + 29 * symbolScale, base.z);
      damageScaledScale.set(symbolScale, 54 * symbolScale, symbolScale);
      setDamageInstance(
        damageClusterStem,
        index,
        damageScaledPosition,
        { x: 0, y: 0, z: 0 },
        damageScaledScale
      );

      const badge = ensureDamageClusterBadge(index);
      const badgeTexture = clusterBadgeTexture(cluster.features.length);
      badgeTexture.anisotropy = maximumTextureAnisotropy;
      if (badge.material.map !== badgeTexture) {
        badge.material.map = badgeTexture;
        badge.material.needsUpdate = true;
      }
      badge.position.set(base.x, base.y + 66 * symbolScale, base.z);
      badge.scale.set(72 * symbolScale, 72 * symbolScale, 1);
      badge.visible = true;

      damageScaledPosition.set(base.x, base.y + 42 * symbolScale, base.z);
      damageScaledScale.set(90 * symbolScale, 104 * symbolScale, 90 * symbolScale);
      setDamageInstance(
        damageClusterHit,
        index,
        damageScaledPosition,
        { x: 0, y: 0, z: 0 },
        damageScaledScale
      );
    }

    for (let index = clusters.length; index < damageClusterBadges.length; index += 1) {
      damageClusterBadges[index].visible = false;
    }

    for (const mesh of [damageClusterRing, damageClusterStem, damageClusterHit]) {
      mesh.count = clusters.length;
      mesh.instanceMatrix.needsUpdate = true;
    }
    damageClusterHit.userData.damageClusters = clusters;
    damageClusterGroup.visible = clusters.length > 0;
  }

  function damageEntryScale(entry, selected = false) {
    const targetPlaqueDiameter = entry.feature.asset_type === 'building'
      ? 36
      : entry.feature.asset_type === 'bridge'
        ? 39
        : 42;
    return screenScaleAtPosition(
      entry.basePosition,
      64,
      targetPlaqueDiameter + (selected ? 8 : 0)
    );
  }

  function updateDamageMarkerVisibility() {
    const width = Math.max(1, canvas.clientWidth);
    const height = Math.max(1, canvas.clientHeight);
    const projectedEntries = [];

    for (const entry of damageEntries) {
      if (!layerIsVisible(entry.collection.layerId)) continue;
      damageProjection.copy(entry.basePosition).project(camera);
      if (
        damageProjection.z < -1 || damageProjection.z > 1 ||
        damageProjection.x < -1.04 || damageProjection.x > 1.04 ||
        damageProjection.y < -1.04 || damageProjection.y > 1.04
      ) continue;
      projectedEntries.push({
        entry,
        screenX: (damageProjection.x + 1) * width / 2,
        screenY: (1 - damageProjection.y) * height / 2,
      });
    }

    const featureScales = new Map(
      damageMarkerCollections.map(collection => [
        collection,
        new Float32Array(collection.features.length),
      ])
    );
    const clusters = [];
    const selectedProjectedEntries = projectedEntries.filter(
      projected => projected.entry.feature === selectedDamageFeature
    );
    const projectedGroups = clusterProjectedDamageFeatures(
      projectedEntries.filter(projected => projected.entry.feature !== selectedDamageFeature),
      damageClusterRadiusPx
    );

    for (const group of projectedGroups) {
      if (group.length > 1) {
        clusters.push(makeDamageCluster(group));
        continue;
      }
      const { entry } = group[0];
      featureScales.get(entry.collection)[entry.collectionIndex] = damageEntryScale(entry);
    }

    for (const { entry } of selectedProjectedEntries) {
      featureScales.get(entry.collection)[entry.collectionIndex] = damageEntryScale(entry, true);
    }

    for (const collection of damageMarkerCollections) {
      const scales = featureScales.get(collection);
      collection.visible = layerIsVisible(collection.layerId) && scales.some(scale => scale > 0);
      collection.group.visible = collection.visible;
      for (const component of collection.components) updateDamageComponent(component, scales);
    }
    updateDamageClusterInstances(clusters);
    updateActivePinScale();
  }

  const measurementGeometry = new THREE.BufferGeometry();
  const measurementLine = new THREE.Line(
    measurementGeometry,
    new THREE.LineBasicMaterial({ color: 0x005b76 })
  );
  measurementLine.visible = false;
  scene.add(measurementLine);

  function createMeasurementMarker(letter, color) {
    const group = new THREE.Group();
    const dot = new THREE.Mesh(
      new THREE.SphereGeometry(45, 16, 12),
      new THREE.MeshBasicMaterial({ color })
    );
    group.add(dot);
    const label = new THREE.Sprite(new THREE.SpriteMaterial({ map: letterTexture(letter, `#${color.toString(16).padStart(6, '0')}`), transparent: true }));
    label.position.y = 155;
    label.scale.set(190, 190, 1);
    group.add(label);
    group.visible = false;
    scene.add(group);
    return group;
  }

  const measurementMarkerA = createMeasurementMarker('A', 0x005b76);
  const measurementMarkerB = createMeasurementMarker('B', 0x9b5c28);
  const terrainAnalysisGeometry = new THREE.BufferGeometry();
  const terrainAnalysisLine = new THREE.Line(
    terrainAnalysisGeometry,
    new THREE.LineBasicMaterial({ color: 0x005b76 })
  );
  terrainAnalysisLine.visible = false;
  terrainAnalysisLine.renderOrder = 23;
  scene.add(terrainAnalysisLine);
  const terrainAnalysisMarkerA = createMeasurementMarker('A', 0x005b76);
  const terrainAnalysisMarkerB = createMeasurementMarker('B', 0x9b5c28);

  function updateEndpointMarkerScales() {
    for (const marker of [measurementMarkerA, measurementMarkerB, terrainAnalysisMarkerA, terrainAnalysisMarkerB]) {
      if (!marker.visible) continue;
      const scale = screenScaleAtPosition(marker.position, 190, 44);
      marker.scale.setScalar(scale);
    }
  }

  function setInitialCameraView() {
    const terrainBounds = terrainGeometry.boundingSphere;
    const verticalHalfFov = THREE.MathUtils.degToRad(camera.fov * 0.5);
    const horizontalHalfFov = Math.atan(Math.tan(verticalHalfFov) * camera.aspect);
    const limitingHalfFov = Math.min(verticalHalfFov, horizontalHalfFov);
    const fitDistance = terrainBounds.radius / Math.sin(limitingHalfFov);
    const initialViewDirection = new THREE.Vector3(0.66, 1, -0.66).normalize();
    controls.target.copy(terrainBounds.center);
    camera.position.copy(terrainBounds.center).addScaledVector(initialViewDirection, fitDistance * 1.08);
    camera.lookAt(controls.target);
    controls.update();
    updateFeatureMarkerScale();
    updateDamageMarkerVisibility();
  }

  let initialViewPending = true;

  function render() {
    const renderStartedAt = movementPerformance?.startedAt != null ? performance.now() : null;
    renderer.render(scene, camera);
    if (renderStartedAt !== null) {
      movementPerformance.drawCalls.push(renderer.info.render.calls);
      movementPerformance.triangles.push(renderer.info.render.triangles);
      movementPerformance.visibleGeometry ??= visibleGeometryBreakdown();
    }
    orientationGroup.quaternion.copy(camera.quaternion).invert();
    orientationRenderer.render(orientationScene, orientationCamera);
    positionRecordPopover();
    if (renderStartedAt !== null) movementPerformance.renderCosts.push(performance.now() - renderStartedAt);
  }

  function resize() {
    const width = Math.max(1, terrainPanel.clientWidth);
    const height = Math.max(1, terrainPanel.clientHeight);
    renderer.setSize(width, height, false);
    orientationRenderer.setSize(
      Math.max(1, orientationCanvas.clientWidth),
      Math.max(1, orientationCanvas.clientHeight),
      false
    );
    routeCasingMaterial.resolution.set(width, height);
    routeMaterial.resolution.set(width, height);
    for (const material of detachmentZoneMaterials) material.resolution.set(width, height);
    for (const material of floodExtent3DMaterials) material.resolution.set(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    if (initialViewPending) {
      initialViewPending = false;
      setInitialCameraView();
    } else {
      updateFeatureMarkerScale();
      updateDamageMarkerVisibility();
      updateEndpointMarkerScales();
    }
    nativeImageryTileManager.updateCamera();
    if (activeSceneMode === '2d') gis2dScene?.updateSize();
    render();
  }
  new ResizeObserver(resize).observe(terrainPanel);
  const spatialTravelDirection = new THREE.Vector3();
  const maximumSpatialTravelStep = terrainGeometry.boundingSphere.radius * 0.12;
  const terrainMinimumEasting = Math.min(terrainX[0], terrainX[terrainX.length - 1]);
  const terrainMaximumEasting = Math.max(terrainX[0], terrainX[terrainX.length - 1]);
  const terrainMinimumNorthing = Math.min(terrainY[0], terrainY[terrainY.length - 1]);
  const terrainMaximumNorthing = Math.max(terrainY[0], terrainY[terrainY.length - 1]);
  let remainingSpatialTravel = 0;
  let spatialTravelFrame = null;
  let previousSpatialTravelTime = null;
  let spatialTerrainDistance = null;
  let previousDamageDetailUpdate = 0;
  let orbitInteractionActive = false;
  let orbitRenderFrame = null;

  function setNavigationRenderQuality(active) {
    navigationTerrainMesh.visible = active && layerIsVisible('terrain');
    terrainMesh.visible = !active && layerIsVisible('terrain');
    if (satelliteSurfaceState.mesh && satelliteSurfaceState.navigationMesh) {
      satelliteSurfaceState.mesh.visible = !active;
      satelliteSurfaceState.navigationMesh.visible = active;
    }
    renderer.setPixelRatio(active ? movingRendererPixelRatio : settledRendererPixelRatio);
  }

  function terrainClearanceAlongView(distance) {
    const easting = originX + camera.position.x + spatialTravelDirection.x * distance;
    const northing = originY - camera.position.z - spatialTravelDirection.z * distance;
    if (
      easting < terrainMinimumEasting || easting > terrainMaximumEasting ||
      northing < terrainMinimumNorthing || northing > terrainMaximumNorthing
    ) return NaN;
    const elevation = renderedTerrainElevation(easting, northing);
    if (!Number.isFinite(elevation)) return NaN;
    const viewHeight = camera.position.y + spatialTravelDirection.y * distance;
    return viewHeight - displayElevationY(elevation);
  }

  function terrainDistanceAlongView() {
    const fallbackDistance = Math.max(1, camera.position.distanceTo(controls.target));
    const sampleLimit = Math.min(
      controls.maxDistance,
      Math.max(fallbackDistance * 1.4, terrainGeometry.boundingSphere.radius * 0.25)
    );
    const sampleCount = 72;
    let previousDistance = 0;
    let previousClearance = terrainClearanceAlongView(0);

    for (let sample = 1; sample <= sampleCount; sample += 1) {
      const distance = sampleLimit * sample / sampleCount;
      const clearance = terrainClearanceAlongView(distance);
      if (!Number.isFinite(clearance)) continue;
      if (Number.isFinite(previousClearance) && previousClearance > 0 && clearance <= 0) {
        let lowerDistance = previousDistance;
        let upperDistance = distance;
        for (let refinement = 0; refinement < 10; refinement += 1) {
          const midpoint = (lowerDistance + upperDistance) * 0.5;
          const midpointClearance = terrainClearanceAlongView(midpoint);
          if (Number.isFinite(midpointClearance) && midpointClearance > 0) lowerDistance = midpoint;
          else upperDistance = midpoint;
        }
        return Math.max(0.05, upperDistance);
      }
      previousDistance = distance;
      previousClearance = clearance;
    }
    return fallbackDistance;
  }

  function animateSpatialTravel(time) {
    if (activeSceneMode !== '3d' || !controls.enabled || Math.abs(remainingSpatialTravel) < 0.002) {
      remainingSpatialTravel = 0;
      spatialTravelFrame = null;
      previousSpatialTravelTime = null;
      if (!orbitInteractionActive) setNavigationRenderQuality(false);
      camera.getWorldDirection(spatialTravelDirection);
      controls.target.copy(camera.position).addScaledVector(
        spatialTravelDirection,
        Math.max(0.5, spatialTerrainDistance ?? camera.position.distanceTo(controls.target))
      );
      spatialTerrainDistance = null;
      controls.update();
      if (!orbitInteractionActive) finishMovementPerformanceSample();
      return;
    }

    const elapsedSeconds = previousSpatialTravelTime === null
      ? 1 / 60
      : Math.min((time - previousSpatialTravelTime) / 1000, 1 / 30);
    recordMovementPerformanceFrame(time);
    previousSpatialTravelTime = time;
    const frameFraction = 1 - Math.exp(-20 * elapsedSeconds);
    const frameTravel = remainingSpatialTravel * frameFraction;
    remainingSpatialTravel -= frameTravel;

    camera.getWorldDirection(spatialTravelDirection);
    camera.position.addScaledVector(spatialTravelDirection, frameTravel);
    controls.target.addScaledVector(spatialTravelDirection, frameTravel);
    spatialTerrainDistance = Math.max(0.05, (spatialTerrainDistance ?? 1) - frameTravel);
    controls.update();
    spatialTravelFrame = requestAnimationFrame(animateSpatialTravel);
  }

  function handleSpatialTravelWheel(event) {
    if (activeSceneMode !== '3d' || !controls.enabled || !controls.enableZoom || event.deltaY === 0) return;
    event.preventDefault();
    event.stopImmediatePropagation();

    const deltaPixels = Math.abs(event.deltaY) * (
      event.deltaMode === WheelEvent.DOM_DELTA_LINE
        ? 16
        : event.deltaMode === WheelEvent.DOM_DELTA_PAGE
          ? Math.max(1, terrainPanel.clientHeight)
          : 1
    );
    const inputScale = THREE.MathUtils.clamp(deltaPixels / 100, 0.05, 4);
    const travelFraction = 1 - Math.pow(0.82, inputScale);

    if (spatialTravelFrame === null) {
      if (movementPerformance?.startedAt == null) beginMovementPerformanceSample();
      camera.getWorldDirection(spatialTravelDirection);
      spatialTerrainDistance = terrainDistanceAlongView();
      controls.target.copy(camera.position).addScaledVector(spatialTravelDirection, spatialTerrainDistance);
      setNavigationRenderQuality(true);
    }
    const referenceDistance = Math.max(0.05, spatialTerrainDistance ?? 1);
    const travelDistance = THREE.MathUtils.clamp(
      referenceDistance * travelFraction,
      0.05 * inputScale,
      maximumSpatialTravelStep * inputScale
    );
    remainingSpatialTravel += event.deltaY < 0 ? travelDistance : -travelDistance;
    if (spatialTravelFrame === null) spatialTravelFrame = requestAnimationFrame(animateSpatialTravel);
  }

  function updateMovingCameraDetails(time) {
    updateFeatureMarkerScale();
    updateEndpointMarkerScales();
    if (time - previousDamageDetailUpdate >= 50) {
      updateDamageMarkerVisibility();
      previousDamageDetailUpdate = time;
    } else {
      updateActivePinScale();
    }
  }

  function animateOrbitInteraction(time) {
    if (!orbitInteractionActive) {
      orbitRenderFrame = null;
      if (spatialTravelFrame === null) {
        setNavigationRenderQuality(false);
        updateFeatureMarkerScale();
        updateDamageMarkerVisibility();
        updateEndpointMarkerScales();
        nativeImageryTileManager.updateCamera();
        render();
        finishMovementPerformanceSample();
      }
      return;
    }

    recordMovementPerformanceFrame(time);
    const detailUpdateStartedAt = movementPerformance?.startedAt != null ? performance.now() : null;
    updateMovingCameraDetails(time);
    if (detailUpdateStartedAt !== null) {
      movementPerformance.detailUpdateCosts.push(performance.now() - detailUpdateStartedAt);
    }
    render();
    orbitRenderFrame = requestAnimationFrame(animateOrbitInteraction);
  }

  canvas.addEventListener('wheel', handleSpatialTravelWheel, { capture: true, passive: false });
  controls.addEventListener('start', () => {
    if (orbitInteractionActive) return;
    orbitInteractionActive = true;
    remainingSpatialTravel = 0;
    if (movementPerformance?.startedAt == null) beginMovementPerformanceSample();
    setNavigationRenderQuality(true);
    if (orbitRenderFrame === null) orbitRenderFrame = requestAnimationFrame(animateOrbitInteraction);
  });
  controls.addEventListener('end', () => {
    orbitInteractionActive = false;
    refreshGuidedPaletteForCamera();
  });
  controls.addEventListener('change', () => {
    if (orbitInteractionActive) return;
    const detailUpdateStartedAt = movementPerformance?.startedAt != null ? performance.now() : null;
    updateFeatureMarkerScale();
    updateEndpointMarkerScales();
    const currentTime = performance.now();
    if (spatialTravelFrame === null || currentTime - previousDamageDetailUpdate >= 50) {
      updateDamageMarkerVisibility();
      previousDamageDetailUpdate = currentTime;
    } else {
      updateActivePinScale();
    }
    if (spatialTravelFrame === null) nativeImageryTileManager.updateCamera();
    if (detailUpdateStartedAt !== null) {
      movementPerformance.detailUpdateCosts.push(performance.now() - detailUpdateStartedAt);
    }
    refreshGuidedPaletteForCamera();
    render();
  });

  const profileCache = new Map();
  const panelState = {
    mode: 'overview',
    selectedIndex: null,
    damageCluster: null,
    returnMode: 'overview',
    returnIndex: null,
  };
  let selectionSequence = 0;

  function positionRecordPopover() {
    if (recordPopover.hidden || !recordState.anchor) return;
    const terrainBounds = terrainPanel.getBoundingClientRect();
    const panelWidth = Math.max(1, terrainBounds.width);
    const panelHeight = Math.max(1, terrainBounds.height);
    const viewportWidth = Math.max(1, document.documentElement.clientWidth);
    const viewportHeight = Math.max(1, window.innerHeight);
    const margin = 12;
    let anchorX;
    let anchorY;
    if (activeSceneMode === '2d' && gis2dScene && recordState.geographicAnchor) {
      const pixel = gis2dScene.getViewportPixel(
        recordState.geographicAnchor[0],
        recordState.geographicAnchor[1]
      );
      if (!pixel) return;
      anchorX = terrainBounds.left + pixel[0];
      anchorY = terrainBounds.top + pixel[1];
    } else {
      recordProjection.copy(recordState.anchor).project(camera);
      anchorX = terrainBounds.left + (recordProjection.x * 0.5 + 0.5) * panelWidth;
      anchorY = terrainBounds.top + (-recordProjection.y * 0.5 + 0.5) * panelHeight;
    }
    const popoverWidth = Math.min(recordPopover.offsetWidth, Math.max(1, viewportWidth - margin * 2));
    const popoverHeight = Math.min(recordPopover.offsetHeight, Math.max(1, viewportHeight - margin * 2));
    const visibleTerrainLeft = Math.max(margin, terrainBounds.left + margin);
    const visibleTerrainRight = Math.min(viewportWidth - margin, terrainBounds.right - margin);
    const visibleTerrainTop = Math.max(margin, terrainBounds.top + margin);
    const visibleTerrainBottom = Math.min(viewportHeight - margin, terrainBounds.bottom - margin);
    const keepWithinTerrainX = visibleTerrainRight - visibleTerrainLeft >= popoverWidth;
    const keepWithinTerrainY = visibleTerrainBottom - visibleTerrainTop >= popoverHeight;
    const minimumLeft = keepWithinTerrainX ? visibleTerrainLeft : margin;
    const maximumLeft = keepWithinTerrainX
      ? visibleTerrainRight - popoverWidth
      : viewportWidth - popoverWidth - margin;
    const minimumTop = keepWithinTerrainY ? visibleTerrainTop : margin;
    const maximumTop = keepWithinTerrainY
      ? visibleTerrainBottom - popoverHeight
      : viewportHeight - popoverHeight - margin;
    let left = anchorX + 22;
    if (left > maximumLeft) left = anchorX - popoverWidth - 22;
    left = THREE.MathUtils.clamp(left, minimumLeft, Math.max(minimumLeft, maximumLeft));
    let top = anchorY - popoverHeight - 18;
    if (top < minimumTop) top = anchorY + 18;
    top = THREE.MathUtils.clamp(top, minimumTop, Math.max(minimumTop, maximumTop));
    recordPopover.style.left = `${Math.round(left)}px`;
    recordPopover.style.top = `${Math.round(top)}px`;
  }

  function resetSensitiveMedia(video, warning) {
    video.pause();
    try { video.currentTime = 0; } catch { /* Metadata may not yet be available. */ }
    warning.hidden = false;
  }

  function revealSensitiveMedia(video, warning) {
    warning.hidden = true;
    video.play().catch(() => {});
  }

  recordPopoverMediaReveal.addEventListener('click', () => revealSensitiveMedia(recordPopoverMediaVideo, recordPopoverMediaWarning));
  featureBridgeReveal.addEventListener('click', () => revealSensitiveMedia(featureBridgeVideo, featureBridgeWarning));

  function showRecordPopover({ anchor, geographicAnchor = null, mode, cluster = null, title, context, primary, secondary, media = null }) {
    recordState.anchor = anchor.clone();
    recordState.geographicAnchor = geographicAnchor ? [...geographicAnchor] : null;
    recordState.mode = mode;
    recordState.cluster = cluster;
    recordPopoverTitle.textContent = title;
    recordPopoverContext.textContent = context;
    recordPopoverPrimary.textContent = primary;
    recordPopoverPrimary.hidden = !primary;
    recordPopoverSecondary.textContent = secondary;
    recordPopoverSecondary.hidden = !secondary;
    recordPopoverMedia.hidden = !media;
    const showsVideo = Boolean(media && media.type === 'video');
    recordPopoverMediaLink.hidden = !media || showsVideo;
    recordPopoverSensitiveMedia.hidden = !showsVideo;
    recordPopoverMediaVideo.hidden = !showsVideo;
    if (media) {
      recordPopoverMediaSource.href = media.link;
      if (showsVideo) {
        recordPopoverMediaImage.removeAttribute('src');
        recordPopoverMediaVideo.src = media.src;
        recordPopoverMediaVideo.setAttribute('aria-label', media.alt);
        resetSensitiveMedia(recordPopoverMediaVideo, recordPopoverMediaWarning);
      } else {
        recordPopoverMediaVideo.pause();
        recordPopoverMediaVideo.removeAttribute('src');
        recordPopoverMediaLink.href = media.link;
        recordPopoverMediaImage.src = media.src;
        recordPopoverMediaImage.alt = media.alt;
      }
    } else {
      recordPopoverMediaImage.removeAttribute('src');
      recordPopoverMediaVideo.pause();
      recordPopoverMediaVideo.removeAttribute('src');
    }
    recordDialogTitle.textContent = title;
    recordDialogContext.textContent = context;
    recordPopover.hidden = false;
    requestAnimationFrame(positionRecordPopover);
  }

  function closeRecordInspection({ clearSelection = true } = {}) {
    recordState.anchor = null;
    recordState.geographicAnchor = null;
    recordState.mode = null;
    recordState.cluster = null;
    recordPopover.hidden = true;
    resetSensitiveMedia(recordPopoverMediaVideo, recordPopoverMediaWarning);
    resetSensitiveMedia(featureBridgeVideo, featureBridgeWarning);
    featureInspection.hidden = true;
    damageInspection.hidden = true;
    if (recordDialog.open) recordDialog.close();
    if (clearSelection) {
      clearActivePin();
      updateFeatureMarkerScale();
      updateDamageMarkerVisibility();
      render();
    }
  }

  function openRecordDialog() {
    if (!recordState.anchor || recordDialog.open) return;
    pauseGuidedJourneyForOverlay();
    recordPopoverMediaVideo.pause();
    resetSensitiveMedia(featureBridgeVideo, featureBridgeWarning);
    recordPopover.hidden = true;
    recordDialog.showModal();
  }

  recordPopoverCloseButton.addEventListener('click', () => closeRecordInspection());
  recordReadMoreButton.addEventListener('click', openRecordDialog);
  recordPopover.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeRecordInspection();
  });
  recordDialogCloseButton.addEventListener('click', () => recordDialog.close());
  recordDialog.addEventListener('click', event => {
    if (event.target === recordDialog) recordDialog.close();
  });
  recordDialog.addEventListener('close', () => {
    resetSensitiveMedia(featureBridgeVideo, featureBridgeWarning);
    if (!recordState.anchor) return;
    recordPopover.hidden = false;
    requestAnimationFrame(() => {
      positionRecordPopover();
      recordReadMoreButton.focus({ preventScroll: true });
    });
  });
  window.addEventListener('scroll', positionRecordPopover, { passive: true });

  async function getProfile(index) {
    if (profileCache.has(index)) return profileCache.get(index);
    const profile = await fetchBinary(`./api/profile/${index}`);
    profileCache.set(index, profile);
    if (profileCache.size > 12) profileCache.delete(profileCache.keys().next().value);
    return profile;
  }

  function positiveBearing(nx, ny) {
    return (Math.atan2(nx, ny) * 180 / Math.PI + 360) % 360;
  }

  function displayUtc(isoTimestamp) {
    return isoTimestamp.replace('T', ' ').replace(/(?:\.000)?Z$/, ' UTC');
  }

  function latitudeText(value) {
    return `${fixed(Math.abs(value), 6)}° ${value < 0 ? 'S' : 'N'}`;
  }

  function longitudeText(value) {
    return `${fixed(Math.abs(value), 6)}° ${value < 0 ? 'W' : 'E'}`;
  }

  function elevationText(value) {
    return `${fixed(value, 1)} m`;
  }

  function damageFeatureElevation(feature) {
    return renderedTerrainElevation(feature.easting_m, feature.northing_m);
  }

  function locationDescription(latitude, longitude, elevation) {
    return `${latitudeText(latitude)}, ${longitudeText(longitude)} · ${elevationText(elevation)}`;
  }

  function setPanelHeader(title, context, exitLabel = null, showAuthorship = false) {
    panelTitle.textContent = title;
    panelContext.textContent = context;
    panelContext.hidden = !context;
    panelHeader.classList.toggle('is-overview', showAuthorship);
    overviewAuthorship.hidden = !showAuthorship;
    panelExitButton.hidden = !exitLabel;
    if (exitLabel) panelExitButton.textContent = exitLabel;
  }

  async function selectLocation(index) {
    const sequence = ++selectionSequence;
    resetTerrainAnalysisState();
    closeRecordInspection({ clearSelection: false });
    clearActivePin();
    updateDamageMarkerVisibility();
    const x = routeValue(route, routeColumnCount, index, 0);
    const y = routeValue(route, routeColumnCount, index, 1);
    const longitude = routeValue(route, routeColumnCount, index, 2);
    const latitude = routeValue(route, routeColumnCount, index, 3);
    const elevation = routeValue(route, routeColumnCount, index, 5);
    const normalX = routeValue(route, routeColumnCount, index, 7);
    const normalY = routeValue(route, routeColumnCount, index, 8);
    const bearing = positiveBearing(normalX, normalY);

    panelState.mode = 'point';
    panelState.selectedIndex = index;
    panelState.damageCluster = null;
    overviewPanel.hidden = true;
    featureInspection.hidden = true;
    damageInspection.hidden = true;
    measurementPanel.hidden = true;
    terrainAnalysisPanel.hidden = true;
    pointInspection.hidden = false;
    updateSelectionMarker(index);
    selectedMarker.visible = true;
    gis2dScene?.setSelected({
      type: 'route',
      id: index,
      layerId: 'flow-path',
      longitude,
      latitude,
    });
    crossLine.visible = false;
    document.getElementById('latitude').textContent = `${fixed(latitude, 7)}° N`;
    document.getElementById('longitude').textContent = `${fixed(longitude, 7)}° E`;
    document.getElementById('elevation').textContent = `${fixed(elevation, 1)} m`;
    setPanelHeader('Path location', 'WGS 84 geographic coordinates', 'Clear selection');
    document.getElementById('cross-orientation').textContent = `Cross-section axis ${fixed((bearing + 180) % 360, 1)}° / ${fixed(bearing, 1)}°; ±800 m from the path.`;
    profileSvg.hidden = true;
    crossProfileStatus.hidden = false;
    crossProfileStatus.textContent = 'Loading cross-valley profile…';
    render();

    try {
      const profile = await getProfile(index);
      if (sequence !== selectionSequence) return;
      drawProfile(profileOffsets, profile);
      const crossPoints = [];
      for (let sample = 0; sample < profile.length; sample += 1) {
        if (!Number.isFinite(profile[sample])) continue;
        const offset = profileOffsets[sample];
        const easting = x + normalX * offset;
        const northing = y + normalY * offset;
        const surfaceElevation = renderedTerrainElevation(easting, northing);
        const displayElevation = Number.isFinite(surfaceElevation) ? surfaceElevation : profile[sample];
        crossPoints.push(new THREE.Vector3(
          easting - originX,
          displayElevationY(displayElevation) + 40,
          -(northing - originY)
        ));
      }
      if (crossPoints.length >= 2) {
        const crossCurve = new THREE.CatmullRomCurve3(crossPoints, false, 'centripetal');
        crossOuter.geometry.dispose();
        crossInner.geometry.dispose();
        crossOuter.geometry = new THREE.TubeGeometry(
          crossCurve,
          Math.max(24, crossPoints.length - 1),
          20,
          6,
          false
        );
        crossInner.geometry = new THREE.TubeGeometry(
          crossCurve,
          Math.max(24, crossPoints.length - 1),
          9,
          6,
          false
        );
        crossStart.position.copy(crossPoints[0]);
        crossEnd.position.copy(crossPoints[crossPoints.length - 1]);
        crossLine.visible = true;
      }
      profileSvg.hidden = false;
      crossProfileStatus.hidden = true;
      render();
    } catch (error) {
      if (sequence !== selectionSequence) return;
      crossProfileStatus.textContent = `Cross-valley profile unavailable: ${error.message}`;
    }
  }

  const measurementState = { phase: 'idle', indices: [] };
  const terrainAnalysisState = {
    mode: null,
    phase: 'idle',
    points: [],
    result: null,
  };

  function setVerticalExaggeration(value) {
    const nextExaggeration = Number(value);
    const permittedValues = new Set([0, 1, 1.5, 2, 2.5, 3]);
    if (!permittedValues.has(nextExaggeration) || nextExaggeration === verticalExaggeration) return;

    const previousExaggeration = verticalExaggeration;
    const targetEasting = controls.target.x + originX;
    const targetNorthing = originY - controls.target.z;
    const targetElevation = renderedTerrainElevation(targetEasting, targetNorthing);
    const previousTargetSurfaceY = Number.isFinite(targetElevation)
      ? (targetElevation - minimumElevation) * previousExaggeration
      : controls.target.y;
    const targetVerticalOffset = controls.target.y - previousTargetSurfaceY;
    verticalExaggeration = nextExaggeration;

    const terrainPositionAttribute = terrainGeometry.getAttribute('position');
    for (let index = 0; index < terrainZ.length; index += 1) {
      const elevation = Number.isFinite(terrainZ[index]) ? terrainZ[index] : minimumElevation;
      terrainPositionAttribute.setY(index, displayElevationY(elevation));
    }
    terrainPositionAttribute.needsUpdate = true;
    terrainGeometry.computeVertexNormals();
    terrainGeometry.computeBoundingSphere();
    applyTerrainReliefShading(terrainGeometry, baseTerrainColors);

    const navigationPositionAttribute = navigationTerrainGeometry.getAttribute('position');
    for (let index = 0; index < navigationTerrainSourceIndices.length; index += 1) {
      const sourceIndex = navigationTerrainSourceIndices[index];
      const elevation = Number.isFinite(terrainZ[sourceIndex]) ? terrainZ[sourceIndex] : minimumElevation;
      navigationPositionAttribute.setY(index, displayElevationY(elevation));
    }
    navigationPositionAttribute.needsUpdate = true;
    navigationTerrainGeometry.computeVertexNormals();
    navigationTerrainGeometry.computeBoundingSphere();
    applyTerrainReliefShading(navigationTerrainGeometry, navigationBaseColors);

    for (const satelliteGeometry of [
      satelliteSurfaceState.mesh?.geometry,
      satelliteSurfaceState.navigationMesh?.geometry,
    ]) {
      const satelliteTerrainIndices = satelliteGeometry?.userData.terrainIndices;
      if (!satelliteGeometry || !satelliteTerrainIndices) continue;
      const satellitePositionAttribute = satelliteGeometry.getAttribute('position');
      for (let index = 0; index < satelliteTerrainIndices.length; index += 1) {
        const terrainIndex = satelliteTerrainIndices[index];
        const elevation = Number.isFinite(terrainZ[terrainIndex]) ? terrainZ[terrainIndex] : minimumElevation;
        satellitePositionAttribute.setY(index, displayElevationY(elevation));
      }
      satellitePositionAttribute.needsUpdate = true;
      satelliteGeometry.computeBoundingSphere();
    }

    const routePositionAttribute = routeGeometry.getAttribute('position');
    for (let index = 0; index < routeElevations.length; index += 1) {
      routePositionAttribute.setY(index, displayElevationY(routeElevations[index]) + routeSurfaceClearance);
    }
    routePositionAttribute.needsUpdate = true;
    routeGeometry.computeBoundingSphere();
    for (let index = 0; index < routeVisualElevations.length; index += 1) {
      routeVisualPositions[index * 3 + 1] = displayElevationY(routeVisualElevations[index]) + routeSurfaceClearance;
    }
    routeVisualGeometry.setPositions(routeVisualPositions);
    updateDetachmentZoneGeometry();
    updateFloodExtent3DGeometry();

    for (const marker of featureMarkers) {
      marker.group.position.copy(routeScenePosition(marker.control.route_index));
    }
    for (const entry of damageEntries) {
      entry.basePosition.copy(damageBasePosition(entry.feature));
    }

    if (Number.isFinite(targetElevation)) {
      const nextTargetY = displayElevationY(targetElevation) + targetVerticalOffset;
      const cameraShiftY = nextTargetY - controls.target.y;
      controls.target.y = nextTargetY;
      camera.position.y += cameraShiftY;
      camera.lookAt(controls.target);
      controls.update();
    }

    if (selectedFeatureMarker) {
      activePinState.position = selectedFeatureMarker.group.position;
      activePinMarker.position.copy(selectedFeatureMarker.group.position);
      if (recordState.anchor) recordState.anchor.copy(selectedFeatureMarker.group.position);
    } else if (selectedDamageFeature) {
      const selectedEntry = damageEntryByFeature.get(selectedDamageFeature);
      if (selectedEntry) {
        activePinState.position = selectedEntry.basePosition;
        activePinMarker.position.copy(selectedEntry.basePosition);
        if (recordState.anchor) recordState.anchor.copy(selectedEntry.basePosition);
      }
    } else if (activePinState.position) {
      const activeElevation = renderedTerrainElevation(
        activePinState.position.x + originX,
        originY - activePinState.position.z
      );
      if (Number.isFinite(activeElevation)) {
        activePinState.position.y = displayElevationY(activeElevation) + 8;
        activePinMarker.position.copy(activePinState.position);
        if (recordState.cluster) recordState.cluster.anchorPosition.copy(activePinState.position);
        if (recordState.anchor) recordState.anchor.copy(activePinState.position);
      }
    }

    if (measurementState.indices.length > 0) {
      measurementMarkerA.position.copy(routeScenePosition(measurementState.indices[0], 55));
    }
    if (measurementState.indices.length > 1) {
      measurementMarkerB.position.copy(routeScenePosition(measurementState.indices[1], 55));
      if (measurementState.phase === 'complete') {
        completeMeasurement(measurementState.indices[0], measurementState.indices[1]);
      }
    }

    if (panelState.mode === 'point' && panelState.selectedIndex !== null) {
      updateSelectionMarker(panelState.selectedIndex);
      crossLine.visible = false;
      void selectLocation(panelState.selectedIndex);
    }

    elevationLegend.setAttribute(
      'aria-label',
      nextExaggeration === 0
        ? 'Terrain elevation colour scale in metres; planar terrain geometry'
        : nextExaggeration === 1
          ? 'Terrain elevation colour scale in metres; true-scale terrain geometry'
          : `Terrain elevation colour scale in metres; geometry displayed with ${nextExaggeration} times vertical exaggeration`
    );
    updateFeatureMarkerScale();
    updateDamageMarkerVisibility();
    updateActivePinScale();
    if (terrainAnalysisState.points.length) updateTerrainAnalysisGraphics();
    nativeImageryTileManager.updateVerticalExaggeration();
    render();
  }

  verticalExaggerationSelect.addEventListener('change', event => {
    setVerticalExaggeration(event.currentTarget.value);
  });

  function updateTerrainToolButtons() {
    for (const button of terrainToolButtons) {
      button.setAttribute('aria-pressed', String(button.dataset.terrainTool === terrainAnalysisState.mode));
    }
  }

  function terrainAnalysisPointDetail(point) {
    const coordinateNumber = new Intl.NumberFormat('en', { maximumFractionDigits: 0 });
    return `E ${coordinateNumber.format(point.easting)} m · N ${coordinateNumber.format(point.northing)} m · ${elevationText(point.elevation)}`;
  }

  function terrainAnalysisScenePosition(point, lift = 55) {
    return new THREE.Vector3(
      point.easting - originX,
      displayElevationY(point.elevation) + lift,
      -(point.northing - originY)
    );
  }

  function updateTerrainAnalysisGraphics() {
    const [pointA, pointB] = terrainAnalysisState.points;
    terrainAnalysisMarkerA.visible = Boolean(pointA);
    terrainAnalysisMarkerB.visible = Boolean(pointB);
    if (pointA) terrainAnalysisMarkerA.position.copy(terrainAnalysisScenePosition(pointA));
    if (pointB) terrainAnalysisMarkerB.position.copy(terrainAnalysisScenePosition(pointB));
    terrainAnalysisLine.visible = false;

    const result = terrainAnalysisState.result;
    if (pointA && pointB && result && !result.hasElevationGap) {
      const positions = new Float32Array(result.sampleCount * 3);
      for (let index = 0; index < result.sampleCount; index += 1) {
        const fraction = index / (result.sampleCount - 1);
        const easting = pointA.easting + (pointB.easting - pointA.easting) * fraction;
        const northing = pointA.northing + (pointB.northing - pointA.northing) * fraction;
        positions[index * 3] = easting - originX;
        positions[index * 3 + 1] = displayElevationY(result.elevationsM[index]) + 34;
        positions[index * 3 + 2] = -(northing - originY);
      }
      terrainAnalysisGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      terrainAnalysisGeometry.computeBoundingSphere();
      terrainAnalysisLine.visible = true;
    }
    updateEndpointMarkerScales();
    gis2dScene?.setAnalysisPoints(terrainAnalysisState.points);
  }

  function renderTerrainAnalysisPanel() {
    const [pointA, pointB] = terrainAnalysisState.points;
    terrainAnalysisStepA.className = `measurement-step ${pointA ? 'is-complete' : 'is-current'}`;
    terrainAnalysisStepB.className = `measurement-step ${pointB ? 'is-complete' : pointA ? 'is-current' : ''}`;
    terrainAnalysisADetail.textContent = pointA ? terrainAnalysisPointDetail(pointA) : 'Not set';
    terrainAnalysisBDetail.textContent = pointB ? terrainAnalysisPointDetail(pointB) : 'Not set';

    if (!pointA) terrainAnalysisInstruction.textContent = 'Select location A on the terrain.';
    else if (!pointB) terrainAnalysisInstruction.textContent = 'A is set. Select location B on the terrain.';
    else terrainAnalysisInstruction.textContent = terrainAnalysisState.mode === 'profile'
      ? 'Elevation profile completed along the straight A–B transect.'
      : 'Distance calculation completed between A and B.';

    const result = terrainAnalysisState.result;
    terrainAnalysisResults.hidden = !result;
    terrainAnalysisProfileRegion.hidden = terrainAnalysisState.mode !== 'profile' || !result;
    if (!result) return;

    document.getElementById('terrain-analysis-horizontal').textContent = formatDistance(result.horizontalDistanceM);
    document.getElementById('terrain-analysis-straight').textContent = formatDistance(result.straightLineDistanceM);
    document.getElementById('terrain-analysis-surface').textContent = result.terrainSurfaceDistanceM === null
      ? 'Unavailable'
      : formatDistance(result.terrainSurfaceDistanceM);
    document.getElementById('terrain-analysis-elevation-change').textContent = `${result.elevationChangeM >= 0 ? '+' : ''}${fixed(result.elevationChangeM, 1)} m`;
    document.getElementById('terrain-analysis-method-note').textContent = result.hasElevationGap
      ? 'The straight A–B transect crosses a DEM no-data area, so terrain-surface distance is unavailable. Horizontal and straight-line 3D distances remain valid.'
      : `Terrain-surface distance is sampled every ${formatDistance(result.sampleSpacingM)} along the straight A–B transect from the displayed 96 m DEM.`;

    if (terrainAnalysisState.mode === 'profile') {
      drawElevationProfile(terrainAnalysisProfile, result.distancesKm, result.elevationsM, {
        title: 'Terrain elevation profile from A to B',
        xAxisLabel: 'Horizontal distance from A (km)',
      });
    }
  }

  function resetTerrainAnalysisState() {
    terrainAnalysisState.mode = null;
    terrainAnalysisState.phase = 'idle';
    terrainAnalysisState.points = [];
    terrainAnalysisState.result = null;
    terrainAnalysisMarkerA.visible = false;
    terrainAnalysisMarkerB.visible = false;
    terrainAnalysisLine.visible = false;
    terrainAnalysisResults.hidden = true;
    terrainAnalysisProfile.replaceChildren();
    gis2dScene?.setAnalysisMode(null);
    gis2dScene?.setAnalysisPoints([]);
    updateTerrainToolButtons();
    if (terrainPanel.dataset.mode === 'terrain-analysis') terrainPanel.removeAttribute('data-mode');
  }

  function resetTerrainAnalysisSelection() {
    terrainAnalysisState.phase = 'selecting';
    terrainAnalysisState.points = [];
    terrainAnalysisState.result = null;
    terrainAnalysisMarkerA.visible = false;
    terrainAnalysisMarkerB.visible = false;
    terrainAnalysisLine.visible = false;
    terrainAnalysisResults.hidden = true;
    terrainAnalysisProfile.replaceChildren();
    terrainPanel.dataset.mode = 'terrain-analysis';
    gis2dScene?.setAnalysisMode(terrainAnalysisState.mode);
    gis2dScene?.setAnalysisPoints([]);
    renderTerrainAnalysisPanel();
    render();
  }

  function beginTerrainAnalysis(mode) {
    if (mode !== 'distance' && mode !== 'profile') return;
    const switchingActiveTool = panelState.mode === 'terrain-analysis';
    if (!switchingActiveTool) {
      selectionSequence += 1;
      resetMeasurementState();
      resetTerrainAnalysisState();
      closeRecordInspection({ clearSelection: false });
      clearActivePin();
      updateDamageMarkerVisibility();
    }
    terrainAnalysisState.mode = mode;
    if (terrainAnalysisState.points.length < 2) terrainAnalysisState.phase = 'selecting';
    panelState.mode = 'terrain-analysis';
    panelState.damageCluster = null;
    overviewPanel.hidden = true;
    featureInspection.hidden = true;
    damageInspection.hidden = true;
    pointInspection.hidden = true;
    measurementPanel.hidden = true;
    terrainAnalysisPanel.hidden = false;
    selectedMarker.visible = false;
    crossLine.visible = false;
    loadStatus.hidden = true;
    if (terrainAnalysisState.phase === 'selecting') terrainPanel.dataset.mode = 'terrain-analysis';
    else terrainPanel.removeAttribute('data-mode');
    gis2dScene?.setAnalysisMode(terrainAnalysisState.phase === 'selecting' ? mode : null);
    gis2dScene?.setAnalysisPoints(terrainAnalysisState.points);
    updateTerrainToolButtons();
    setPanelHeader(
      mode === 'profile' ? 'Terrain elevation profile' : 'Terrain distance',
      'Select two locations anywhere on the DEM',
      'Close'
    );
    renderTerrainAnalysisPanel();
    render();
  }

  function addTerrainAnalysisPoint(point) {
    if (!terrainAnalysisState.mode || terrainAnalysisState.phase !== 'selecting') return;
    const normalizedPoint = {
      easting: Number(point.easting),
      northing: Number(point.northing),
      elevation: Number(point.elevation),
      longitude: Number(point.longitude),
      latitude: Number(point.latitude),
    };
    if (![normalizedPoint.easting, normalizedPoint.northing, normalizedPoint.elevation].every(Number.isFinite)) {
      terrainAnalysisInstruction.textContent = 'Select a location within the DEM terrain.';
      return;
    }
    const pointA = terrainAnalysisState.points[0];
    if (pointA && Math.hypot(normalizedPoint.easting - pointA.easting, normalizedPoint.northing - pointA.northing) < 1) {
      terrainAnalysisInstruction.textContent = 'A and B must be different locations.';
      return;
    }
    terrainAnalysisState.points.push(normalizedPoint);
    if (terrainAnalysisState.points.length === 2) {
      terrainAnalysisState.result = analyzeTerrainTransect(
        terrainAnalysisState.points[0],
        terrainAnalysisState.points[1],
        renderedTerrainElevation,
        manifest.sampling.terrain_display_resolution_m
      );
      terrainAnalysisState.phase = 'complete';
      terrainPanel.removeAttribute('data-mode');
      gis2dScene?.setAnalysisMode(null);
    }
    updateTerrainAnalysisGraphics();
    renderTerrainAnalysisPanel();
    render();
  }

  function resetMeasurementSteps() {
    measurementStepA.className = 'measurement-step is-current';
    measurementStepB.className = 'measurement-step';
    measurementADetail.textContent = 'Not set';
    measurementBDetail.textContent = 'Not set';
  }

  function endpointDetail(index) {
    return `${fixed(routeValue(route, routeColumnCount, index, 5), 1)} m`;
  }

  function resetMeasurementState() {
    measurementState.phase = 'idle';
    measurementState.indices = [];
    measurementMarkerA.visible = false;
    measurementMarkerB.visible = false;
    measurementLine.visible = false;
    measurementResults.hidden = true;
    longitudinalSvg.replaceChildren();
    terrainPanel.removeAttribute('data-mode');
    resetMeasurementSteps();
    gis2dScene?.setMeasurement([]);
  }

  function showFeature(control) {
    const isSource = control.id === 'SOURCE';
    const name = isSource
      ? 'Glacier-ice detachment source'
      : 'Friendship Bridge, Rasuwagadhi–Gyirong';
    const featureElevation = routeValue(route, routeColumnCount, control.route_index, 5);
    const utcLabel = isSource ? 'Seismic onset (UTC)' : 'Flood arrival (UTC)';
    const marker = featureMarkerByControl.get(control);

    showOverview();
    featureInspection.hidden = false;
    featureSourceEvidence.hidden = !isSource;
    featureBridgeEvidence.hidden = isSource;
    if (isSource) {
      featureBridgeVideo.pause();
      featureSourceImages.forEach(image => {
        if (!image.src) image.src = image.dataset.src;
      });
    } else if (!featureBridgeVideo.getAttribute('src')) {
      featureBridgeVideo.src = featureBridgeVideo.dataset.src;
    }
    if (!isSource) resetSensitiveMedia(featureBridgeVideo, featureBridgeWarning);
    selectedMarker.visible = false;
    crossLine.visible = false;
    crossProfileStatus.hidden = true;
    activateFeaturePin(control);
    document.getElementById('feature-name').textContent = name;
    document.getElementById('feature-utc-label').textContent = utcLabel;
    document.getElementById('feature-utc').textContent = displayUtc(control.utc);
    document.getElementById('feature-nepal-time').textContent = control.nepal_time;
    document.getElementById('feature-china-time').textContent = control.china_time;
    document.getElementById('feature-latitude').textContent = latitudeText(control.latitude);
    document.getElementById('feature-longitude').textContent = longitudeText(control.longitude);
    document.getElementById('feature-elevation').textContent = elevationText(featureElevation);
    showRecordPopover({
      anchor: marker?.group.position ?? routeScenePosition(control.route_index),
      geographicAnchor: [control.longitude, control.latitude],
      mode: 'feature',
      title: name,
      context: isSource ? 'Source event record' : 'Bridge timing record',
      primary: '',
      secondary: `${utcLabel}: ${displayUtc(control.utc)} · ${latitudeText(control.latitude)}, ${longitudeText(control.longitude)} · ${elevationText(featureElevation)}`,
      media: isSource ? {
        type: 'image',
        src: 'assets/reuters-glacier-collapse-overview.png?v=20260828-3',
        link: 'https://www.reuters.com/graphics/NEPAL-FLOODS/MAP/byvrdywwlve/',
        alt: 'Terrain reconstruction of the glacier detachment and avalanche path',
      } : {
        type: 'video',
        src: 'assets/gyirong-port-cctv-silent.mp4?v=20260828-1',
        link: 'https://www.youtube.com/watch?v=y-zAdQWXgs4&t=39600s',
        alt: 'Security-camera footage of debris-flood arrival at the Friendship Bridge observation site',
      },
    });
    updateFeatureMarkerScale();
    updateDamageMarkerVisibility();
    render();
  }

  function renderDamageSources(sources) {
    damageSourceList.replaceChildren();
    for (const source of sources) {
      const item = document.createElement('li');
      const link = document.createElement('a');
      link.href = source.url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = source.title;
      const date = document.createElement('span');
      date.textContent = `Assessment dated ${source.date}`;
      item.append(link, date);
      damageSourceList.append(item);
    }
  }

  function renderDamageContext(evidence) {
    damageContextEvidence.hidden = !evidence;
    damageContextSourceList.replaceChildren();
    damageContextMedia.hidden = true;
    damageContextMediaImage.removeAttribute('src');
    damageContextMediaImage.removeAttribute('alt');
    if (!evidence) return;

    damageContextHeading.textContent = evidence.title;
    damageContextScope.textContent = evidence.scope;
    if (evidence.media?.type === 'image') {
      damageContextMedia.hidden = false;
      damageContextMediaLink.href = evidence.media.link;
      damageContextMediaSource.href = evidence.media.link;
      damageContextMediaImage.src = evidence.media.src;
      damageContextMediaImage.alt = evidence.media.alt;
    }

    for (const source of evidence.sources) {
      const item = document.createElement('li');
      const link = document.createElement('a');
      link.href = source.url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = source.title;
      const metadata = document.createElement('span');
      metadata.textContent = `${source.kind} · ${source.date}`;
      const description = document.createElement('p');
      description.textContent = source.description;
      item.append(link, metadata, description);
      damageContextSourceList.append(item);
    }
  }

  function showDamagePresentation(presentation, options) {
    featureInspection.hidden = true;
    damageInspection.hidden = false;
    damageInspection.dataset.status = options.status;
    zoomToDamageClusterButton.hidden = !options.cluster;
    zoomToDamageClusterButton.disabled = false;
    zoomToDamageClusterButton.textContent = 'Zoom further into group';
    selectedMarker.visible = false;
    crossLine.visible = false;
    crossProfileStatus.hidden = true;
    document.getElementById('damage-name').textContent = presentation.name;
    document.getElementById('damage-assessment').textContent = presentation.assessment;
    document.getElementById('damage-evidence').textContent = presentation.evidenceBasis;
    renderDamageSources(presentation.sources);
    renderDamageContext(presentation.contextualEvidence ?? null);
    showRecordPopover({
      anchor: options.anchor,
      geographicAnchor: options.geographicAnchor,
      mode: options.mode,
      cluster: options.cluster,
      title: presentation.name,
      context: options.context,
      primary: options.mode === 'damage-cluster'
        ? `${presentation.assetType} · ${presentation.assessment}`
        : presentation.assessment,
      secondary: options.secondary ?? presentation.evidenceBasis,
    });
    render();
  }

  function showDamageFeature(feature) {
    showOverview();
    const featureElevation = damageFeatureElevation(feature);
    const entry = damageEntryByFeature.get(feature);
    damageLocationData.hidden = false;
    document.getElementById('damage-latitude').textContent = latitudeText(feature.latitude);
    document.getElementById('damage-longitude').textContent = longitudeText(feature.longitude);
    document.getElementById('damage-elevation').textContent = elevationText(featureElevation);
    activateDamagePin(feature);
    updateDamageMarkerVisibility();
    showDamagePresentation(damageFeaturePresentation(feature), {
      mode: 'damage',
      status: feature.status,
      context: 'Documented physical impact',
      anchor: entry?.basePosition ?? damageBasePosition(feature),
      geographicAnchor: [Number(feature.longitude), Number(feature.latitude)],
      secondary: `${latitudeText(feature.latitude)}, ${longitudeText(feature.longitude)} · ${elevationText(featureElevation)}`,
    });
  }

  function showDamageCluster(cluster) {
    showOverview();
    damageLocationData.hidden = true;
    activateDamageCluster(cluster);
    updateDamageMarkerVisibility();
    const clusterLongitude = cluster.features.reduce((sum, feature) => sum + Number(feature.longitude), 0) / cluster.features.length;
    const clusterLatitude = cluster.features.reduce((sum, feature) => sum + Number(feature.latitude), 0) / cluster.features.length;
    showDamagePresentation(damageClusterPresentation(cluster.features), {
      mode: 'damage-cluster',
      status: 'cluster',
      context: 'Nearby impacts grouped at the current viewing scale',
      cluster,
      anchor: cluster.anchorPosition,
      geographicAnchor: [clusterLongitude, clusterLatitude],
    });
  }

  function zoomToDamageCluster(cluster) {
    if (!cluster) return;
    const currentDistance = camera.position.distanceTo(controls.target);
    if (currentDistance <= 675) {
      zoomToDamageClusterButton.disabled = true;
      zoomToDamageClusterButton.textContent = 'Maximum detail reached';
      return;
    }
    const targetDistance = Math.max(
      650,
      Math.min(currentDistance * 0.42, Math.max(900, cluster.horizontalRadius * 4))
    );
    const viewDirection = camera.position.clone().sub(controls.target).normalize();
    controls.target.copy(cluster.anchorPosition);
    camera.position.copy(cluster.anchorPosition).addScaledVector(viewDirection, targetDistance);
    camera.lookAt(controls.target);
    controls.update();
    updateFeatureMarkerScale();
    updateDamageMarkerVisibility();
    if (targetDistance <= 675) {
      zoomToDamageClusterButton.disabled = true;
      zoomToDamageClusterButton.textContent = 'Maximum detail reached';
    }
    render();
  }

  const guidedJourneyTotalChainage = routeValue(route, routeColumnCount, stationCount - 1, 4);
  const guidedJourneyDefaultFov = camera.fov;
  const guidedJourneyFov = 54;
  const guidedJourneyCameraPosition = new THREE.Vector3();
  const guidedJourneyCameraTarget = new THREE.Vector3();
  const guidedJourneyDesiredPosition = new THREE.Vector3();
  const guidedJourneyDesiredTarget = new THREE.Vector3();
  const guidedJourneySafetyPosition = new THREE.Vector3();
  const guidedJourneySample = {
    chainage: 0,
    easting: 0,
    northing: 0,
    elevation: minimumElevation,
    normalEasting: 1,
    normalNorthing: 0,
  };
  const guidedJourneyLookSample = { ...guidedJourneySample };
  const guidedJourneyCameraSample = { ...guidedJourneySample };
  const guidedJourneyPaletteSample = { ...guidedJourneySample };
  const guidedJourneyState = {
    mode: 'idle',
    resumeMode: 'playing',
    frame: null,
    lastTime: null,
    phaseStartedAt: 0,
    chainage: 0,
    nextStopIndex: 0,
    currentStop: null,
    currentItem: null,
    dwellStartedAt: 0,
    dwellDuration: 0,
    dwellRemaining: 0,
    localMinimum: minimumElevation,
    localMaximum: maximumElevation,
    localTargetMinimum: minimumElevation,
    localTargetMaximum: maximumElevation,
    paletteBlend: 0,
    nextPaletteSampleAt: 0,
    nextLegendUpdateAt: 0,
    nextMarkerUpdateAt: 0,
    nextImageryUpdateAt: 0,
    scrubPointerId: null,
    scrubResumePlayback: false,
    stops: [],
  };

  function routeIndexAtGuidedChainage(chainage) {
    const boundedChainage = THREE.MathUtils.clamp(chainage, 0, guidedJourneyTotalChainage);
    let lower = 0;
    let upper = stationCount - 1;
    while (upper - lower > 1) {
      const middle = (lower + upper) >> 1;
      if (routeValue(route, routeColumnCount, middle, 4) <= boundedChainage) lower = middle;
      else upper = middle;
    }
    return lower;
  }

  function writeGuidedRouteSample(chainage, target) {
    const boundedChainage = THREE.MathUtils.clamp(chainage, 0, guidedJourneyTotalChainage);
    const lower = routeIndexAtGuidedChainage(boundedChainage);
    const upper = Math.min(stationCount - 1, lower + 1);
    const lowerChainage = routeValue(route, routeColumnCount, lower, 4);
    const upperChainage = routeValue(route, routeColumnCount, upper, 4);
    const fraction = upperChainage > lowerChainage
      ? (boundedChainage - lowerChainage) / (upperChainage - lowerChainage)
      : 0;
    const interpolateColumn = column => THREE.MathUtils.lerp(
      routeValue(route, routeColumnCount, lower, column),
      routeValue(route, routeColumnCount, upper, column),
      fraction
    );
    target.chainage = boundedChainage;
    target.easting = interpolateColumn(0);
    target.northing = interpolateColumn(1);
    const surfaceElevation = renderedTerrainElevation(target.easting, target.northing);
    target.elevation = Number.isFinite(surfaceElevation) ? surfaceElevation : interpolateColumn(5);
    target.normalEasting = interpolateColumn(7);
    target.normalNorthing = interpolateColumn(8);
    const normalLength = Math.hypot(target.normalEasting, target.normalNorthing) || 1;
    target.normalEasting /= normalLength;
    target.normalNorthing /= normalLength;
    return target;
  }

  function nearestRouteIndexForGuidedPoint(easting, northing) {
    let nearestIndex = 0;
    let nearestDistanceSquared = Infinity;
    for (let index = 0; index < stationCount; index += 4) {
      const dx = routeValue(route, routeColumnCount, index, 0) - easting;
      const dy = routeValue(route, routeColumnCount, index, 1) - northing;
      const distanceSquared = dx * dx + dy * dy;
      if (distanceSquared < nearestDistanceSquared) {
        nearestIndex = index;
        nearestDistanceSquared = distanceSquared;
      }
    }
    const refinementStart = Math.max(0, nearestIndex - 6);
    const refinementEnd = Math.min(stationCount - 1, nearestIndex + 6);
    for (let index = refinementStart; index <= refinementEnd; index += 1) {
      const dx = routeValue(route, routeColumnCount, index, 0) - easting;
      const dy = routeValue(route, routeColumnCount, index, 1) - northing;
      const distanceSquared = dx * dx + dy * dy;
      if (distanceSquared < nearestDistanceSquared) {
        nearestIndex = index;
        nearestDistanceSquared = distanceSquared;
      }
    }
    return nearestIndex;
  }

  function guidedEvidencePriority(feature) {
    const genericName = /^(mapped|documented)\s+(building|bridge|facility|site)/i.test(feature.name ?? '');
    const typePriority = {
      hydropower_facility: 34,
      cultural_heritage: 28,
      bridge: 24,
      building: 10,
    }[feature.asset_type] ?? 0;
    return typePriority + (genericName ? 0 : 36) + (feature.sources?.length ?? 0) * 3;
  }

  function buildGuidedJourneyStops() {
    const stops = [];
    if (sourceControl) {
      stops.push({
        kind: 'control',
        title: 'Glacier-ice detachment source',
        chainage: routeValue(route, routeColumnCount, sourceControl.route_index, 4),
        control: sourceControl,
        duration: 4,
      });
    }
    if (bridgeControl) {
      stops.push({
        kind: 'control',
        title: 'Friendship Bridge observation',
        chainage: routeValue(route, routeColumnCount, bridgeControl.route_index, 4),
        control: bridgeControl,
        duration: 8.5,
      });
    }

    const evidenceGroups = new Map();
    for (const feature of damagePayload.features) {
      const evidence = damageFeaturePresentation(feature).contextualEvidence;
      if (!evidence || evidence.title === 'Miteri Bridge, Rasuwagadhi') continue;
      if (!evidenceGroups.has(evidence.title)) evidenceGroups.set(evidence.title, []);
      evidenceGroups.get(evidence.title).push(feature);
    }
    for (const [title, features] of evidenceGroups) {
      const focusEasting = features.reduce((sum, feature) => sum + Number(feature.easting_m), 0) / features.length;
      const focusNorthing = features.reduce((sum, feature) => sum + Number(feature.northing_m), 0) / features.length;
      const routeIndex = nearestRouteIndexForGuidedPoint(focusEasting, focusNorthing);
      const radius = features.reduce((maximum, feature) => Math.max(
        maximum,
        Math.hypot(Number(feature.easting_m) - focusEasting, Number(feature.northing_m) - focusNorthing)
      ), 0);
      stops.push({
        kind: 'damage',
        title,
        chainage: routeValue(route, routeColumnCount, routeIndex, 4),
        features: [...features].sort((left, right) => guidedEvidencePriority(right) - guidedEvidencePriority(left)),
        focusEasting,
        focusNorthing,
        radius,
        duration: 7,
      });
    }
    return stops.sort((left, right) => left.chainage - right.chainage);
  }

  function resolveGuidedStopItem(stop) {
    if (stop.kind === 'control') {
      const layerId = stop.control.id === 'SOURCE' ? 'source' : 'bridge-reference';
      return layerIsVisible(layerId)
        ? { kind: 'control', layerId, control: stop.control }
        : null;
    }
    const feature = stop.features.find(candidate => layerIsVisible(candidate.asset_type));
    return feature
      ? { kind: 'damage', layerId: feature.asset_type, feature }
      : null;
  }

  function guidedJourneyRegion(chainage) {
    if (chainage < 5_000) return 'Lhende Khola source valley';
    if (chainage < 24_000) return 'Upper Bhote Koshi valley';
    return 'Trishuli river system';
  }

  function guidedJourneySpeed(chainage) {
    const transition = THREE.MathUtils.smoothstep(chainage, 18_000, 72_000);
    return THREE.MathUtils.lerp(420, 1_250, transition);
  }

  function guidedJourneySpeedLabel() {
    const metresPerSecond = guidedJourneyState.mode === 'playing'
      ? guidedJourneySpeed(guidedJourneyState.chainage)
      : 0;
    return `Camera speed ${Math.round(metresPerSecond).toLocaleString('en')} m/s (${Math.round(metresPerSecond * 3.6).toLocaleString('en')} km/h)`;
  }

  function sampleGuidedLocalElevationWindow(chainage) {
    let localMinimum = Infinity;
    let localMaximum = -Infinity;
    const alongOffsets = [-2_400, -1_100, 0, 1_100, 2_400];
    const crossOffsets = [-4_200, -2_200, -900, 0, 900, 2_200, 4_200];
    for (const alongOffset of alongOffsets) {
      writeGuidedRouteSample(chainage + alongOffset, guidedJourneyPaletteSample);
      for (const crossOffset of crossOffsets) {
        const easting = guidedJourneyPaletteSample.easting + guidedJourneyPaletteSample.normalEasting * crossOffset;
        const northing = guidedJourneyPaletteSample.northing + guidedJourneyPaletteSample.normalNorthing * crossOffset;
        if (
          easting < terrainMinimumEasting || easting > terrainMaximumEasting ||
          northing < terrainMinimumNorthing || northing > terrainMaximumNorthing
        ) continue;
        const elevation = renderedTerrainElevation(easting, northing);
        if (!Number.isFinite(elevation)) continue;
        localMinimum = Math.min(localMinimum, elevation);
        localMaximum = Math.max(localMaximum, elevation);
      }
    }
    if (!Number.isFinite(localMinimum) || !Number.isFinite(localMaximum)) return;
    const center = (localMinimum + localMaximum) * 0.5;
    const paddedRange = Math.max(720, (localMaximum - localMinimum) * 1.18);
    guidedJourneyState.localTargetMinimum = Math.max(minimumElevation, center - paddedRange * 0.5);
    guidedJourneyState.localTargetMaximum = Math.min(maximumElevation, center + paddedRange * 0.5);
    if (guidedJourneyState.localTargetMaximum - guidedJourneyState.localTargetMinimum < 720) {
      guidedJourneyState.localTargetMinimum = Math.max(minimumElevation, guidedJourneyState.localTargetMaximum - 720);
      guidedJourneyState.localTargetMaximum = Math.min(maximumElevation, guidedJourneyState.localTargetMinimum + 720);
    }
  }

  function updateGuidedElevationLegend(time) {
    if (time < guidedJourneyState.nextLegendUpdateAt) return;
    guidedJourneyState.nextLegendUpdateAt = time + 180;
    const low = guidedJourneyState.localMinimum;
    const high = guidedJourneyState.localMaximum;
    elevationLegendTitle.textContent = 'Local elevation';
    document.getElementById('elevation-low').textContent = elevationNumber.format(low);
    document.getElementById('elevation-mid').textContent = elevationNumber.format((low + high) * 0.5);
    document.getElementById('elevation-high').textContent = elevationNumber.format(high);
    elevationLegend.setAttribute('aria-label', 'Locally adapting terrain elevation colour scale in metres');
  }

  function updateGuidedLocalPalette(deltaSeconds, time) {
    if (time >= guidedJourneyState.nextPaletteSampleAt) {
      sampleGuidedLocalElevationWindow(guidedJourneyState.chainage);
      guidedJourneyState.nextPaletteSampleAt = time + 260;
    }
    const easing = 1 - Math.exp(-Math.max(0, deltaSeconds) * 2.4);
    guidedJourneyState.localMinimum = THREE.MathUtils.lerp(
      guidedJourneyState.localMinimum,
      guidedJourneyState.localTargetMinimum,
      easing
    );
    guidedJourneyState.localMaximum = THREE.MathUtils.lerp(
      guidedJourneyState.localMaximum,
      guidedJourneyState.localTargetMaximum,
      easing
    );
    guidedJourneyState.paletteBlend = THREE.MathUtils.lerp(
      guidedJourneyState.paletteBlend,
      1,
      1 - Math.exp(-Math.max(0, deltaSeconds) * 1.8)
    );
    terrainPaletteUniforms.minimum.value = guidedJourneyState.localMinimum - minimumElevation;
    terrainPaletteUniforms.range.value = Math.max(1, guidedJourneyState.localMaximum - guidedJourneyState.localMinimum);
    terrainPaletteUniforms.blend.value = guidedJourneyState.paletteBlend;
    updateGuidedElevationLegend(time);
  }

  function restoreGlobalElevationPalette() {
    terrainPaletteUniforms.blend.value = 0;
    terrainPaletteUniforms.minimum.value = 0;
    terrainPaletteUniforms.range.value = elevationRange;
    elevationLegendTitle.textContent = 'Elevation';
    document.getElementById('elevation-low').textContent = elevationNumber.format(minimumElevation);
    document.getElementById('elevation-mid').textContent = elevationNumber.format((minimumElevation + maximumElevation) * 0.5);
    document.getElementById('elevation-high').textContent = elevationNumber.format(maximumElevation);
    elevationLegend.setAttribute('aria-label', 'Terrain elevation colour scale in metres');
  }

  function guidedTravelPose(chainage, time, positionTarget, lookTarget) {
    const trailingDistance = THREE.MathUtils.lerp(
      1_400,
      2_400,
      THREE.MathUtils.smoothstep(chainage, 12_000, 85_000)
    ) * THREE.MathUtils.smoothstep(chainage, 0, 4_500);
    writeGuidedRouteSample(chainage - trailingDistance, guidedJourneyCameraSample);
    const lookAhead = THREE.MathUtils.lerp(
      3_600,
      5_600,
      THREE.MathUtils.smoothstep(chainage, 12_000, 85_000)
    );
    writeGuidedRouteSample(chainage + lookAhead, guidedJourneyLookSample);
    const lateralAmplitude = THREE.MathUtils.lerp(
      75,
      180,
      THREE.MathUtils.smoothstep(chainage, 10_000, 90_000)
    );
    const lateralOffset = Math.sin(chainage / 7_600 + time * 0.000025) * lateralAmplitude;
    const cameraEasting = guidedJourneyCameraSample.easting + guidedJourneyCameraSample.normalEasting * lateralOffset;
    const cameraNorthing = guidedJourneyCameraSample.northing + guidedJourneyCameraSample.normalNorthing * lateralOffset;
    const cameraSurface = renderedTerrainElevation(cameraEasting, cameraNorthing);
    const localRelief = guidedJourneyState.localMaximum - guidedJourneyState.localMinimum;
    const clearance = THREE.MathUtils.clamp(460 + localRelief * 0.04, 580, 820);
    const targetLift = THREE.MathUtils.clamp(210 + localRelief * 0.035, 260, 480);
    const routeFloorY = displayElevationY(guidedJourneyCameraSample.elevation);
    const surfaceY = displayElevationY(Number.isFinite(cameraSurface) ? cameraSurface : guidedJourneyCameraSample.elevation);
    positionTarget.set(
      cameraEasting - originX,
      Math.max(surfaceY + 300, routeFloorY + clearance),
      -(cameraNorthing - originY)
    );
    lookTarget.set(
      guidedJourneyLookSample.easting - originX,
      displayElevationY(guidedJourneyLookSample.elevation) + targetLift,
      -(guidedJourneyLookSample.northing - originY)
    );
  }

  function guidedDwellPose(time, positionTarget, lookTarget) {
    const stop = guidedJourneyState.currentStop;
    if (!stop) {
      guidedTravelPose(guidedJourneyState.chainage, time, positionTarget, lookTarget);
      return;
    }
    const progress = THREE.MathUtils.clamp(
      (time - guidedJourneyState.dwellStartedAt) / Math.max(1, guidedJourneyState.dwellDuration * 1000),
      0,
      1
    );
    const visibleFeatures = stop.kind === 'damage'
      ? stop.features.filter(feature => layerIsVisible(feature.asset_type))
      : [];
    const focusEasting = visibleFeatures.length
      ? visibleFeatures.reduce((sum, feature) => sum + Number(feature.easting_m), 0) / visibleFeatures.length
      : stop.kind === 'control'
        ? Number(stop.control.easting_m ?? routeValue(route, routeColumnCount, stop.control.route_index, 0))
        : stop.focusEasting;
    const focusNorthing = visibleFeatures.length
      ? visibleFeatures.reduce((sum, feature) => sum + Number(feature.northing_m), 0) / visibleFeatures.length
      : stop.kind === 'control'
        ? Number(stop.control.northing_m ?? routeValue(route, routeColumnCount, stop.control.route_index, 1))
        : stop.focusNorthing;
    const visibleRadius = visibleFeatures.reduce((maximum, feature) => Math.max(
      maximum,
      Math.hypot(Number(feature.easting_m) - focusEasting, Number(feature.northing_m) - focusNorthing)
    ), stop.radius ?? 0);
    const sourceOverview = stop.kind === 'control' && stop.control.id === 'SOURCE';
    const cameraDistance = sourceOverview
      ? 9_000
      : THREE.MathUtils.clamp(3_000 + visibleRadius * 1.3, 3_000, 6_000);
    const cameraChainage = sourceOverview
      ? Math.min(guidedJourneyTotalChainage, stop.chainage + cameraDistance)
      : stop.chainage < cameraDistance * 0.8
        ? stop.chainage + cameraDistance
        : stop.chainage - cameraDistance;
    writeGuidedRouteSample(cameraChainage, guidedJourneyCameraSample);
    writeGuidedRouteSample(stop.chainage, guidedJourneyLookSample);
    const arc = THREE.MathUtils.lerp(-0.78, 0.78, THREE.MathUtils.smootherstep(progress, 0, 1));
    const lateralOffset = Math.sin(arc) * (sourceOverview
      ? 1_200
      : THREE.MathUtils.clamp(220 + visibleRadius * 0.24, 220, 620));
    const cameraEasting = guidedJourneyCameraSample.easting + guidedJourneyLookSample.normalEasting * lateralOffset;
    const cameraNorthing = guidedJourneyCameraSample.northing + guidedJourneyLookSample.normalNorthing * lateralOffset;
    const cameraSurface = renderedTerrainElevation(cameraEasting, cameraNorthing);
    const focusSurface = renderedTerrainElevation(focusEasting, focusNorthing);
    const routeFloorY = displayElevationY(guidedJourneyCameraSample.elevation);
    const surfaceY = displayElevationY(Number.isFinite(cameraSurface) ? cameraSurface : guidedJourneyCameraSample.elevation);
    const cameraHeight = sourceOverview
      ? Math.max(surfaceY + 3_500, displayElevationY(guidedJourneyState.localMaximum) + 4_200)
      : Math.max(surfaceY + 340, routeFloorY + 680 + Math.min(280, visibleRadius * 0.1));
    positionTarget.set(
      cameraEasting - originX,
      cameraHeight,
      -(cameraNorthing - originY)
    );
    lookTarget.set(
      focusEasting - originX,
      displayElevationY(Number.isFinite(focusSurface) ? focusSurface : guidedJourneyLookSample.elevation) + (sourceOverview ? 650 : 300),
      -(focusNorthing - originY)
    );
  }

  function applyGuidedCameraSafety() {
    const cameraEasting = camera.position.x + originX;
    const cameraNorthing = originY - camera.position.z;
    if (
      cameraEasting < terrainMinimumEasting || cameraEasting > terrainMaximumEasting ||
      cameraNorthing < terrainMinimumNorthing || cameraNorthing > terrainMaximumNorthing
    ) return;
    const elevation = renderedTerrainElevation(cameraEasting, cameraNorthing);
    if (!Number.isFinite(elevation)) return;
    const minimumSafeY = displayElevationY(elevation) + 210;
    if (camera.position.y < minimumSafeY) camera.position.y = minimumSafeY;
  }

  function updateGuidedJourneyHud() {
    const progress = THREE.MathUtils.clamp(guidedJourneyState.chainage / guidedJourneyTotalChainage, 0, 1);
    const percent = Math.round(progress * 100);
    const speedLabel = guidedJourneySpeedLabel();
    guidedJourneyProgress.setAttribute('aria-valuenow', String(percent));
    guidedJourneyProgress.setAttribute(
      'aria-valuetext',
      `${(guidedJourneyState.chainage / 1000).toFixed(1)} km of ${(guidedJourneyTotalChainage / 1000).toFixed(1)} km`
    );
    guidedJourneyProgress.style.setProperty('--journey-progress', `${progress * 100}%`);
    guidedJourneyProgressFill.style.transform = `scaleX(${progress})`;
    if (guidedJourneyState.mode === 'dwelling' && guidedJourneyState.currentStop) {
      guidedJourneyTitle.textContent = guidedJourneyState.currentStop.title;
      const elapsed = (performance.now() - guidedJourneyState.dwellStartedAt) / 1000;
      const remaining = Math.max(0, Math.ceil(guidedJourneyState.dwellDuration - elapsed));
      guidedJourneyStatus.textContent = `${speedLabel} · Evidence stop · continuing in ${remaining} s`;
      return;
    }
    if (guidedJourneyState.mode === 'scrubbing') {
      guidedJourneyTitle.textContent = 'Guided flood-path journey';
      guidedJourneyStatus.textContent = `Previewing route position · ${guidedJourneyRegion(guidedJourneyState.chainage)} · ${(guidedJourneyState.chainage / 1000).toFixed(1)} of ${(guidedJourneyTotalChainage / 1000).toFixed(1)} km`;
      return;
    }
    if (guidedJourneyState.mode === 'paused') {
      guidedJourneyTitle.textContent = guidedJourneyState.currentStop?.title ?? 'Guided flood-path journey';
      guidedJourneyStatus.textContent = `${speedLabel} · Paused · explore freely, adjust layers, or resume`;
      return;
    }
    if (guidedJourneyState.mode === 'completed') {
      guidedJourneyTitle.textContent = 'Journey complete';
      guidedJourneyStatus.textContent = `${speedLabel} · ${(guidedJourneyTotalChainage / 1000).toFixed(1)} km flood pathway · explore freely or restart`;
      return;
    }
    guidedJourneyTitle.textContent = 'Guided flood-path journey';
    guidedJourneyStatus.textContent = `${speedLabel} · ${guidedJourneyRegion(guidedJourneyState.chainage)} · ${(guidedJourneyState.chainage / 1000).toFixed(1)} of ${(guidedJourneyTotalChainage / 1000).toFixed(1)} km`;
  }

  function updateGuidedPauseButton() {
    const paused = guidedJourneyState.mode === 'paused';
    const completed = guidedJourneyState.mode === 'completed';
    const label = completed ? 'Restart' : paused ? 'Resume' : 'Pause';
    guidedJourneyPauseButton.setAttribute('aria-label', `${label} guided journey`);
    guidedJourneyPauseButton.querySelector('.guided-journey-action-label').textContent = label;
    guidedJourneyPauseButton.querySelector('svg').innerHTML = completed || paused
      ? '<path d="m7 4 9 6-9 6Z"></path>'
      : '<path d="M6.5 4.5v11M13.5 4.5v11"></path>';
  }

  function setGuidedJourneyRenderQuality(moving) {
    terrainMesh.material = guidedJourneyState.mode === 'idle'
      ? terrainMaterial
      : guidedTerrainMaterial;
    terrainMesh.visible = layerIsVisible('terrain');
    navigationTerrainMesh.visible = false;
    if (satelliteSurfaceState.mesh) satelliteSurfaceState.mesh.visible = true;
    if (satelliteSurfaceState.navigationMesh) satelliteSurfaceState.navigationMesh.visible = false;
    renderer.setPixelRatio(moving ? movingRendererPixelRatio : settledRendererPixelRatio);
  }

  function setGuidedJourneyInteraction(active) {
    controls.enabled = !active;
    updateSceneModeButtons(active);
    for (const button of terrainToolButtons) button.disabled = active;
    setGuidedJourneyRenderQuality(active);
  }

  function beginGuidedStop(stop, time) {
    const item = resolveGuidedStopItem(stop);
    if (!item) return false;
    guidedJourneyState.mode = 'dwelling';
    guidedJourneyState.currentStop = stop;
    guidedJourneyState.currentItem = item;
    guidedJourneyState.chainage = stop.chainage;
    guidedJourneyState.dwellStartedAt = time;
    guidedJourneyState.dwellDuration = stop.duration;
    if (item.kind === 'control') showFeature(item.control);
    else showDamageFeature(item.feature);
    updateGuidedPauseButton();
    updateGuidedJourneyHud();
    return true;
  }

  function closeGuidedStop() {
    if (guidedJourneyState.currentItem) closeRecordInspection();
    guidedJourneyState.currentStop = null;
    guidedJourneyState.currentItem = null;
    guidedJourneyState.dwellStartedAt = 0;
    guidedJourneyState.dwellDuration = 0;
  }

  function guidedJourneyProgressAtClientX(clientX) {
    const bounds = guidedJourneyProgress.getBoundingClientRect();
    if (bounds.width <= 0) return 0;
    return THREE.MathUtils.clamp((clientX - bounds.left) / bounds.width, 0, 1);
  }

  function guidedJourneyStopIndexAtChainage(chainage) {
    const index = guidedJourneyState.stops.findIndex(stop => stop.chainage >= chainage - 0.5);
    return index === -1 ? guidedJourneyState.stops.length : index;
  }

  function beginGuidedJourneyScrub() {
    if (guidedJourneyState.mode === 'idle' || guidedJourneyState.mode === 'scrubbing') return false;
    guidedJourneyState.scrubResumePlayback = ['starting', 'playing', 'dwelling', 'resuming'].includes(guidedJourneyState.mode);
    if (guidedJourneyState.frame !== null) cancelAnimationFrame(guidedJourneyState.frame);
    guidedJourneyState.frame = null;
    closeGuidedStop();
    guidedJourneyState.mode = 'scrubbing';
    guidedJourneyState.resumeMode = 'playing';
    guidedJourneyState.lastTime = null;
    terrainPanel.dataset.guidedJourney = 'scrubbing';
    guidedJourneyProgress.setAttribute('data-scrubbing', '');
    setGuidedJourneyInteraction(true);
    updateGuidedPauseButton();
    return true;
  }

  function seekGuidedJourney(progress) {
    const time = performance.now();
    guidedJourneyState.chainage = THREE.MathUtils.clamp(progress, 0, 1) * guidedJourneyTotalChainage;
    guidedJourneyState.nextStopIndex = guidedJourneyStopIndexAtChainage(guidedJourneyState.chainage);
    sampleGuidedLocalElevationWindow(guidedJourneyState.chainage);
    guidedJourneyState.localMinimum = guidedJourneyState.localTargetMinimum;
    guidedJourneyState.localMaximum = guidedJourneyState.localTargetMaximum;
    guidedJourneyState.paletteBlend = 1;
    guidedJourneyState.nextPaletteSampleAt = time + 260;
    guidedJourneyState.nextLegendUpdateAt = 0;
    terrainPaletteUniforms.minimum.value = guidedJourneyState.localMinimum - minimumElevation;
    terrainPaletteUniforms.range.value = Math.max(1, guidedJourneyState.localMaximum - guidedJourneyState.localMinimum);
    terrainPaletteUniforms.blend.value = 1;
    updateGuidedElevationLegend(time);
    guidedTravelPose(guidedJourneyState.chainage, time, guidedJourneyDesiredPosition, guidedJourneyDesiredTarget);
    camera.position.copy(guidedJourneyDesiredPosition);
    controls.target.copy(guidedJourneyDesiredTarget);
    applyGuidedCameraSafety();
    camera.lookAt(controls.target);
    controls.update();
    updateFeatureMarkerScale();
    updateDamageMarkerVisibility();
    updateGuidedJourneyHud();
    render();
  }

  function endGuidedJourneyScrub() {
    if (guidedJourneyState.mode !== 'scrubbing') return;
    const resumePlayback = guidedJourneyState.scrubResumePlayback && guidedJourneyState.chainage < guidedJourneyTotalChainage;
    guidedJourneyState.scrubPointerId = null;
    guidedJourneyState.scrubResumePlayback = false;
    guidedJourneyState.nextStopIndex = guidedJourneyStopIndexAtChainage(guidedJourneyState.chainage);
    guidedJourneyState.lastTime = null;
    guidedJourneyProgress.removeAttribute('data-scrubbing');
    if (resumePlayback) {
      guidedJourneyState.mode = 'playing';
      guidedJourneyState.resumeMode = 'playing';
      terrainPanel.dataset.guidedJourney = 'playing';
      setGuidedJourneyInteraction(true);
    } else if (guidedJourneyState.chainage >= guidedJourneyTotalChainage) {
      guidedJourneyState.mode = 'completed';
      terrainPanel.dataset.guidedJourney = 'completed';
      setGuidedJourneyInteraction(false);
    } else {
      guidedJourneyState.mode = 'paused';
      guidedJourneyState.resumeMode = 'playing';
      terrainPanel.dataset.guidedJourney = 'paused';
      setGuidedJourneyInteraction(false);
    }
    updateGuidedPauseButton();
    updateGuidedJourneyHud();
    updateFeatureMarkerScale();
    updateDamageMarkerVisibility();
    nativeImageryTileManager.updateCamera();
    render();
    if (guidedJourneyState.mode === 'playing') {
      guidedJourneyState.frame = requestAnimationFrame(animateGuidedJourney);
    }
  }

  function nextEnabledGuidedStop(time) {
    while (guidedJourneyState.nextStopIndex < guidedJourneyState.stops.length) {
      const stop = guidedJourneyState.stops[guidedJourneyState.nextStopIndex];
      if (stop.chainage > guidedJourneyState.chainage + 0.5) return false;
      if (beginGuidedStop(stop, time)) return true;
      guidedJourneyState.nextStopIndex += 1;
    }
    return false;
  }

  function finishGuidedJourney() {
    if (guidedJourneyState.frame !== null) cancelAnimationFrame(guidedJourneyState.frame);
    guidedJourneyState.frame = null;
    guidedJourneyState.mode = 'completed';
    guidedJourneyState.chainage = guidedJourneyTotalChainage;
    guidedJourneyState.lastTime = null;
    setGuidedJourneyInteraction(false);
    terrainPanel.dataset.guidedJourney = 'completed';
    updateGuidedPauseButton();
    updateGuidedJourneyHud();
    updateFeatureMarkerScale();
    updateDamageMarkerVisibility();
    nativeImageryTileManager.updateCamera();
    render();
  }

  function animateGuidedJourney(time) {
    guidedJourneyState.frame = null;
    if (!['starting', 'playing', 'dwelling', 'resuming'].includes(guidedJourneyState.mode)) return;
    const deltaSeconds = guidedJourneyState.lastTime === null
      ? 0
      : Math.min(0.05, Math.max(0, (time - guidedJourneyState.lastTime) / 1000));
    guidedJourneyState.lastTime = time;

    if (guidedJourneyState.mode === 'playing') {
      guidedJourneyState.chainage = Math.min(
        guidedJourneyTotalChainage,
        guidedJourneyState.chainage + guidedJourneySpeed(guidedJourneyState.chainage) * deltaSeconds
      );
      nextEnabledGuidedStop(time);
    } else if (guidedJourneyState.mode === 'dwelling') {
      if (time - guidedJourneyState.dwellStartedAt >= guidedJourneyState.dwellDuration * 1000) {
        closeGuidedStop();
        guidedJourneyState.nextStopIndex += 1;
        guidedJourneyState.mode = 'playing';
      }
    }

    updateGuidedLocalPalette(deltaSeconds, time);
    if (guidedJourneyState.mode === 'dwelling') {
      guidedDwellPose(time, guidedJourneyDesiredPosition, guidedJourneyDesiredTarget);
    } else {
      guidedTravelPose(guidedJourneyState.chainage, time, guidedJourneyDesiredPosition, guidedJourneyDesiredTarget);
    }

    if (guidedJourneyState.mode === 'starting') {
      const progress = THREE.MathUtils.clamp((time - guidedJourneyState.phaseStartedAt) / 1_800, 0, 1);
      const eased = THREE.MathUtils.smootherstep(progress, 0, 1);
      camera.position.copy(guidedJourneyCameraPosition).lerp(guidedJourneyDesiredPosition, eased);
      controls.target.copy(guidedJourneyCameraTarget).lerp(guidedJourneyDesiredTarget, eased);
      if (progress >= 1) {
        guidedJourneyState.mode = 'playing';
        guidedJourneyState.lastTime = time;
        nextEnabledGuidedStop(time);
      }
    } else if (guidedJourneyState.mode === 'resuming') {
      const progress = THREE.MathUtils.clamp((time - guidedJourneyState.phaseStartedAt) / 1_350, 0, 1);
      const eased = THREE.MathUtils.smootherstep(progress, 0, 1);
      camera.position.copy(guidedJourneyCameraPosition).lerp(guidedJourneyDesiredPosition, eased);
      controls.target.copy(guidedJourneyCameraTarget).lerp(guidedJourneyDesiredTarget, eased);
      if (progress >= 1) {
        guidedJourneyState.mode = guidedJourneyState.resumeMode;
        if (guidedJourneyState.mode === 'dwelling') {
          guidedJourneyState.dwellStartedAt = time;
          guidedJourneyState.dwellDuration = guidedJourneyState.dwellRemaining;
        }
        guidedJourneyState.lastTime = time;
        updateGuidedPauseButton();
      }
    } else {
      const cameraEasing = 1 - Math.exp(-deltaSeconds * 3.4);
      const targetEasing = 1 - Math.exp(-deltaSeconds * 4.2);
      camera.position.lerp(guidedJourneyDesiredPosition, cameraEasing);
      controls.target.lerp(guidedJourneyDesiredTarget, targetEasing);
    }
    applyGuidedCameraSafety();
    camera.lookAt(controls.target);

    if (time >= guidedJourneyState.nextMarkerUpdateAt) {
      updateFeatureMarkerScale();
      updateDamageMarkerVisibility();
      guidedJourneyState.nextMarkerUpdateAt = time + 50;
    } else {
      updateActivePinScale();
    }
    if (time >= guidedJourneyState.nextImageryUpdateAt) {
      nativeImageryTileManager.updateCamera();
      guidedJourneyState.nextImageryUpdateAt = time + 240;
    }
    updateGuidedJourneyHud();
    render();

    if (guidedJourneyState.mode === 'playing' && guidedJourneyState.chainage >= guidedJourneyTotalChainage) {
      finishGuidedJourney();
      return;
    }
    guidedJourneyState.frame = requestAnimationFrame(animateGuidedJourney);
  }

  function pauseGuidedJourney() {
    if (!['starting', 'playing', 'dwelling', 'resuming'].includes(guidedJourneyState.mode)) return;
    if (guidedJourneyState.frame !== null) cancelAnimationFrame(guidedJourneyState.frame);
    guidedJourneyState.frame = null;
    guidedJourneyState.resumeMode = guidedJourneyState.mode === 'dwelling' ? 'dwelling' : 'playing';
    if (guidedJourneyState.mode === 'dwelling') {
      const elapsed = (performance.now() - guidedJourneyState.dwellStartedAt) / 1000;
      guidedJourneyState.dwellRemaining = Math.max(1.5, guidedJourneyState.dwellDuration - elapsed);
    }
    guidedJourneyState.mode = 'paused';
    guidedJourneyState.lastTime = null;
    controls.enabled = true;
    setGuidedJourneyRenderQuality(false);
    terrainPanel.dataset.guidedJourney = 'paused';
    updateGuidedJourneyHud();
    updateGuidedPauseButton();
    updateFeatureMarkerScale();
    updateDamageMarkerVisibility();
    nativeImageryTileManager.updateCamera();
    render();
  }

  function resumeGuidedJourney() {
    if (guidedJourneyState.mode !== 'paused') return;
    if (
      guidedJourneyState.resumeMode === 'dwelling' &&
      guidedJourneyState.currentItem &&
      !layerIsVisible(guidedJourneyState.currentItem.layerId)
    ) {
      closeGuidedStop();
      guidedJourneyState.nextStopIndex += 1;
      guidedJourneyState.resumeMode = 'playing';
    }
    guidedJourneyCameraPosition.copy(camera.position);
    guidedJourneyCameraTarget.copy(controls.target);
    guidedJourneyState.mode = 'resuming';
    guidedJourneyState.phaseStartedAt = performance.now();
    guidedJourneyState.lastTime = null;
    controls.enabled = false;
    setGuidedJourneyRenderQuality(true);
    terrainPanel.dataset.guidedJourney = 'playing';
    guidedJourneyStatus.textContent = 'Returning smoothly to the guided pathway…';
    updateGuidedPauseButton();
    guidedJourneyState.frame = requestAnimationFrame(animateGuidedJourney);
  }

  function exitGuidedJourney() {
    if (guidedJourneyState.mode === 'idle') return;
    if (guidedJourneyState.frame !== null) cancelAnimationFrame(guidedJourneyState.frame);
    guidedJourneyState.frame = null;
    closeGuidedStop();
    guidedJourneyState.mode = 'idle';
    guidedJourneyState.lastTime = null;
    guidedJourneyState.scrubPointerId = null;
    guidedJourneyState.scrubResumePlayback = false;
    guidedJourneyProgress.removeAttribute('data-scrubbing');
    guidedJourneyState.paletteBlend = 0;
    guidedJourneyControls.hidden = true;
    terrainPanel.removeAttribute('data-guided-journey');
    camera.fov = guidedJourneyDefaultFov;
    camera.updateProjectionMatrix();
    setGuidedJourneyInteraction(false);
    restoreGlobalElevationPalette();
    updateFeatureMarkerScale();
    updateDamageMarkerVisibility();
    nativeImageryTileManager.updateCamera();
    render();
  }

  async function beginGuidedJourney() {
    if (guidedJourneyState.mode !== 'idle') exitGuidedJourney();
    if (activeSceneMode !== '3d') await setSceneMode('3d');
    if (layersDrawer.getAttribute('aria-hidden') === 'false') setLayersDrawerOpen(false);
    closeRecordInspection();
    resetTerrainAnalysisState();
    remainingSpatialTravel = 0;
    if (spatialTravelFrame !== null) cancelAnimationFrame(spatialTravelFrame);
    spatialTravelFrame = null;
    orbitInteractionActive = false;
    if (orbitRenderFrame !== null) cancelAnimationFrame(orbitRenderFrame);
    orbitRenderFrame = null;

    guidedJourneyState.stops = buildGuidedJourneyStops();
    guidedJourneyState.mode = 'starting';
    guidedJourneyState.resumeMode = 'playing';
    guidedJourneyState.chainage = 0;
    guidedJourneyState.nextStopIndex = 0;
    guidedJourneyState.currentStop = null;
    guidedJourneyState.currentItem = null;
    guidedJourneyState.localMinimum = minimumElevation;
    guidedJourneyState.localMaximum = maximumElevation;
    guidedJourneyState.localTargetMinimum = minimumElevation;
    guidedJourneyState.localTargetMaximum = maximumElevation;
    guidedJourneyState.paletteBlend = 0;
    guidedJourneyState.nextPaletteSampleAt = 0;
    guidedJourneyState.nextLegendUpdateAt = 0;
    guidedJourneyState.nextMarkerUpdateAt = 0;
    guidedJourneyState.nextImageryUpdateAt = 0;
    guidedJourneyState.scrubPointerId = null;
    guidedJourneyState.scrubResumePlayback = false;
    guidedJourneyProgress.removeAttribute('data-scrubbing');
    guidedJourneyState.phaseStartedAt = performance.now();
    guidedJourneyState.lastTime = null;
    guidedJourneyCameraPosition.copy(camera.position);
    guidedJourneyCameraTarget.copy(controls.target);
    camera.fov = guidedJourneyFov;
    camera.updateProjectionMatrix();
    guidedJourneyControls.hidden = false;
    terrainPanel.dataset.guidedJourney = 'playing';
    setGuidedJourneyInteraction(true);
    updateGuidedPauseButton();
    updateGuidedJourneyHud();
    guidedJourneyState.frame = requestAnimationFrame(animateGuidedJourney);
  }

  pauseGuidedJourneyForOverlay = pauseGuidedJourney;

  function setLayerVisibility(layerId, visible) {
    if (SATELLITE_SURFACE_METADATA_URLS.has(layerId)) {
      void setSatelliteSurfaceVisibility(layerId, visible);
      return;
    }
    layerVisibility.set(layerId, visible);
    gis2dScene?.setLayerVisibility(layerId, visible);
    const toggle = document.querySelector(`[data-layer-toggle="${layerId}"]`);
    if (toggle) toggle.checked = visible;
    if (layerId === 'terrain') {
      const navigationActive = spatialTravelFrame !== null || orbitInteractionActive;
      terrainMesh.visible = visible && !navigationActive;
      navigationTerrainMesh.visible = visible && navigationActive;
      elevationLegend.hidden = !visible || Boolean(satelliteSurfaceState.activeLayerId);
      render();
      return;
    }
    if (layerId === 'flow-path') {
      routeCasing.visible = visible;
      routeLine.visible = visible;
      routePoints.visible = visible;
      if (!visible && (panelState.mode === 'point' || panelState.mode === 'measurement')) {
        showOverview();
      } else {
        render();
      }
      return;
    }
    if (layerId === 'detachment-zone') {
      detachmentZoneGroup.visible = visible && Boolean(detachmentZoneFeature);
      render();
      return;
    }
    const floodExtentLayer = floodExtent3DLayers.get(layerId);
    if (floodExtentLayer) {
      floodExtentLayer.group.visible = visible && floodExtentLayer.segmentCount > 0;
      render();
      return;
    }
    for (const marker of featureMarkers) {
      if (marker.layerId === layerId) marker.group.visible = visible;
    }
    if (!visible && activePinState.layerId === layerId) closeRecordInspection();
    updateFeatureMarkerScale();
    updateDamageMarkerVisibility();
    updateActivePinScale();
    render();
  }

  function focusWorldPosition(position, preferredDistance, verticalOffset = 90) {
    const viewDirection = camera.position.clone().sub(controls.target);
    if (viewDirection.lengthSq() < 1) viewDirection.set(0.66, 0.9, -0.66);
    viewDirection.normalize();
    viewDirection.y = Math.max(Math.abs(viewDirection.y), 0.38);
    viewDirection.normalize();
    const currentDistance = camera.position.distanceTo(controls.target);
    const targetDistance = Math.max(
      controls.minDistance,
      Math.min(currentDistance, preferredDistance)
    );
    const target = position.clone();
    target.y += verticalOffset;
    controls.target.copy(target);
    camera.position.copy(target).addScaledVector(viewDirection, targetDistance);
    camera.lookAt(target);
    controls.update();
    updateFeatureMarkerScale();
    updateDamageMarkerVisibility();
    updateActivePinScale();
  }

  function locateFeatureControl(control) {
    const marker = featureMarkerByControl.get(control);
    if (!marker) return;
    setLayerVisibility(marker.layerId, true);
    if (activeSceneMode === '2d') gis2dScene?.focusControl(control);
    else focusWorldPosition(marker.group.position, control.id === 'SOURCE' ? 8_500 : 6_500, 180);
    showFeature(control);
  }

  function locateDamageFeature(feature) {
    const entry = damageEntryByFeature.get(feature);
    if (!entry) return;
    setLayerVisibility(entry.collection.layerId, true);
    const preferredDistance = feature.asset_type === 'building'
      ? 2_400
      : feature.asset_type === 'bridge'
        ? 3_200
        : 3_600;
    if (activeSceneMode === '2d') gis2dScene?.focusDamage(feature);
    else focusWorldPosition(entry.basePosition, preferredDistance, 115);
    showDamageFeature(feature);
  }

  function statusLabel(status) {
    return status ? `${status[0].toUpperCase()}${status.slice(1)}` : 'Documented impact';
  }

  const layerCatalog = [
    {
      id: 'source',
      title: 'Glacier-ice source',
      summary: 'event marker',
      items: sourceControl ? [{
        id: sourceControl.id,
        name: 'Glacier-ice detachment source',
        detail: `${locationDescription(
          sourceControl.latitude,
          sourceControl.longitude,
          routeValue(route, routeColumnCount, sourceControl.route_index, 5)
        )} · Seismic onset ${displayUtc(sourceControl.utc)}`,
        locate: () => locateFeatureControl(sourceControl),
      }] : [],
    },
    {
      id: 'bridge-reference',
      title: 'Friendship Bridge',
      summary: 'timing marker',
      items: bridgeControl ? [{
        id: bridgeControl.id,
        name: 'Friendship Bridge, Rasuwagadhi–Gyirong',
        detail: `${locationDescription(
          bridgeControl.latitude,
          bridgeControl.longitude,
          routeValue(route, routeColumnCount, bridgeControl.route_index, 5)
        )} · Flood arrival ${displayUtc(bridgeControl.utc)}`,
        locate: () => locateFeatureControl(bridgeControl),
      }] : [],
    },
    ...[
      ['building', 'Buildings'],
      ['bridge', 'Bridges'],
      ['hydropower_facility', 'Hydropower facilities'],
      ['cultural_heritage', 'Cultural heritage'],
    ].map(([id, title]) => ({
      id,
      title,
      summary: 'documented impacts',
      items: damagePayload.features
        .filter(feature => feature.asset_type === id)
        .sort((left, right) => left.name.localeCompare(right.name) || left.id.localeCompare(right.id))
        .map(feature => {
          const featureElevation = damageFeatureElevation(feature);
          return {
            id: feature.id,
            name: feature.name,
            detail: `${locationDescription(feature.latitude, feature.longitude, featureElevation)} · ${statusLabel(feature.status)}`,
            locate: () => locateDamageFeature(feature),
          };
        }),
    })),
  ];
  const layerById = new Map(layerCatalog.map(layer => [layer.id, layer]));

  function openLayerList(layerId) {
    const layer = layerById.get(layerId);
    if (!layer) return;
    layerListTitle.textContent = layer.title;
    layerListSummary.textContent = `${layer.items.length.toLocaleString('en')} ${layer.summary}`;
    const fragment = document.createDocumentFragment();
    for (const item of layer.items) {
      const row = document.createElement('div');
      row.className = 'layer-feature-row';
      row.setAttribute('role', 'listitem');
      const copy = document.createElement('div');
      copy.className = 'layer-feature-copy';
      const name = document.createElement('strong');
      name.textContent = item.name;
      const detail = document.createElement('small');
      detail.textContent = item.detail;
      copy.append(name, detail);
      const locateButton = document.createElement('button');
      locateButton.type = 'button';
      locateButton.className = 'layer-feature-locate';
      locateButton.setAttribute('aria-label', `Locate ${item.name} in the terrain`);
      locateButton.innerHTML = '<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="4"></circle><path d="M10 2v3M10 15v3M2 10h3M15 10h3"></path></svg><span>Locate</span>';
      locateButton.addEventListener('click', () => {
        layerListDialog.close();
        setLayersDrawerOpen(false);
        item.locate();
      });
      row.append(copy, locateButton);
      fragment.append(row);
    }
    layerFeatureList.replaceChildren(fragment);
    if (!layerListDialog.open) layerListDialog.showModal();
  }

  for (const layer of layerCatalog) {
    const count = document.querySelector(`[data-layer-count="${layer.id}"]`);
    if (count) count.textContent = layer.items.length.toLocaleString('en');
  }
  for (const toggle of document.querySelectorAll('[data-layer-toggle]')) {
    toggle.addEventListener('change', () => {
      const layerId = toggle.dataset.layerToggle;
      setLayerVisibility(layerId, toggle.checked);
    });
  }
  for (const button of document.querySelectorAll('[data-layer-list]')) {
    button.addEventListener('click', () => openLayerList(button.dataset.layerList));
  }
  layersButton.disabled = false;
  overviewLayersButton.disabled = false;
  guidedJourneyLaunchButton.disabled = false;
  guidedJourneyLaunchButton.addEventListener('click', () => void beginGuidedJourney());
  guidedJourneyProgress.addEventListener('pointerdown', event => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    if (!beginGuidedJourneyScrub()) return;
    event.preventDefault();
    event.stopPropagation();
    guidedJourneyState.scrubPointerId = event.pointerId;
    guidedJourneyProgress.setPointerCapture(event.pointerId);
    guidedJourneyProgress.focus({ preventScroll: true });
    seekGuidedJourney(guidedJourneyProgressAtClientX(event.clientX));
  });
  guidedJourneyProgress.addEventListener('pointermove', event => {
    if (guidedJourneyState.mode !== 'scrubbing' || guidedJourneyState.scrubPointerId !== event.pointerId) return;
    event.preventDefault();
    seekGuidedJourney(guidedJourneyProgressAtClientX(event.clientX));
  });
  guidedJourneyProgress.addEventListener('pointerup', event => {
    if (guidedJourneyState.mode !== 'scrubbing' || guidedJourneyState.scrubPointerId !== event.pointerId) return;
    event.preventDefault();
    seekGuidedJourney(guidedJourneyProgressAtClientX(event.clientX));
    endGuidedJourneyScrub();
  });
  guidedJourneyProgress.addEventListener('pointercancel', event => {
    if (guidedJourneyState.mode === 'scrubbing' && guidedJourneyState.scrubPointerId === event.pointerId) {
      endGuidedJourneyScrub();
    }
  });
  guidedJourneyProgress.addEventListener('lostpointercapture', () => {
    if (guidedJourneyState.mode === 'scrubbing') endGuidedJourneyScrub();
  });
  guidedJourneyProgress.addEventListener('keydown', event => {
    const currentProgress = THREE.MathUtils.clamp(
      guidedJourneyState.chainage / guidedJourneyTotalChainage,
      0,
      1
    );
    const step = event.shiftKey ? 0.05 : 0.01;
    let targetProgress = null;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') targetProgress = currentProgress - step;
    else if (event.key === 'ArrowRight' || event.key === 'ArrowUp') targetProgress = currentProgress + step;
    else if (event.key === 'PageDown') targetProgress = currentProgress - 0.1;
    else if (event.key === 'PageUp') targetProgress = currentProgress + 0.1;
    else if (event.key === 'Home') targetProgress = 0;
    else if (event.key === 'End') targetProgress = 1;
    if (targetProgress === null) return;
    event.preventDefault();
    event.stopPropagation();
    if (!beginGuidedJourneyScrub()) return;
    seekGuidedJourney(targetProgress);
    endGuidedJourneyScrub();
  });
  guidedJourneyLayersButton.addEventListener('click', () => setLayersDrawerOpen(true));
  guidedJourneyPauseButton.addEventListener('click', () => {
    if (guidedJourneyState.mode === 'paused') resumeGuidedJourney();
    else if (guidedJourneyState.mode === 'completed') void beginGuidedJourney();
    else pauseGuidedJourney();
  });
  guidedJourneyExitButton.addEventListener('click', exitGuidedJourney);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) pauseGuidedJourney();
  });
  updateSceneModeButtons(false);
  for (const button of sceneModeButtons) {
    button.addEventListener('click', () => void setSceneMode(button.dataset.sceneMode));
  }
  basemapSelect.addEventListener('change', event => {
    if (gis2dScene) void gis2dScene.setBasemap(event.currentTarget.value);
  });
  for (const button of terrainToolButtons) {
    button.disabled = false;
    button.addEventListener('click', () => beginTerrainAnalysis(button.dataset.terrainTool));
  }
  newTerrainAnalysisButton.addEventListener('click', resetTerrainAnalysisSelection);

  function showOverview() {
    selectionSequence += 1;
    resetMeasurementState();
    resetTerrainAnalysisState();
    closeRecordInspection({ clearSelection: false });
    clearActivePin();
    updateDamageMarkerVisibility();
    panelState.mode = 'overview';
    panelState.selectedIndex = null;
    panelState.damageCluster = null;
    panelState.returnMode = 'overview';
    panelState.returnIndex = null;
    overviewPanel.hidden = false;
    featureInspection.hidden = true;
    damageInspection.hidden = true;
    pointInspection.hidden = true;
    measurementPanel.hidden = true;
    terrainAnalysisPanel.hidden = true;
    selectedMarker.visible = false;
    crossLine.visible = false;
    crossProfileStatus.hidden = true;
    setPanelHeader(
      '2026 Nepal Debris Avalanche and Flash Flood',
      '',
      null,
      true
    );
    requestAnimationFrame(() => {
      overviewMaps?.detail.invalidateSize({ animate: false });
      overviewMaps?.context.invalidateSize({ animate: false });
    });
    render();
  }

  function closeMeasurement() {
    const returnMode = panelState.returnMode;
    const returnIndex = panelState.returnIndex;
    resetMeasurementState();
    measurementPanel.hidden = true;
    if (returnMode === 'point' && returnIndex !== null) {
      selectLocation(returnIndex);
    } else {
      showOverview();
    }
  }

  function beginMeasurement(startIndex = null, preserveReturnContext = false) {
    if (!layerIsVisible('flow-path')) return;
    if (!preserveReturnContext) {
      panelState.returnMode = panelState.mode === 'point' ? 'point' : 'overview';
      panelState.returnIndex = panelState.mode === 'point' ? panelState.selectedIndex : null;
    }
    selectionSequence += 1;
    resetMeasurementState();
    resetTerrainAnalysisState();
    closeRecordInspection({ clearSelection: false });
    clearActivePin();
    updateDamageMarkerVisibility();
    measurementState.phase = 'selecting';
    panelState.mode = 'measurement';
    panelState.damageCluster = null;
    overviewPanel.hidden = true;
    featureInspection.hidden = true;
    damageInspection.hidden = true;
    pointInspection.hidden = true;
    terrainAnalysisPanel.hidden = true;
    measurementPanel.hidden = false;
    terrainPanel.dataset.mode = 'measure';
    selectedMarker.visible = false;
    crossLine.visible = false;
    loadStatus.hidden = true;

    if (startIndex === null) {
      measurementInstruction.textContent = 'Click the route to place endpoint A.';
      setPanelHeader('Measure along path', 'Select two locations on the reconstructed route', 'Cancel');
    } else {
      measurementState.indices.push(startIndex);
      gis2dScene?.setMeasurement(measurementState.indices);
      measurementMarkerA.position.copy(routeScenePosition(startIndex, 55));
      measurementMarkerA.visible = true;
      measurementStepA.className = 'measurement-step is-complete';
      measurementStepB.className = 'measurement-step is-current';
      measurementADetail.textContent = endpointDetail(startIndex);
      measurementInstruction.textContent = 'A is the inspected location. Click the route to place endpoint B.';
      setPanelHeader('Measure along path', 'Endpoint A is set; choose endpoint B', 'Cancel');
    }
    render();
  }

  function formatDistance(metres) {
    return metres >= 1000 ? `${fixed(metres / 1000, 3)} km` : `${fixed(metres, 0)} m`;
  }

  function completeMeasurement(startIndex, endIndex) {
    const direction = endIndex >= startIndex ? 1 : -1;
    const sampleCount = Math.abs(endIndex - startIndex) + 1;
    const distancesKm = new Float64Array(sampleCount);
    const elevations = new Float64Array(sampleCount);
    const segmentPositions = new Float32Array(sampleCount * 3);
    const startChainage = routeValue(route, routeColumnCount, startIndex, 4);

    for (let sample = 0; sample < sampleCount; sample += 1) {
      const index = startIndex + sample * direction;
      const chainage = routeValue(route, routeColumnCount, index, 4);
      distancesKm[sample] = Math.abs(chainage - startChainage) / 1000;
      elevations[sample] = routeValue(route, routeColumnCount, index, 5);
      segmentPositions[sample * 3] = routePositions[index * 3];
      segmentPositions[sample * 3 + 1] = routePositions[index * 3 + 1] + 32;
      segmentPositions[sample * 3 + 2] = routePositions[index * 3 + 2];
    }

    measurementGeometry.setAttribute('position', new THREE.BufferAttribute(segmentPositions, 3));
    measurementGeometry.computeBoundingSphere();
    measurementLine.visible = true;
    const pathDistance = Math.abs(routeValue(route, routeColumnCount, endIndex, 4) - startChainage);
    const elevationChange = routeValue(route, routeColumnCount, endIndex, 5) - routeValue(route, routeColumnCount, startIndex, 5);
    document.getElementById('measurement-distance').textContent = formatDistance(pathDistance);
    document.getElementById('measurement-elevation-change').textContent = `${elevationChange >= 0 ? '+' : ''}${fixed(elevationChange, 1)} m`;
    measurementState.phase = 'complete';
    gis2dScene?.setMeasurement(measurementState.indices);
    measurementInstruction.textContent = 'Computed along the reconstructed route; elevation change is B minus A.';
    measurementResults.hidden = false;
    terrainPanel.removeAttribute('data-mode');
    setPanelHeader('Measurement A–B', 'Along the reconstructed flow path', 'Close');
    drawElevationProfile(longitudinalSvg, distancesKm, elevations, {
      title: 'Along-path elevation profile from A to B',
      xAxisLabel: 'Distance from A (km)',
    });
    render();
  }

  function addMeasurementLocation(index) {
    if (measurementState.phase !== 'selecting') return;
    if (measurementState.indices.length === 0) {
      measurementState.indices.push(index);
      gis2dScene?.setMeasurement(measurementState.indices);
      measurementMarkerA.position.copy(routeScenePosition(index, 55));
      measurementMarkerA.visible = true;
      measurementStepA.className = 'measurement-step is-complete';
      measurementStepB.className = 'measurement-step is-current';
      measurementADetail.textContent = endpointDetail(index);
      measurementInstruction.textContent = 'A is set. Click a different route location to place B.';
      render();
      return;
    }

    const startIndex = measurementState.indices[0];
    if (index === startIndex) {
      measurementInstruction.textContent = 'A and B must be different route locations.';
      return;
    }
    measurementState.indices.push(index);
    gis2dScene?.setMeasurement(measurementState.indices);
    measurementMarkerB.position.copy(routeScenePosition(index, 55));
    measurementMarkerB.visible = true;
    measurementStepB.className = 'measurement-step is-complete';
    measurementBDetail.textContent = endpointDetail(index);
    completeMeasurement(startIndex, index);
  }

  function handleRouteSelection(index) {
    if (panelState.mode === 'measurement' && measurementState.phase === 'selecting') {
      addMeasurementLocation(index);
      return;
    }
    if (panelState.mode === 'measurement') return;
    selectLocation(index);
  }

  pointMeasureButton.addEventListener('click', () => beginMeasurement(panelState.selectedIndex));
  newMeasurementButton.addEventListener('click', () => beginMeasurement(null, true));
  zoomToDamageClusterButton.addEventListener('click', () => zoomToDamageCluster(recordState.cluster));
  panelExitButton.addEventListener('click', () => {
    if (
      panelState.mode === 'point' ||
      panelState.mode === 'feature' ||
      panelState.mode === 'damage' ||
      panelState.mode === 'damage-cluster'
    ) showOverview();
    else if (panelState.mode === 'measurement') closeMeasurement();
    else if (panelState.mode === 'terrain-analysis') showOverview();
  });

  const raycaster = new THREE.Raycaster();
  raycaster.params.Points.threshold = 120;
  const pointer = new THREE.Vector2();
  let pointerDown = null;
  function setRaycasterFromEvent(event) {
    const bounds = canvas.getBoundingClientRect();
    pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
    pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
  }
  function markerHitFromEvent(event) {
    setRaycasterFromEvent(event);
    const featureHit = raycaster.intersectObjects(
      featureHitTargets.filter(target => layerIsVisible(target.userData.featureLayerId)),
      false
    )[0] ?? null;
    if (featureHit) return { type: 'event', value: featureHit.object.userData.featureControl };
    const clusterHit = raycaster.intersectObject(damageClusterHit, false)[0] ?? null;
    if (clusterHit && Number.isInteger(clusterHit.instanceId)) {
      return {
        type: 'damage-cluster',
        value: clusterHit.object.userData.damageClusters[clusterHit.instanceId],
      };
    }
    const damageTargets = damageMarkerCollections
      .filter(collection => collection.visible)
      .map(collection => collection.hitTarget);
    const damageHit = raycaster.intersectObjects(damageTargets, false)[0] ?? null;
    if (damageHit && Number.isInteger(damageHit.instanceId)) {
      return {
        type: 'damage',
        value: damageHit.object.userData.damageFeatures[damageHit.instanceId],
      };
    }
    return null;
  }

  function terrainAnalysisPointFromEvent(event) {
    setRaycasterFromEvent(event);
    const hit = raycaster.intersectObject(terrainMesh, false)[0] ?? null;
    if (!hit) return null;
    const easting = hit.point.x + originX;
    const northing = originY - hit.point.z;
    const elevation = renderedTerrainElevation(easting, northing);
    if (!Number.isFinite(elevation)) return null;
    return { easting, northing, elevation, longitude: NaN, latitude: NaN };
  }
  canvas.addEventListener('pointerdown', event => { pointerDown = { x: event.clientX, y: event.clientY }; });
  canvas.addEventListener('pointermove', event => {
    if (terrainAnalysisState.mode && terrainAnalysisState.phase === 'selecting') {
      canvas.style.cursor = 'crosshair';
      return;
    }
    if (pointerDown) {
      canvas.style.cursor = orbitInteractionActive ? 'grabbing' : '';
      return;
    }
    canvas.style.cursor = markerHitFromEvent(event) ? 'pointer' : '';
  });
  canvas.addEventListener('pointerleave', () => { canvas.style.cursor = ''; });
  canvas.addEventListener('pointerup', event => {
    const downPosition = pointerDown;
    pointerDown = null;
    if (!downPosition || Math.hypot(event.clientX - downPosition.x, event.clientY - downPosition.y) > 5) return;
    if (terrainAnalysisState.mode && terrainAnalysisState.phase === 'selecting') {
      const point = terrainAnalysisPointFromEvent(event);
      if (point) addTerrainAnalysisPoint(point);
      else terrainAnalysisInstruction.textContent = 'Select a location within the DEM terrain.';
      return;
    }
    const markerHit = markerHitFromEvent(event);
    if (markerHit) {
      pauseGuidedJourneyForOverlay();
      if (markerHit.type === 'event') showFeature(markerHit.value);
      else if (markerHit.type === 'damage-cluster') showDamageCluster(markerHit.value);
      else showDamageFeature(markerHit.value);
      return;
    }
    const routeHits = layerIsVisible('flow-path')
      ? raycaster.intersectObject(routePoints, false)
      : [];
    if (routeHits.length) {
      handleRouteSelection(routeHits[0].index);
    }
  });

  resize();
  loadStatus.hidden = true;
  showOverview();
}

start().catch(error => {
  loadStatus.textContent = `Viewer initialization failed: ${error.message}`;
  console.error(error);
});
