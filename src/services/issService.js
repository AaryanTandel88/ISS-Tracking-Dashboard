// Haversine formula to calculate distance between two lat/lng points
export function calculateSpeed(pos1, pos2, timeDiffSeconds) {
  if (!pos1 || !pos2 || timeDiffSeconds === 0) return 0;
  const R = 6371;
  const toRad = (deg) => deg * (Math.PI / 180);
  const dLat = toRad(pos2.lat - pos1.lat);
  const dLon = toRad(pos2.lng - pos1.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(pos1.lat)) *
      Math.cos(toRad(pos2.lat)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  const speedKmh = (distance / timeDiffSeconds) * 3600;
  return Math.round(speedKmh);
}

// Try primary URL first, then fallback
async function fetchWithFallback(primary, fallback) {
  try {
    const res = await fetch(primary, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    const res = await fetch(fallback, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error(`Fallback HTTP ${res.status}`);
    return await res.json();
  }
}

// Fetch ISS position — uses wheretheiss.at (native CORS) with corsproxy.io fallback
export async function fetchISSPosition() {
  const data = await fetchWithFallback(
    'https://api.wheretheiss.at/v1/satellites/25544',
    'https://corsproxy.io/?url=http://api.open-notify.org/iss-now.json'
  );

  // wheretheiss.at: { latitude, longitude, timestamp }
  if (data.latitude !== undefined) {
    return {
      lat: parseFloat(data.latitude),
      lng: parseFloat(data.longitude),
      timestamp: data.timestamp || Math.floor(Date.now() / 1000),
    };
  }
  // open-notify fallback: { iss_position: { latitude, longitude }, timestamp }
  return {
    lat: parseFloat(data.iss_position.latitude),
    lng: parseFloat(data.iss_position.longitude),
    timestamp: data.timestamp,
  };
}

// Fetch astronauts in space — corsproxy.io wraps the HTTP open-notify endpoint
export async function fetchAstronauts() {
  try {
    const res = await fetch(
      'https://corsproxy.io/?url=http://api.open-notify.org/astros.json',
      { signal: AbortSignal.timeout(8000) }
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    return {
      number: 7,
      people: [
        { name: 'Oleg Kononenko', craft: 'ISS' },
        { name: 'Nikolai Chub', craft: 'ISS' },
        { name: 'Tracy Caldwell Dyson', craft: 'ISS' },
        { name: 'Mike Barratt', craft: 'ISS' },
        { name: 'Matthew Dominick', craft: 'ISS' },
        { name: 'Jeanette Epps', craft: 'ISS' },
        { name: 'Alexander Grebenkin', craft: 'ISS' },
      ],
      message: 'success',
    };
  }
}

// Reverse geocode via Nominatim (supports CORS natively)
export async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=5`,
      {
        headers: { 'Accept-Language': 'en', 'User-Agent': 'ISS-Dashboard/1.0' },
        signal: AbortSignal.timeout(6000),
      }
    );
    if (!res.ok) return 'Over Ocean';
    const data = await res.json();
    if (data.address) {
      return (
        data.address.city ||
        data.address.town ||
        data.address.state ||
        data.address.country ||
        data.display_name?.split(',')[0] ||
        'Over Ocean'
      );
    }
    if (data.error) return 'Over Ocean';
    return data.display_name?.split(',')[0] || 'Over Ocean';
  } catch {
    return 'Over Ocean';
  }
}
