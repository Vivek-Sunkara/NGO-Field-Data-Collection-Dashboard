const STATE_CITY_COORDINATES = {
  'Telangana': {
    lat: 17.385, lng: 78.4867,
    cities: {
      Hyderabad: { lat: 17.385, lng: 78.4867 },
    },
  },
  'Karnataka': {
    lat: 12.9716, lng: 77.5946,
    cities: {
      Bengaluru: { lat: 12.9716, lng: 77.5946 },
      Mysuru: { lat: 12.2958, lng: 76.6394 },
    },
  },
  'Andhra Pradesh': {
    lat: 15.9129, lng: 79.73999,
    cities: {
      Vijayawada: { lat: 16.5062, lng: 80.6480 },
      Visakhapatnam: { lat: 17.6868, lng: 83.2185 },
    },
  },
  'Maharashtra': {
    lat: 19.7515, lng: 75.7139,
    cities: {
      Mumbai: { lat: 19.0760, lng: 72.8777 },
      Pune: { lat: 18.5204, lng: 73.8567 },
    },
  },
  'Delhi': {
    lat: 28.7041, lng: 77.1025,
    cities: {
      Delhi: { lat: 28.7041, lng: 77.1025 },
    },
  },
  'West Bengal': {
    lat: 22.9868, lng: 87.8550,
    cities: {
      Kolkata: { lat: 22.5726, lng: 88.3639 },
    },
  },
  'Tamil Nadu': {
    lat: 11.1271, lng: 78.6569,
    cities: {
      Chennai: { lat: 13.0827, lng: 80.2707 },
    },
  },
  'Uttar Pradesh': {
    lat: 26.8467, lng: 80.9462,
    cities: {
      Lucknow: { lat: 26.8467, lng: 80.9462 },
      Kanpur: { lat: 26.4499, lng: 80.3319 },
    },
  },
  'Bihar': {
    lat: 25.0961, lng: 85.3131,
    cities: {
      Patna: { lat: 25.5941, lng: 85.1376 },
    },
  },
  'Gujarat': {
    lat: 22.2587, lng: 71.1924,
    cities: {
      Ahmedabad: { lat: 23.0225, lng: 72.5714 },
    },
  },
  'Madhya Pradesh': {
    lat: 22.9734, lng: 78.6569,
    cities: {
      Bhopal: { lat: 23.2599, lng: 77.4126 },
    },
  },
  'Rajasthan': {
    lat: 27.0238, lng: 74.2179,
    cities: {
      Jaipur: { lat: 26.9124, lng: 75.7873 },
    },
  },
  'Punjab': {
    lat: 31.1471, lng: 75.3412,
    cities: {
      Ludhiana: { lat: 30.9010, lng: 75.8573 },
    },
  },
  'Haryana': {
    lat: 29.0588, lng: 76.0856,
    cities: {
      Gurugram: { lat: 28.4595, lng: 77.0266 },
    },
  },
  'Odisha': {
    lat: 20.9517, lng: 85.0985,
    cities: {
      Bhubaneswar: { lat: 20.2961, lng: 85.8245 },
    },
  },
  'Jharkhand': {
    lat: 23.6102, lng: 85.2799,
    cities: {
      Ranchi: { lat: 23.3441, lng: 85.3096 },
    },
  },
  'Chhattisgarh': {
    lat: 21.2787, lng: 81.8661,
    cities: {
      Raipur: { lat: 21.2514, lng: 81.6296 },
    },
  },
  'Assam': {
    lat: 26.2006, lng: 92.9376,
    cities: {
      Guwahati: { lat: 26.1445, lng: 91.7362 },
    },
  },
  'Kerala': {
    lat: 10.8505, lng: 76.2711,
    cities: {
      Thiruvananthapuram: { lat: 8.5241, lng: 76.9366 },
      Kochi: { lat: 9.9312, lng: 76.2673 },
    },
  },
};

const findByName = (source = {}, name) => {
  if (!name) return null;
  const normalized = name.trim().toLowerCase();
  return Object.entries(source).find(([key]) => key.trim().toLowerCase() === normalized)?.[1] || null;
};

export const getCoordinatesForLocation = (state, city) => {
  if (!state) return null;
  const stateEntry = findByName(STATE_CITY_COORDINATES, state);
  if (!stateEntry) return null;
  if (city) {
    const cityEntry = findByName(stateEntry.cities, city);
    if (cityEntry) return cityEntry;
  }
  return { lat: stateEntry.lat, lng: stateEntry.lng };
};
