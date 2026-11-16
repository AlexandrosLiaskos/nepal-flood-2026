const SURFACE_SECTIONS = [
  {
    title: 'High-resolution optical imagery',
    datasets: [
      {
        id: 'vantor-pre-20260205',
        sortTime: '2026-02-05T08:17:49Z',
        title: 'Vantor LG06 · 5 February 2026',
        detail: 'Pre-event · 08:17:49 UTC · 1 scene · 0% catalogue cloud',
        thumbnail: './assets/satellite/vantor-lg06-pre-20260205-thumb.webp?v=20260829-3',
        sourceUrl: 'https://vantor-opendata.s3.amazonaws.com/events/Nepal-Flooding-Aug-2026/collection.json',
        variants: [
          ['satellite-pre-vantor-lg06-20260205', 'True colour', 'LG06 · 1.41 m multispectral GSD', './assets/satellite/vantor-lg06-pre-20260205.json?v=20260829-3'],
        ],
      },
      {
        id: 'planetscope-pre',
        sortTime: '2026-05-27T05:32:26Z',
        title: 'PlanetScope · 27 May 2026',
        detail: 'Pre-event · Planet · 5 scenes',
        thumbnail: './assets/satellite/planet-pre-20260527-thumb.webp?v=20260829-3',
        sourceUrl: 'https://source.coop/planet/disasterdata/nepal-flash-flood-2026-08-26/pre-event/2026-05-27/',
        variants: [
          ['satellite-pre-planetscope-20260527', 'True colour', 'Red · green · blue · 3 m delivered pixels', './assets/satellite/planet-pre-20260527.json?v=20260829-3'],
          ['satellite-pre-planetscope-20260527-cir', 'Colour infrared', 'Reflectance-calibrated NIR · red · green', './assets/satellite/planet-pre-20260527-cir.json?v=20260829-3'],
          ['satellite-pre-planetscope-20260527-ndvi', 'NDVI', 'Reflectance-calibrated vegetation response', './assets/satellite/planet-pre-20260527-ndvi.json?v=20260829-3'],
          ['satellite-pre-planetscope-20260527-ndwi', 'NDWI', 'Reflectance-calibrated green–NIR water response', './assets/satellite/planet-pre-20260527-ndwi.json?v=20260829-3'],
          ['satellite-pre-planetscope-20260527-quality', 'Data quality', 'UDM2 pixel classification', './assets/satellite/planet-pre-20260527-quality.json?v=20260829-3'],
        ],
      },
      {
        id: 'planetscope-post',
        sortTime: '2026-08-26T05:45:02Z',
        title: 'PlanetScope · 26 August 2026',
        detail: 'Post-event · Planet · 9 scenes',
        thumbnail: './assets/satellite/planet-post-20260826-thumb.webp?v=20260829-3',
        sourceUrl: 'https://source.coop/planet/disasterdata/nepal-flash-flood-2026-08-26/post-event/2026-08-26/',
        variants: [
          ['satellite-post-planetscope-20260826', 'True colour', 'Red · green · blue · 3 m delivered pixels', './assets/satellite/planet-post-20260826.json?v=20260829-3'],
          ['satellite-post-planetscope-20260826-cir', 'Colour infrared', 'Reflectance-calibrated NIR · red · green', './assets/satellite/planet-post-20260826-cir.json?v=20260829-3'],
          ['satellite-post-planetscope-20260826-ndvi', 'NDVI', 'Reflectance-calibrated vegetation response', './assets/satellite/planet-post-20260826-ndvi.json?v=20260829-3'],
          ['satellite-post-planetscope-20260826-ndwi', 'NDWI', 'Reflectance-calibrated green–NIR water response', './assets/satellite/planet-post-20260826-ndwi.json?v=20260829-3'],
          ['satellite-post-planetscope-20260826-quality', 'Data quality', 'UDM2 pixel classification', './assets/satellite/planet-post-20260826-quality.json?v=20260829-3'],
        ],
      },
      {
        id: 'worldview-post',
        sortTime: '2026-08-26T23:00:00Z',
        title: 'WorldView · 26 August 2026',
        detail: 'Post-event · Vantor · composite',
        thumbnail: './assets/satellite/oam-vantor-post-20260826-thumb.webp?v=20260828-2',
        sourceUrl: 'https://api.openaerialmap.org/meta/6a90f57bf93a44f85f488422',
        variants: [
          ['satellite-post-worldview-20260826', 'True colour', 'Red · green · blue', './assets/satellite/oam-vantor-post-20260826.json?v=20260828-4'],
        ],
      },
      {
        id: 'skysat-post',
        sortTime: '2026-08-27T02:00:55Z',
        title: 'SkySat · 27 August 2026',
        detail: 'Post-event · Planet · 2 scenes',
        thumbnail: './assets/satellite/planet-skysat-post-20260827-thumb.webp?v=20260828-2',
        sourceUrl: 'https://source.coop/planet/disasterdata/nepal-flash-flood-2026-08-26/post-event/2026-08-27/',
        variants: [
          ['satellite-post-skysat-20260827', 'True colour', 'Red · green · blue · 0.5 m delivered pixels', './assets/satellite/planet-skysat-post-20260827.json?v=20260829-3'],
          ['satellite-post-skysat-20260827-cir', 'Colour infrared', 'Qualitative uncalibrated NIR · red · green', './assets/satellite/planet-skysat-post-20260827-cir.json?v=20260829-3'],
          ['satellite-post-skysat-20260827-quality', 'Data quality', 'Usable-data mask', './assets/satellite/planet-skysat-post-20260827-quality.json?v=20260829-3'],
        ],
      },
      {
        id: 'pelican-post',
        sortTime: '2026-08-27T06:09:59Z',
        title: 'Pelican · 27 August 2026',
        detail: 'Post-event · Planet · 3 scenes',
        thumbnail: './assets/satellite/planet-pelican-post-20260827-thumb.webp?v=20260828-2',
        sourceUrl: 'https://source.coop/planet/disasterdata/nepal-flash-flood-2026-08-26/post-event/pelican-2026-08-27/',
        variants: [
          ['satellite-post-pelican-20260827', 'True colour', 'Red · green · blue · 0.5 m delivered pixels', './assets/satellite/planet-pelican-post-20260827.json?v=20260829-3'],
          ['satellite-post-pelican-20260827-cir', 'Colour infrared', 'Qualitative uncalibrated NIR · red · green', './assets/satellite/planet-pelican-post-20260827-cir.json?v=20260829-3'],
          ['satellite-post-pelican-20260827-quality', 'Data quality', 'UDM2 pixel classification', './assets/satellite/planet-pelican-post-20260827-quality.json?v=20260829-3'],
        ],
      },
      {
        id: 'copernicus-ems-post-20260827',
        sortTime: '2026-08-27T12:09:00Z',
        title: 'Copernicus EMS · 27 August 2026',
        detail: 'Post-event · 4 orthorectified scenes · AOI01–AOI03',
        thumbnail: './assets/satellite/emsr927-aoi01-worldview3-20260827-thumb.webp?v=20260829-3',
        sourceUrl: 'https://rapidmapping.emergency.copernicus.eu/EMSR927',
        variants: [
          ['satellite-post-emsr927-aoi03-blacksky-20260827', 'AOI03 · BlackSky', 'Bidur · 12:09:00 UTC · 0.97 m', './assets/satellite/emsr927-aoi03-blacksky-20260827.json?v=20260829-3'],
          ['satellite-post-emsr927-aoi01-worldview3-20260827', 'AOI01 · WorldView-3', 'Syapru Besi · 05:05:00 UTC · 0.5 m', './assets/satellite/emsr927-aoi01-worldview3-20260827.json?v=20260829-3'],
          ['satellite-post-emsr927-aoi02-legion-20260827', 'AOI02 · Legion', 'Timure · 05:05:00 UTC · 0.5 m', './assets/satellite/emsr927-aoi02-legion-20260827.json?v=20260829-3'],
          ['satellite-post-emsr927-aoi03-satellogic-20260827', 'AOI03 · Satellogic', 'Bidur · 04:22:00 UTC · 1 m', './assets/satellite/emsr927-aoi03-satellogic-20260827.json?v=20260829-3'],
        ],
      },
      {
        id: 'vantor-post-20260828',
        sortTime: '2026-08-28T05:22:46Z',
        title: 'Vantor Open Data · 28 August 2026',
        detail: 'Post-event · 5 RGB scenes · 05:07–05:22 UTC',
        thumbnail: './assets/satellite/vantor-b030001100cf1110-post-20260828-thumb.webp?v=20260829-3',
        sourceUrl: 'https://vantor-opendata.s3.amazonaws.com/events/Nepal-Flooding-Aug-2026/collection.json',
        variants: [
          ['satellite-post-vantor-b110001101165110-20260828', 'Legion · B110…5110', '05:22:46 UTC · 1.46 m · 78% catalogue cloud', './assets/satellite/vantor-b110001101165110-post-20260828.json?v=20260829-3'],
          ['satellite-post-vantor-b030001100cf1610-20260828', 'WorldView-2 · B030…1610', '05:08:06 UTC · 1.92 m · 79% catalogue cloud', './assets/satellite/vantor-b030001100cf1610-post-20260828.json?v=20260829-3'],
          ['satellite-post-vantor-b030001100cf1210-20260828', 'WorldView-2 · B030…1210', '05:07:57 UTC · 1.97 m · 74% catalogue cloud', './assets/satellite/vantor-b030001100cf1210-post-20260828.json?v=20260829-3'],
          ['satellite-post-vantor-b030001100cf1310-20260828', 'WorldView-2 · B030…1310', '05:07:35 UTC · 2.10 m · 78% catalogue cloud', './assets/satellite/vantor-b030001100cf1310-post-20260828.json?v=20260829-3'],
          ['satellite-post-vantor-b030001100cf1110-20260828', 'WorldView-2 · B030…1110', '05:07:26 UTC · 2.21 m · 81% catalogue cloud', './assets/satellite/vantor-b030001100cf1110-post-20260828.json?v=20260829-3'],
        ],
      },
      {
        id: 'ncdc-planetscope-post-20260828',
        sortTime: '2026-08-28T04:57:44Z',
        title: 'PlanetScope · 28 August 2026',
        detail: 'Post-event · NCDC emergency response · 04:57:42–04:57:44 UTC',
        thumbnail: './assets/satellite/ncdc-planetscope-post-20260828-thumb.webp?v=20260829-3',
        sourceUrl: 'https://s3.ncdc.ac.cn/ncdc/data/emergency/674669dd-ea53-4433-8c2b-e839e86d721c/%E8%A5%BF%E8%97%8F%E6%97%A5%E5%96%80%E5%88%99%E5%B8%82%E5%90%89%E9%9A%86%E5%8E%BF%E6%B3%A5%E7%9F%B3%E6%B5%81%E7%81%BE%E5%AE%B3%EF%BC%8820260826%EF%BC%89Planet%20scope%20%E5%8D%AB%E6%98%9F3m%20DOM%E6%95%B0%E6%8D%AE_after.zip',
        variants: [
          ['satellite-post-ncdc-planetscope-20260828', 'True colour', 'Reflectance-calibrated red · green · blue · 3 m analytic composite', './assets/satellite/ncdc-planetscope-post-20260828.json?v=20260829-3'],
          ['satellite-post-ncdc-planetscope-20260828-cir', 'Colour infrared', 'Reflectance-calibrated NIR · red · green', './assets/satellite/ncdc-planetscope-post-20260828-cir.json?v=20260829-3'],
          ['satellite-post-ncdc-planetscope-20260828-ndvi', 'NDVI', 'Reflectance-calibrated vegetation response', './assets/satellite/ncdc-planetscope-post-20260828-ndvi.json?v=20260829-3'],
          ['satellite-post-ncdc-planetscope-20260828-ndwi', 'NDWI', 'Reflectance-calibrated green–NIR water response', './assets/satellite/ncdc-planetscope-post-20260828-ndwi.json?v=20260829-3'],
          ['satellite-post-ncdc-planetscope-20260828-ndre', 'NDRE', 'Reflectance-calibrated NIR–red-edge response', './assets/satellite/ncdc-planetscope-post-20260828-ndre.json?v=20260829-3'],
          ['satellite-post-ncdc-planetscope-20260828-quality', 'Data quality', 'UDM2 pixel classification', './assets/satellite/ncdc-planetscope-post-20260828-quality.json?v=20260829-3'],
        ],
      },
    ],
  },
  {
    title: 'Open satellite analysis',
    datasets: [
      {
        id: 'landsat9-post',
        title: 'Landsat 9 · 26 August 2026',
        detail: 'Post-event · USGS/NASA · 2 scenes',
        thumbnail: './assets/satellite/landsat9-20260826-true-thumb.webp?v=20260828-4',
        sourceUrl: 'https://planetarycomputer.microsoft.com/dataset/landsat-c2-l2',
        variants: [
          ['satellite-post-landsat9-20260826-true', 'True colour', 'Red · green · blue', './assets/satellite/landsat9-20260826-true.json?v=20260828-4'],
          ['satellite-post-landsat9-20260826-swir', 'SWIR false colour', 'SWIR1 · NIR · red', './assets/satellite/landsat9-20260826-swir.json?v=20260828-4'],
          ['satellite-post-landsat9-20260826-ndwi', 'NDWI', 'Clear QA pixels', './assets/satellite/landsat9-20260826-ndwi.json?v=20260828-4'],
          ['satellite-post-landsat9-20260826-mndwi', 'MNDWI', 'Clear QA pixels', './assets/satellite/landsat9-20260826-mndwi.json?v=20260828-4'],
          ['satellite-post-landsat9-20260826-quality', 'Data quality', 'QA_PIXEL classification', './assets/satellite/landsat9-20260826-quality.json?v=20260828-4'],
        ],
      },
      {
        id: 'sentinel2-pre',
        title: 'Sentinel-2 L2A · pre-event check',
        detail: '12–24 August · two orbital comparisons',
        thumbnail: './assets/satellite/s2a-20260824-o119-swir-thumb.webp?v=20260828-4',
        sourceUrl: 'https://planetarycomputer.microsoft.com/dataset/sentinel-2-l2a',
        variants: [
          ['satellite-pre-s2c-20260812-o119-swir', '12 August · orbit 119', 'Baseline · SWIR/NIR/green', './assets/satellite/s2c-20260812-o119-swir.json?v=20260828-4'],
          ['satellite-pre-s2a-20260824-o119-swir', '24 August · orbit 119', 'Pre-event · SWIR/NIR/green', './assets/satellite/s2a-20260824-o119-swir.json?v=20260828-4'],
          ['satellite-pre-s2a-20260824-o119-ndwi', 'NDWI · orbit 119', 'Clear SCL pixels', './assets/satellite/s2a-20260824-o119-ndwi.json?v=20260828-4'],
          ['satellite-pre-s2a-20260824-o119-mndwi', 'MNDWI · orbit 119', 'Clear SCL pixels', './assets/satellite/s2a-20260824-o119-mndwi.json?v=20260828-4'],
          ['satellite-pre-s2a-20260824-o119-quality', 'Classification · orbit 119', 'Sentinel-2 SCL', './assets/satellite/s2a-20260824-o119-quality.json?v=20260828-4'],
          ['satellite-pre-s2b-20260814-o076-swir', '14 August · orbit 76', 'Baseline · SWIR/NIR/green', './assets/satellite/s2b-20260814-o076-swir.json?v=20260828-4'],
          ['satellite-pre-s2b-20260824-o076-swir', '24 August · orbit 76', 'Pre-event · SWIR/NIR/green', './assets/satellite/s2b-20260824-o076-swir.json?v=20260828-4'],
          ['satellite-pre-s2b-20260824-o076-ndwi', 'NDWI · orbit 76', 'Clear SCL pixels', './assets/satellite/s2b-20260824-o076-ndwi.json?v=20260828-4'],
          ['satellite-pre-s2b-20260824-o076-mndwi', 'MNDWI · orbit 76', 'Clear SCL pixels', './assets/satellite/s2b-20260824-o076-mndwi.json?v=20260828-4'],
          ['satellite-pre-s2b-20260824-o076-quality', 'Classification · orbit 76', 'Sentinel-2 SCL', './assets/satellite/s2b-20260824-o076-quality.json?v=20260828-4'],
        ],
      },
      {
        id: 'sentinel1-pre',
        title: 'Sentinel-1D RTC · pre-event check',
        detail: 'C-band radar · VV · descending orbit 19',
        thumbnail: './assets/satellite/sentinel1-20260824-vv-thumb.webp?v=20260828-4',
        sourceUrl: 'https://planetarycomputer.microsoft.com/dataset/sentinel-1-rtc',
        variants: [
          ['satellite-pre-sentinel1-monsoon-vv', 'Monsoon baseline VV', 'Median of four scenes', './assets/satellite/sentinel1-monsoon-vv.json?v=20260828-4'],
          ['satellite-pre-sentinel1-20260812-vv', '12 August VV', 'Control observation', './assets/satellite/sentinel1-20260812-vv.json?v=20260828-4'],
          ['satellite-pre-sentinel1-20260824-vv', '24 August VV', 'Pre-event · 00:18 UTC', './assets/satellite/sentinel1-20260824-vv.json?v=20260828-4'],
          ['satellite-pre-sentinel1-20260824-change', 'VV change', '24 August minus baseline', './assets/satellite/sentinel1-20260824-change.json?v=20260828-4'],
        ],
      },
    ],
  },
];

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

