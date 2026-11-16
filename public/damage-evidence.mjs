const ASSET_TYPE_LABELS = {
  building: 'Building',
  bridge: 'Bridge',
  hydropower_facility: 'Hydropower facility',
  cultural_heritage: 'Cultural-heritage site',
};

const ASSET_TYPE_PLURALS = {
  building: 'buildings',
  bridge: 'bridges',
  hydropower_facility: 'hydropower facilities',
  cultural_heritage: 'cultural-heritage sites',
};

const SITE_EVIDENCE = [
  {
    title: 'Rasuwagadhi–Timure',
    bounds: { minLat: 28.230, maxLat: 28.286, minLon: 85.350, maxLon: 85.386 },
    sources: [
      {
        title: 'Timure–Syabrubesi impact products',
        date: '26–27 August 2026',
        kind: 'Official satellite mapping',
        url: 'https://disasterscharter.org/activations/flood-in-nepal-activation-1052-',
        description: 'Impact mapping and pre/post satellite products for Timure, Syabrubesi and Rasuwa.',
      },
      {
        title: 'Rasuwagadhi–Bidur aerial record',
        date: '26 August 2026',
        kind: 'Original aerial documentation',
        url: 'https://english.onlinekhabar.com/rasuwa-flood-in-pictures.html',
        description: 'Original aerial documentation covering Rasuwagadhi and Timure.',
      },
    ],
  },
  {
    title: 'Syabrubesi–Chilime',
    bounds: { minLat: 28.145, maxLat: 28.198, minLon: 85.322, maxLon: 85.353 },
    sources: [
      {
        title: 'Timure–Syabrubesi impact products',
        date: '26–27 August 2026',
        kind: 'Official satellite mapping',
        url: 'https://disasterscharter.org/activations/flood-in-nepal-activation-1052-',
        description: 'Impact mapping and pre/post satellite products for Timure, Syabrubesi and Rasuwa.',
      },
      {
        title: 'Rasuwagadhi–Bidur aerial record',
        date: '26 August 2026',
        kind: 'Original aerial documentation',
        url: 'https://english.onlinekhabar.com/rasuwa-flood-in-pictures.html',
        description: 'Original aerial documentation covering Syabrubesi and the upper Rasuwa corridor.',
      },
    ],
  },
  {
    title: 'Mailung',
    bounds: { minLat: 28.040, maxLat: 28.090, minLon: 85.190, maxLon: 85.222 },
    sources: [
      {
        title: 'Rasuwa pre/post satellite products',
        date: '26–27 August 2026',
        kind: 'Official satellite mapping',
        url: 'https://disasterscharter.org/activations/flood-in-nepal-activation-1052-',
        description: 'Official satellite products documenting the Rasuwa flood corridor.',
      },
      {
        title: 'Rasuwagadhi–Bidur aerial record',
        date: '26 August 2026',
        kind: 'Original aerial documentation',
        url: 'https://english.onlinekhabar.com/rasuwa-flood-in-pictures.html',
        description: 'Original aerial documentation covering Mailung.',
      },
    ],
  },
  {
    title: 'Betrawati–Gerkhu',
    bounds: { minLat: 27.948, maxLat: 27.997, minLon: 85.158, maxLon: 85.202 },
    media: {
      type: 'image',
      src: 'https://eu-space.europa.eu/sites/default/files/2026-08/20260827_Nepal.png.webp',
      link: 'https://eu-space.europa.eu/components/earth-observation-copernicus/image-of-the-day/aftermath-nepal-flash-flood',
      alt: 'Copernicus Sentinel-2 comparison of Betrawati and Gerkhu before and after the 26 August 2026 flood',
    },
    sources: [
      {
        title: 'Betrawati–Gerkhu before/after comparison',
        date: '12 and 27 August 2026',
        kind: 'Official Copernicus imagery',
        url: 'https://eu-space.europa.eu/components/earth-observation-copernicus/image-of-the-day/aftermath-nepal-flash-flood',
        description: 'Sentinel-2 comparison showing channel widening and flood deposits around Betrawati and Gerkhu.',
      },
      {
        title: 'Nuwakot pre/post satellite products',
        date: '26–27 August 2026',
        kind: 'Official satellite mapping',
        url: 'https://disasterscharter.org/activations/flood-in-nepal-activation-1052-',
        description: 'Official pre/post satellite products documenting damage in Nuwakot.',
      },
      {
        title: 'Rasuwagadhi–Bidur aerial record',
        date: '26 August 2026',
        kind: 'Original aerial documentation',
        url: 'https://english.onlinekhabar.com/rasuwa-flood-in-pictures.html',
        description: 'Original aerial documentation covering Betrawati.',
      },
    ],
  },
  {
    title: 'Trishuli Bazaar–Devighat',
    bounds: { minLat: 27.840, maxLat: 27.940, minLon: 85.090, maxLon: 85.165 },
    sources: [
      {
        title: 'Trishuli Bazaar and Devighat photographic record',
        date: '26 August 2026',
        kind: 'Original photojournalism',
        url: 'https://english.onlinekhabar.com/trishuli-bazar-ruins-rasuwa-flood.html',
        description: 'Original photographs documenting destruction in Trishuli Bazaar and impacts at nearby Devighat.',
      },
      {
        title: 'Nuwakot pre/post satellite products',
        date: '26–27 August 2026',
        kind: 'Official satellite mapping',
        url: 'https://disasterscharter.org/activations/flood-in-nepal-activation-1052-',
        description: 'Official pre/post satellite products documenting damage in Nuwakot.',
      },
    ],
  },
];

