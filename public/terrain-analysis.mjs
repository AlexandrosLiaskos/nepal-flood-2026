function clamp(value, minimum, maximum) {
  return Math.max(minimum, Math.min(maximum, value));
}

export function analyzeTerrainTransect(pointA, pointB, sampleElevation, terrainResolutionM = 96) {
  const deltaEasting = pointB.easting - pointA.easting;
  const deltaNorthing = pointB.northing - pointA.northing;
  const horizontalDistanceM = Math.hypot(deltaEasting, deltaNorthing);
  if (!(horizontalDistanceM > 0)) throw new Error('A and B must be different locations.');

  const elevationChangeM = pointB.elevation - pointA.elevation;
  const straightLineDistanceM = Math.hypot(horizontalDistanceM, elevationChangeM);
  const targetSpacingM = Math.max(terrainResolutionM / 2, horizontalDistanceM / 2000);
  const sampleCount = clamp(Math.ceil(horizontalDistanceM / targetSpacingM) + 1, 2, 2001);
  const distancesM = new Float64Array(sampleCount);
  const distancesKm = new Float64Array(sampleCount);
  const elevationsM = new Float64Array(sampleCount);
  let hasElevationGap = false;

  for (let index = 0; index < sampleCount; index += 1) {
    const fraction = index / (sampleCount - 1);
    const distanceM = horizontalDistanceM * fraction;
    const easting = pointA.easting + deltaEasting * fraction;
    const northing = pointA.northing + deltaNorthing * fraction;
    const sampledElevation = index === 0
      ? pointA.elevation
      : index === sampleCount - 1
        ? pointB.elevation
        : sampleElevation(easting, northing);
    distancesM[index] = distanceM;
    distancesKm[index] = distanceM / 1000;
    elevationsM[index] = sampledElevation;
    if (!Number.isFinite(sampledElevation)) hasElevationGap = true;
  }

  let terrainSurfaceDistanceM = 0;
  if (!hasElevationGap) {
    for (let index = 1; index < sampleCount; index += 1) {
      terrainSurfaceDistanceM += Math.hypot(
        distancesM[index] - distancesM[index - 1],
        elevationsM[index] - elevationsM[index - 1]
      );
    }
  } else {
    terrainSurfaceDistanceM = null;
  }

  return {
    horizontalDistanceM,
    straightLineDistanceM,
    terrainSurfaceDistanceM,
    elevationChangeM,
    distancesM,
    distancesKm,
    elevationsM,
    sampleCount,
    sampleSpacingM: horizontalDistanceM / (sampleCount - 1),
    hasElevationGap,
  };
}
