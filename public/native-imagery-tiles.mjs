const MAX_REQUESTED_TILES = 48;
const MAX_CACHED_TILES = 72;
const MAX_CONCURRENT_REQUESTS = 6;
const CAMERA_SETTLE_DELAY_MS = 120;

export function createNativeImageryTileManager(options) {
  const {
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
    onStatus = () => {},
  } = options;

  const textureLoader = new THREE.TextureLoader();
  const terrainSpacingX = Math.max(1, Math.abs(terrainX[1] - terrainX[0]));
  const terrainSpacingY = Math.max(1, Math.abs(terrainY[1] - terrainY[0]));
  const cache = new Map();
  const queued = new Map();
  const loading = new Set();
  let mode = 'optimized';
  let surfaceMetadata = null;
  let manifest = null;
  let surfaceGeneration = 0;
  let desiredKeys = new Set();
  let cameraTimer = null;
  let useSequence = 0;

  function tileKey(zoom, column, row) {
    return `${zoom}/${column}/${row}`;
  }

  function tileUrl(template, zoom, column, row) {
    return template
      .replace('{z}', String(zoom))
      .replace('{x}', String(column))
      .replace('{y}', String(row));
  }

  function tileBounds(level, column, row) {
    const [west, , , north] = manifest.bounds_utm_32645;
    const span = manifest.tile_size * level.pixel_size_m;
    return {
      west: west + column * span,
      east: west + (column + 1) * span,
      north: north - row * span,
      south: north - (row + 1) * span,
    };
  }

  function buildTileGeometry(bounds) {
    const width = bounds.east - bounds.west;
    const height = bounds.north - bounds.south;
    const segmentsX = THREE.MathUtils.clamp(Math.ceil(width / terrainSpacingX), 1, 96);
    const segmentsY = THREE.MathUtils.clamp(Math.ceil(height / terrainSpacingY), 1, 96);
    const vertexColumns = segmentsX + 1;
    const vertexRows = segmentsY + 1;
    const positions = new Float32Array(vertexColumns * vertexRows * 3);
    const uvs = new Float32Array(vertexColumns * vertexRows * 2);
    const elevations = new Float32Array(vertexColumns * vertexRows);
    const valid = new Uint8Array(vertexColumns * vertexRows);

    for (let row = 0; row < vertexRows; row += 1) {
      const verticalFraction = row / segmentsY;
      const northing = bounds.south + height * verticalFraction;
      for (let column = 0; column < vertexColumns; column += 1) {
        const horizontalFraction = column / segmentsX;
        const easting = bounds.west + width * horizontalFraction;
        const vertexIndex = row * vertexColumns + column;
        const elevation = renderedTerrainElevation(easting, northing);
        elevations[vertexIndex] = elevation;
        valid[vertexIndex] = Number.isFinite(elevation) ? 1 : 0;
        positions[vertexIndex * 3] = easting - originX;
        positions[vertexIndex * 3 + 1] = Number.isFinite(elevation) ? displayElevationY(elevation) : 0;
        positions[vertexIndex * 3 + 2] = -(northing - originY);
        uvs[vertexIndex * 2] = horizontalFraction;
        uvs[vertexIndex * 2 + 1] = verticalFraction;
      }
    }

    const indexValues = [];
    for (let row = 0; row < segmentsY; row += 1) {
      for (let column = 0; column < segmentsX; column += 1) {
        const a = row * vertexColumns + column;
        const b = a + 1;
        const c = a + vertexColumns;
        const d = c + 1;
        if (valid[a] && valid[b] && valid[c]) indexValues.push(a, c, b);
        if (valid[b] && valid[c] && valid[d]) indexValues.push(b, c, d);
      }
    }

    const IndexArray = positions.length / 3 > 65535 ? Uint32Array : Uint16Array;
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    geometry.setIndex(new THREE.BufferAttribute(new IndexArray(indexValues), 1));
    geometry.userData.elevations = elevations;
    geometry.computeBoundingSphere();
    return geometry;
  }

  function configureTexture(texture) {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = maximumTextureAnisotropy;
    texture.generateMipmaps = true;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.NearestFilter;
  }

  function createTileMesh(texture, bounds) {
    configureTexture(texture);
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      alphaTest: 0.02,
      side: THREE.DoubleSide,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -6,
    });
    const mesh = new THREE.Mesh(buildTileGeometry(bounds), material);
    mesh.name = 'Native imagery detail tile';
    mesh.renderOrder = 2;
    scene.add(mesh);
    return mesh;
  }

  function disposeEntry(entry) {
    if (entry.mesh.parent) entry.mesh.parent.remove(entry.mesh);
    entry.mesh.geometry.dispose();
    entry.mesh.material.map.dispose();
    entry.mesh.material.dispose();
  }

  function clearTiles() {
    desiredKeys = new Set();
    queued.clear();
    for (const entry of cache.values()) disposeEntry(entry);
    cache.clear();
    render();
  }

  function evictCache() {
    if (cache.size <= MAX_CACHED_TILES) return;
    const candidates = [...cache.entries()]
      .filter(([key]) => !desiredKeys.has(key))
      .sort((first, second) => first[1].lastUsed - second[1].lastUsed);
    while (cache.size > MAX_CACHED_TILES && candidates.length) {
      const [key, entry] = candidates.shift();
      cache.delete(key);
      disposeEntry(entry);
    }
  }

  function levelForView() {
    const levels = manifest.levels;
    const distance = camera.position.distanceTo(controls.target);
    const worldUnitsPerPixel = 2 * distance * Math.tan(THREE.MathUtils.degToRad(camera.fov * 0.5)) /
      Math.max(1, canvas.clientHeight);
    const targetPixelSize = worldUnitsPerPixel * 1.2;
    let selected = levels.at(-1);
    for (const level of levels) {
      if (level.pixel_size_m <= targetPixelSize) {
        selected = level;
        break;
      }
    }
    return selected;
  }

  function tileRange(level) {
    const [west, south, east, north] = manifest.bounds_utm_32645;
    const distance = camera.position.distanceTo(controls.target);
    const verticalSpan = distance * Math.tan(THREE.MathUtils.degToRad(camera.fov * 0.5));
    const horizontalSpan = verticalSpan * Math.max(1, camera.aspect);
    const radius = Math.hypot(horizontalSpan, verticalSpan) * 1.75;
    const targetEasting = controls.target.x + originX;
    const targetNorthing = originY - controls.target.z;
    const span = manifest.tile_size * level.pixel_size_m;
    const minimumColumn = THREE.MathUtils.clamp(Math.floor((targetEasting - radius - west) / span), 0, level.columns - 1);
    const maximumColumn = THREE.MathUtils.clamp(Math.floor((targetEasting + radius - west) / span), 0, level.columns - 1);
    const minimumRow = THREE.MathUtils.clamp(Math.floor((north - (targetNorthing + radius)) / span), 0, level.rows - 1);
    const maximumRow = THREE.MathUtils.clamp(Math.floor((north - (targetNorthing - radius)) / span), 0, level.rows - 1);
    if (targetEasting + radius < west || targetEasting - radius > east || targetNorthing + radius < south || targetNorthing - radius > north) {
      return null;
    }
    return { minimumColumn, maximumColumn, minimumRow, maximumRow };
  }

  function requestSet() {
    if (!manifest || mode !== 'native') return [];
    let level = levelForView();
    if (level.zoom < manifest.minimum_detail_zoom) return [];
    let range = tileRange(level);
    while (range) {
      const count = (range.maximumColumn - range.minimumColumn + 1) * (range.maximumRow - range.minimumRow + 1);
      if (count <= MAX_REQUESTED_TILES || level.zoom <= manifest.minimum_detail_zoom) break;
      level = manifest.levels[level.zoom - 1];
      range = tileRange(level);
    }
    if (!range) return [];
    const requests = [];
    for (let column = range.minimumColumn; column <= range.maximumColumn; column += 1) {
      for (let row = range.minimumRow; row <= range.maximumRow; row += 1) {
        requests.push({
          key: tileKey(level.zoom, column, row),
          zoom: level.zoom,
          column,
          row,
          bounds: tileBounds(level, column, row),
          url: tileUrl(manifest.tile_url_template, level.zoom, column, row),
        });
      }
    }
    return requests;
  }

  function loadTexture(url) {
    return new Promise((resolve, reject) => textureLoader.load(url, resolve, undefined, reject));
  }

  async function loadQueuedRequest(request, generation) {
    loading.add(request.key);
    try {
      const texture = await loadTexture(request.url);
      if (generation !== surfaceGeneration || mode !== 'native' || !desiredKeys.has(request.key)) {
        texture.dispose();
        return;
      }
      const mesh = createTileMesh(texture, request.bounds);
      cache.set(request.key, { mesh, lastUsed: ++useSequence });
      onStatus('');
      evictCache();
      render();
    } catch {
      if (generation === surfaceGeneration && desiredKeys.has(request.key)) {
        onStatus('Some native-detail tiles are unavailable; optimized imagery remains visible.');
      }
    } finally {
      loading.delete(request.key);
      pumpQueue(generation);
    }
  }

  function pumpQueue(generation) {
    while (loading.size < MAX_CONCURRENT_REQUESTS && queued.size) {
      const [key, request] = queued.entries().next().value;
      queued.delete(key);
      if (generation !== surfaceGeneration || !desiredKeys.has(key) || cache.has(key)) continue;
      void loadQueuedRequest(request, generation);
    }
  }

  function updateNow() {
    if (mode !== 'native' || !manifest) return;
    const requests = requestSet();
    desiredKeys = new Set(requests.map(request => request.key));
    for (const [key, entry] of cache) {
      entry.mesh.visible = desiredKeys.has(key);
      if (entry.mesh.visible) entry.lastUsed = ++useSequence;
    }
    queued.clear();
    for (const request of requests) {
      if (!cache.has(request.key) && !loading.has(request.key)) queued.set(request.key, request);
    }
    evictCache();
    pumpQueue(surfaceGeneration);
    render();
  }

  async function loadManifest(generation) {
    if (!surfaceMetadata?.native_tiles_url || mode !== 'native') return;
    try {
      const response = await fetch(surfaceMetadata.native_tiles_url, { cache: 'no-store' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const loaded = await response.json();
      if (generation !== surfaceGeneration || mode !== 'native') return;
      manifest = loaded;
      updateNow();
    } catch {
      if (generation === surfaceGeneration) {
        manifest = null;
        onStatus('Native detail is unavailable for this rendering; optimized imagery remains visible.');
      }
    }
  }

  function setSurface(metadata) {
    surfaceGeneration += 1;
    surfaceMetadata = metadata;
    manifest = null;
    clearTiles();
    if (mode === 'native' && metadata?.native_tiles_url) void loadManifest(surfaceGeneration);
  }

  function setMode(nextMode) {
    if (!['optimized', 'native'].includes(nextMode) || nextMode === mode) return;
    mode = nextMode;
    surfaceGeneration += 1;
    manifest = null;
    clearTiles();
    onStatus('');
    if (mode === 'native' && surfaceMetadata?.native_tiles_url) void loadManifest(surfaceGeneration);
  }

  function updateCamera() {
    if (cameraTimer !== null) clearTimeout(cameraTimer);
    cameraTimer = setTimeout(() => {
      cameraTimer = null;
      updateNow();
    }, CAMERA_SETTLE_DELAY_MS);
  }

  function updateVerticalExaggeration() {
    for (const entry of cache.values()) {
      const geometry = entry.mesh.geometry;
      const positions = geometry.getAttribute('position');
      const elevations = geometry.userData.elevations;
      for (let index = 0; index < elevations.length; index += 1) {
        if (Number.isFinite(elevations[index])) positions.setY(index, displayElevationY(elevations[index]));
      }
      positions.needsUpdate = true;
      geometry.computeBoundingSphere();
    }
    render();
  }

  function dispose() {
    surfaceGeneration += 1;
    if (cameraTimer !== null) clearTimeout(cameraTimer);
    clearTiles();
    surfaceMetadata = null;
    manifest = null;
  }

  return {
    setMode,
    setSurface,
    updateCamera,
    updateVerticalExaggeration,
    clear: clearTiles,
    dispose,
  };
}
