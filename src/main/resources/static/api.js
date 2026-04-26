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

const isPlainObject = (value) => !!value && typeof value === 'object' && !Array.isArray(value);

const isEntityObject = (value) => isPlainObject(value) && value.id != null;

const isSessionObject = (value) => (
  isEntityObject(value) &&
  (
    value.dateDebut != null ||
    value.dateFin != null ||
    value.prix != null ||
    value.utilisateur != null ||
    value.vehicule != null
  )
);

const mergeSession = (current, incoming) => {
  if (!current) return incoming;
  return {
    ...current,
    ...incoming,
    utilisateur: incoming.utilisateur ?? current.utilisateur,
    vehicule: incoming.vehicule ?? current.vehicule,
  };
};

const collectEntitiesById = (payload, predicate, merge) => {
  const entitiesById = new Map();

  const collect = (value) => {
    if (Array.isArray(value)) {
      value.forEach(collect);
      return;
    }

    if (!isPlainObject(value)) return;

    if (predicate(value)) {
      entitiesById.set(value.id, merge(entitiesById.get(value.id), value));
    }

    Object.values(value).forEach(collect);
  };

  collect(payload);

  return entitiesById;
};

const normalizeEntityCollection = (payload, predicate, merge = (_, incoming) => incoming) => {
  if (!Array.isArray(payload)) return [];

  const entitiesById = collectEntitiesById(payload, predicate, merge);

  return payload
    .map((item) => {
      if (predicate(item)) return entitiesById.get(item.id) || item;
      if (typeof item === 'number' || typeof item === 'string') return entitiesById.get(Number(item)) || null;
      return null;
    })
    .filter(predicate);
};

const isUtilisateurObject = (value) => (
  isEntityObject(value) &&
  (value.username != null || value.numeroTelephone != null)
);

const isVehiculeObject = (value) => (
  isEntityObject(value) &&
  (
    value.commune != null ||
    value.etatBatterie != null ||
    value.panier != null ||
    value.porteBagage != null ||
    value.coffre != null
  )
);

const normalizeUtilisateurs = (payload) => normalizeEntityCollection(payload, isUtilisateurObject);

const normalizeVehicules = (payload) => normalizeEntityCollection(payload, isVehiculeObject);

const hydrateSessionReferences = (sessions, utilisateurs, vehicules) => {
  const utilisateursById = new Map(utilisateurs.map((u) => [u.id, u]));
  const vehiculesById = new Map(vehicules.map((v) => [v.id, v]));

  return sessions.map((session) => {
    const utilisateurId = typeof session.utilisateur === 'number'
      ? session.utilisateur
      : session.utilisateur?.id;
    const vehiculeId = typeof session.vehicule === 'number'
      ? session.vehicule
      : session.vehicule?.id;

    return {
      ...session,
      utilisateur: utilisateursById.get(Number(utilisateurId)) || session.utilisateur,
      vehicule: vehiculesById.get(Number(vehiculeId)) || session.vehicule,
    };
  });
};

const normalizeSessions = (payload, utilisateurs = [], vehicules = []) => {
  const sessions = normalizeEntityCollection(payload, isSessionObject, mergeSession);
  return hydrateSessionReferences(sessions, utilisateurs, vehicules);
};

// ── Utilisateurs ──────────────────────────────────────────
const UtilisateurAPI = {
  getAll: () => req('GET', '/utilisateurs').then(normalizeUtilisateurs),
  getById: (id) => req('GET', `/utilisateurs/${id}`),
  create: (u) => req('POST', '/utilisateurs', u),
  update: (id, u) => req('PUT', `/utilisateurs/${id}`, u),
  delete: (id) => req('DELETE', `/utilisateurs/${id}`),
};

// ── Véhicules (base) ──────────────────────────────────────
const VehiculeAPI = {
  getAll: () => req('GET', '/vehicules').then(normalizeVehicules),
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
  getAll: async () => {
    const [sessionsPayload, utilisateursPayload, vehiculesPayload] = await Promise.all([
      req('GET', '/sessions'),
      req('GET', '/utilisateurs'),
      req('GET', '/vehicules'),
    ]);
    const utilisateurs = normalizeUtilisateurs(utilisateursPayload);
    const vehicules = normalizeVehicules(vehiculesPayload);
    return normalizeSessions(sessionsPayload, utilisateurs, vehicules);
  },
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
