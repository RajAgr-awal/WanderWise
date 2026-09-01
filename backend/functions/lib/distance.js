/** Haversine distance helper (spec §8 /lib/distance.js). */

const R = 6371; // km

const toRad = (d) => (d * Math.PI) / 180;

/** Great-circle distance in km between two {lat,lng} points. */
function haversine(a, b) {
  if (!a || !b || a.lat == null || b.lat == null) return 0;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/**
 * Nearest-neighbour ordering (spec §4.8). Starts at `startIndex` and repeatedly
 * hops to the closest unvisited point. Good enough for <30 stops and fully
 * deterministic, which matters for a cached map response.
 */
function nearestNeighbourOrder(points, startIndex = 0) {
  if (points.length <= 2) return points.map((_, i) => i);
  const unvisited = new Set(points.map((_, i) => i));
  const order = [startIndex];
  unvisited.delete(startIndex);
  let current = startIndex;
  while (unvisited.size) {
    let best = null;
    let bestD = Infinity;
    for (const i of unvisited) {
      const d = haversine(points[current], points[i]);
      if (d < bestD) { bestD = d; best = i; }
    }
    order.push(best);
    unvisited.delete(best);
    current = best;
  }
  return order;
}

/** Total path length in km for an ordered list of points. */
function pathLength(points) {
  let total = 0;
  for (let i = 1; i < points.length; i++) total += haversine(points[i - 1], points[i]);
  return total;
}

module.exports = { haversine, nearestNeighbourOrder, pathLength };