const FEATURE_EVIDENCE = new Map([
  ['hot_bridge_000', {
    title: 'Miteri Bridge, Rasuwagadhi',
    scope: 'A bridge-specific timing observation is combined with area-level satellite and aerial documentation.',
    sources: [{
      title: 'Bridge CCTV observation',
      date: '26 August 2026',
      kind: 'Original post',
      url: 'https://www.youtube.com/watch?v=y-zAdQWXgs4&t=39600s',
      description: 'Annapurna publication of CCTV footage recording debris-flood arrival at 11:00:00 China Standard Time.',
    }],
  }],
  ['ems_aoi01_facility_0000', {
    title: 'Langtang Khola Hydroelectric Power House',
    scope: 'Facility-level reporting and official project identification are combined with area-level satellite documentation.',
    sources: [
      {
        title: 'Langtang Khola project impact report',
        date: '26 August 2026',
        kind: 'Original reporting',
        url: 'https://english.khabarhub.com/2026/26/564978/',
        description: 'Original report carrying the project managing director’s account of damage to the powerhouse.',
      },
      {
        title: 'Langtang Khola project registry',
        date: 'Current registry',
        kind: 'Official project record',
        url: 'https://doed.gov.np/pages/cltransmissionline/',
        description: 'Department of Electricity Development record identifying the project developer and grid connection.',
      },
    ],
  }],
  ['ems_aoi02_facility_0001', {
    title: 'Rasuwagadhi Hydropower Dam',
    scope: 'An official facility-level notice is combined with area-level satellite and aerial documentation.',
    sources: [{
      title: 'Flood-damage notice',
      date: '27 August 2026',
      kind: 'Official project notice',
      url: 'https://rghpcl.com.np/media/2026/08/Information-on-damaged-caused-by-Flooding-2083-05-11.pdf',
      description: 'Rasuwagadhi Hydropower Company notice concerning flood damage at the project.',
    }],
  }],
]);

function containsLocation(feature, bounds) {
  return feature.latitude >= bounds.minLat && feature.latitude <= bounds.maxLat
    && feature.longitude >= bounds.minLon && feature.longitude <= bounds.maxLon;
}

function contextualEvidence(feature) {
  const site = SITE_EVIDENCE.find(candidate => containsLocation(feature, candidate.bounds));
  const specific = FEATURE_EVIDENCE.get(feature.id);
  if (!site && !specific) return null;
  return {
    title: specific?.title ?? site.title,
    scope: specific?.scope
      ?? `Area-level evidence for ${site.title}; it is not presented as an image of this individual structure.`,
    sources: [...(specific?.sources ?? []), ...(site?.sources ?? [])],
    media: specific?.media ?? site?.media ?? null,
  };
}

function sentenceCase(value) {
  const words = String(value ?? '').replaceAll('_', ' ').trim();
  return words ? `${words[0].toUpperCase()}${words.slice(1)}` : '—';
}

export function damageFeaturePresentation(feature) {
  return {
    name: feature.name,
    assetType: ASSET_TYPE_LABELS[feature.asset_type] ?? sentenceCase(feature.asset_type),
    assessment: sentenceCase(feature.status),
    evidenceBasis: feature.evidence_basis,
    sources: feature.sources,
    contextualEvidence: contextualEvidence(feature),
  };
}

export function damageFeatureVisibleAtDistance(assetType, cameraDistance) {
  return assetType !== 'building' || cameraDistance <= 75_000;
}

export function damageFeatureScaleAtDistance(assetType, cameraDistance) {
  if (assetType === 'building') {
    return Math.min(14, Math.max(0.26, cameraDistance / 2_800));
  }
  return Math.min(14, Math.max(0.26, cameraDistance / 4_200));
}