const OPEN_SATELLITE_FAMILIES = [
  ['sentinel-2', 'Sentinel-2 L2A'],
  ['sentinel-1', 'Sentinel-1 RTC'],
  ['landsat-9', 'Landsat 9 Collection 2'],
];

const EXCLUDED_OPEN_SATELLITE_DATASETS = new Set([
  'sentinel-2-20260802',
  'sentinel-2-20260809',
  'sentinel-2-20260811',
  'sentinel-2-20260814',
  'sentinel-2-20260817',
  'sentinel-2-20260819',
  'sentinel-1-20260804-r085',
  'sentinel-1-20260807-r121',
  'sentinel-1-20260809-r158',
  'sentinel-1-20260819-r121',
  'sentinel-1-20260821-r158',
  'landsat-9-20260801',
  'landsat-9-20260817',
]);

function utcAcquisitionLabel(start, end) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) return '';
  const startTime = startDate.toISOString().slice(11, 19);
  const endTime = endDate.toISOString().slice(11, 19);
  return startTime === endTime ? `${startTime} UTC` : `${startTime}–${endTime} UTC`;
}

function detailWithAcquisitionTime(detail, start, end) {
  const time = utcAcquisitionLabel(start, end);
  if (!time) return detail;
  const parts = detail.split(' · ');
  parts.splice(1, 0, time);
  return parts.join(' · ');
}

