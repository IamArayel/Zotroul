// Zotroul API Service
const BASE_URL = '';

const req = async (method, path, body) => {
  const opts = { method, headers: { 'Content-Type': 'application/json' } };
  if (body !== undefined) opts.body = JSON.stringify(body);
  const res = await fetch(BASE_URL + path, opts);
  if (res.status === 204) return null;
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error((data && data.message) || `Erreur ${res.status}`);
  return data;
};

// ── Utilisateurs ──────────────────────────────────────────
const UtilisateurAPI = {
  getAll: () => req('GET', '/utilisateurs'),
  getById: (id) => req('GET', `/utilisateurs/${id}`),
  create: (u) => req('POST', '/utilisateurs', u),
  update: (id, u) => req('PUT', `/utilisateurs/${id}`, u),
  delete: (id) => req('DELETE', `/utilisateurs/${id}`),
};

// ── Véhicules (base) ──────────────────────────────────────
const VehiculeAPI = {
  getAll: () => req('GET', '/vehicules'),
  getById: (id) => req('GET', `/vehicules/${id}`),
  create: (v) => req('POST', '/vehicules', v),
  update: (id, v) => req('PUT', `/vehicules/${id}`, v),
  delete: (id) => req('DELETE', `/vehicules/${id}`),
};

// ── Trotinettes ───────────────────────────────────────────
const TrotinetteAPI = {
  getAll: () => req('GET', '/trotinettes'),
  getById: (id) => req('GET', `/trotinettes/${id}`),
  create: (t) => req('POST', '/trotinettes', t),
  update: (id, t) => req('PUT', `/trotinettes/${id}`, t),
  delete: (id) => req('DELETE', `/trotinettes/${id}`),
};

// ── Vélos ─────────────────────────────────────────────────
const VeloAPI = {
  getAll: () => req('GET', '/velos'),
  getById: (id) => req('GET', `/velos/${id}`),
  create: (v) => req('POST', '/velos', v),
  update: (id, v) => req('PUT', `/velos/${id}`, v),
  delete: (id) => req('DELETE', `/velos/${id}`),
};

// ── Scooters ──────────────────────────────────────────────
const ScooterAPI = {
  getAll: () => req('GET', '/scooters'),
  getById: (id) => req('GET', `/scooters/${id}`),
  create: (s) => req('POST', '/scooters', s),
  update: (id, s) => req('PUT', `/scooters/${id}`, s),
  delete: (id) => req('DELETE', `/scooters/${id}`),
};

// ── Sessions ──────────────────────────────────────────────
const SessionAPI = {
  getAll: () => req('GET', '/sessions'),
  getById: (id) => req('GET', `/sessions/${id}`),
  create: (s) => req('POST', '/sessions', s),
  update: (id, s) => req('PUT', `/sessions/${id}`, s),
  delete: (id) => req('DELETE', `/sessions/${id}`),
  byUtilisateur: (id) => req('GET', `/sessions/utilisateur/${id}`),
  byVehicule: (id) => req('GET', `/sessions/vehicule/${id}`),
};

// ── Helper : API par type ─────────────────────────────────
const apiForType = (type) => ({
  trotinette: TrotinetteAPI,
  velo: VeloAPI,
  scooter: ScooterAPI,
}[type] || VehiculeAPI);