export function damageClusterScaleAtDistance(cameraDistance) {
  return Math.min(22, Math.max(0.24, cameraDistance / 6_500));
}

export function clusterProjectedDamageFeatures(points, radiusPx = 30) {
  const validPoints = points.filter(point => (
    Number.isFinite(point.screenX) && Number.isFinite(point.screenY)
  ));
  if (validPoints.length < 2) return validPoints.map(point => [point]);

  const radius = Math.max(1, radiusPx);
  const radiusSquared = radius * radius;
  const clusters = [];
  const grid = new Map();

  function cellKey(cellX, cellY) {
    return `${cellX}:${cellY}`;
  }

  function addToCell(clusterIndex, cellX, cellY) {
    const key = cellKey(cellX, cellY);
    if (!grid.has(key)) grid.set(key, []);
    grid.get(key).push(clusterIndex);
  }

  function moveClusterCell(clusterIndex, previousX, previousY, nextX, nextY) {
    if (previousX === nextX && previousY === nextY) return;
    const previousKey = cellKey(previousX, previousY);
    const previousCell = grid.get(previousKey);
    previousCell.splice(previousCell.indexOf(clusterIndex), 1);
    if (previousCell.length === 0) grid.delete(previousKey);
    addToCell(clusterIndex, nextX, nextY);
  }

  for (const point of validPoints) {
    const cellX = Math.floor(point.screenX / radius);
    const cellY = Math.floor(point.screenY / radius);
    let nearestClusterIndex = -1;
    let nearestDistanceSquared = radiusSquared;

    for (let offsetX = -1; offsetX <= 1; offsetX += 1) {
      for (let offsetY = -1; offsetY <= 1; offsetY += 1) {
        const candidates = grid.get(cellKey(cellX + offsetX, cellY + offsetY)) ?? [];
        for (const clusterIndex of candidates) {
          const cluster = clusters[clusterIndex];
          const dx = point.screenX - cluster.screenX;
          const dy = point.screenY - cluster.screenY;
          const distanceSquared = dx * dx + dy * dy;
          if (distanceSquared <= nearestDistanceSquared) {
            nearestClusterIndex = clusterIndex;
            nearestDistanceSquared = distanceSquared;
          }
        }
      }
    }

    if (nearestClusterIndex === -1) {
      const clusterIndex = clusters.length;
      clusters.push({
        members: [point],
        screenX: point.screenX,
        screenY: point.screenY,
        cellX,
        cellY,
      });
      addToCell(clusterIndex, cellX, cellY);
      continue;
    }

    const cluster = clusters[nearestClusterIndex];
    const previousCellX = cluster.cellX;
    const previousCellY = cluster.cellY;
    const nextCount = cluster.members.length + 1;
    cluster.screenX += (point.screenX - cluster.screenX) / nextCount;
    cluster.screenY += (point.screenY - cluster.screenY) / nextCount;
    cluster.members.push(point);
    cluster.cellX = Math.floor(cluster.screenX / radius);
    cluster.cellY = Math.floor(cluster.screenY / radius);
    moveClusterCell(
      nearestClusterIndex,
      previousCellX,
      previousCellY,
      cluster.cellX,
      cluster.cellY
    );
  }
  return clusters.map(cluster => cluster.members);
}

function countedLabel(count, singular, plural) {
  return `${count} ${count === 1 ? singular.toLowerCase() : plural}`;
}

export function damageClusterPresentation(features) {
  const assetCounts = new Map();
  const statusCounts = new Map();
  const uniqueSources = new Map();

  for (const feature of features) {
    assetCounts.set(feature.asset_type, (assetCounts.get(feature.asset_type) ?? 0) + 1);
    statusCounts.set(feature.status, (statusCounts.get(feature.status) ?? 0) + 1);
    for (const source of feature.sources ?? []) {
      const key = source.url ?? `${source.title}|${source.date}`;
      if (!uniqueSources.has(key)) uniqueSources.set(key, source);
    }
  }

  const assetType = ['building', 'bridge', 'hydropower_facility', 'cultural_heritage']
    .filter(type => assetCounts.has(type))
    .map(type => countedLabel(
      assetCounts.get(type),
      ASSET_TYPE_LABELS[type],
      ASSET_TYPE_PLURALS[type]
    ))
    .join(' · ');
  const assessment = ['destroyed', 'damaged']
    .filter(status => statusCounts.has(status))
    .map(status => countedLabel(statusCounts.get(status), status, status))
    .join(' · ');

  return {
    name: `${features.length} documented impacts`,
    assetType,
    assessment,
    evidenceBasis: 'Grouped at the current viewing scale',
    sources: [...uniqueSources.values()],
    count: features.length,
  };
}