async function loadOpenSatelliteSections() {
  try {
    const response = await fetch('./assets/satellite/open-satellite-catalog.json?v=20260830-1');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const catalog = await response.json();
    return OPEN_SATELLITE_FAMILIES.map(([family, title]) => {
      const familyLayers = catalog.layers.filter(layer => (
        layer.family === family && !EXCLUDED_OPEN_SATELLITE_DATASETS.has(layer.dataset_id)
      ));
      const grouped = new Map();
      for (const layer of familyLayers) {
        if (!grouped.has(layer.dataset_id)) {
          grouped.set(layer.dataset_id, {
            id: layer.dataset_id,
            title: layer.dataset_title,
            detail: layer.dataset_detail,
            acquisitionDate: layer.acquisition_date,
            acquisitionStartUtc: layer.acquisition_start_utc,
            acquisitionEndUtc: layer.acquisition_end_utc,
            sourceUrl: layer.source_url,
            variants: [],
          });
        }
        grouped.get(layer.dataset_id).variants.push([
          layer.id,
          layer.variant_title,
          layer.variant_detail,
          layer.metadata_url,
          Number(layer.variant_order) || 0,
          layer.thumbnail_url,
        ]);
      }
      const datasets = [...grouped.values()]
        .map(dataset => {
          dataset.variants.sort((first, second) => first[4] - second[4]);
          dataset.thumbnail = dataset.variants[0]?.[5] ?? '';
          dataset.detail = `${detailWithAcquisitionTime(
            dataset.detail,
            dataset.acquisitionStartUtc,
            dataset.acquisitionEndUtc
          )} · ${dataset.variants.length} layers`;
          dataset.variants = dataset.variants.map(([id, variantTitle, detail, metadataUrl]) => [id, variantTitle, detail, metadataUrl]);
          return dataset;
        })
        .sort((first, second) => second.acquisitionDate.localeCompare(first.acquisitionDate));
      return { title, datasets };
    }).filter(section => section.datasets.length > 0);
  } catch (error) {
    console.warn(`Expanded open-satellite catalogue unavailable: ${error.message}`);
    return [SURFACE_SECTIONS[1]];
  }
}

export async function renderSurfaceLayerControls(container) {
  const highResolutionSection = {
    ...SURFACE_SECTIONS[0],
    datasets: [...SURFACE_SECTIONS[0].datasets]
      .sort((first, second) => second.sortTime.localeCompare(first.sortTime)),
  };
  const sections = [highResolutionSection, ...await loadOpenSatelliteSections()];
  const imageryDetailControl = document.querySelector('.imagery-detail-control');
  for (const section of sections) {
    container.append(element('p', 'layer-subgroup-heading', section.title));
    if (section === sections[0] && imageryDetailControl) container.append(imageryDetailControl);
    for (const dataset of section.datasets) {
      const details = element('details', 'surface-dataset');
      details.dataset.surfaceDataset = dataset.id;
      details.name = 'surface-datasets';

      const summary = element('summary', 'surface-dataset-summary');
      const thumbnail = element('span', 'layer-symbol layer-symbol-satellite');
      const image = document.createElement('img');
      image.src = dataset.thumbnail;
      image.alt = '';
      image.decoding = 'async';
      thumbnail.append(image);

      const copy = element('span', 'surface-dataset-copy');
      copy.append(element('strong', '', dataset.title), element('small', '', dataset.detail));
      summary.append(thumbnail, copy);
      details.append(summary);

      const renderings = element('div', 'surface-renderings');
      for (const [layerId, title, detail, metadataUrl] of dataset.variants) {
        const label = element('label', 'surface-rendering-option');
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.dataset.layerToggle = layerId;
        input.dataset.metadataUrl = metadataUrl;
        const optionCopy = element('span', 'surface-rendering-copy');
        optionCopy.append(element('strong', '', title), element('small', '', detail));
        label.append(input, optionCopy);
        renderings.append(label);
      }

      const source = element('a', 'surface-dataset-source', 'Source ↗');
      source.href = dataset.sourceUrl;
      source.target = '_blank';
      source.rel = 'noopener noreferrer';
      renderings.append(source);
      details.append(renderings);
      container.append(details);
    }
  }
}
