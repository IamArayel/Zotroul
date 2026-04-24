// CarteView.jsx — Leaflet map centered on La Réunion
// Exports to window: { CarteView }

// Coordinates of main communes of La Réunion
const COMMUNES_COORDS = {
  'Saint-Denis':    [-20.8789, 55.4481],
  'Saint-Paul':     [-21.0052, 55.2699],
  'Saint-Pierre':   [-21.3411, 55.4771],
  'Saint-Louis':    [-21.2699, 55.4103],
  'Le Tampon':      [-21.2729, 55.5150],
  'Saint-Andre':    [-20.9644, 55.6483],
  'Saint-André':    [-20.9644, 55.6483],
  'Sainte-Marie':   [-20.9000, 55.5333],
  'Sainte-Rose':    [-21.1289, 55.7944],
  'Sainte-Suzanne': [-20.9267, 55.5981],
  'Saint-Benoît':   [-21.0347, 55.7169],
  'Saint-Leu':      [-21.1531, 55.2847],
  'Cilaos':         [-21.1367, 55.4767],
  'Salazie':        [-21.0264, 55.5408],
  'Bras-Panon':     [-21.0083, 55.6928],
  'La Plaine-des-Palmistes': [-21.1167, 55.6167],
  'Petite-Île':     [-21.3625, 55.5611],
  'Entre-Deux':     [-21.2167, 55.4667],
  'Saint-Joseph':   [-21.3833, 55.6167],
  'Trois-Bassins':  [-21.1000, 55.2833],
};

const getCoords = (commune) => {
  if (!commune) return null;
  const normalized = commune.trim();
  if (COMMUNES_COORDS[normalized]) return COMMUNES_COORDS[normalized];
  // Fuzzy match — check if any key includes the commune name
  const key = Object.keys(COMMUNES_COORDS).find(k =>
    k.toLowerCase().includes(normalized.toLowerCase()) ||
    normalized.toLowerCase().includes(k.toLowerCase())
  );
  return key ? COMMUNES_COORDS[key] : null;
};

const CarteView = () => {
  const toast = useToast();
  const mapRef = React.useRef(null);
  const leafletMap = React.useRef(null);
  const markersLayer = React.useRef(null);
  const [vehicules, setVehicules] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [selected, setSelected] = React.useState(null);

  const load = async () => {
    setLoading(true); setError('');
    try {
      const [t, ve, sc] = await Promise.all([
        TrotinetteAPI.getAll(),
        VeloAPI.getAll(),
        ScooterAPI.getAll(),
      ]);
      const v = [
        ...(t||[]).map(x=>({...x,_type:'trotinette'})),
        ...(ve||[]).map(x=>({...x,_type:'velo'})),
        ...(sc||[]).map(x=>({...x,_type:'scooter'})),
      ];
      setVehicules(v || []);
    } catch (e) {
      setError(e.message);
      toast.error('Impossible de charger les véhicules');
    }
    setLoading(false);
  };

  React.useEffect(() => { load(); }, []);

  // Init map once
  React.useEffect(() => {
    if (!mapRef.current || leafletMap.current) return;
    // Wait for Leaflet CSS to be ready
    leafletMap.current = L.map(mapRef.current, { zoomControl: false }).setView([-21.115, 55.536], 10);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 18,
    }).addTo(leafletMap.current);
    L.control.zoom({ position: 'bottomright' }).addTo(leafletMap.current);
    markersLayer.current = L.layerGroup().addTo(leafletMap.current);
  }, []);

  // Update markers when vehicules change
  React.useEffect(() => {
    if (!leafletMap.current || !markersLayer.current) return;
    markersLayer.current.clearLayers();

    // Group by commune
    const byCommune = {};
    vehicules.forEach(v => {
      const k = v.commune || 'Inconnu';
      if (!byCommune[k]) byCommune[k] = [];
      byCommune[k].push(v);
    });

    Object.entries(byCommune).forEach(([commune, group]) => {
      const coords = getCoords(commune);
      if (!coords) return;
      const avgBat = group.reduce((s, v) => s + (v.etatBatterie || 0), 0) / group.length;
      const color = avgBat > 60 ? '#22c55e' : avgBat > 30 ? '#f59e0b' : '#ef4444';

      const icon = L.divIcon({
        className: '',
        html: `<div style="
          background: #e0d9d0;
          border: 3px solid ${color};
          border-radius: 50% 50% 50% 0;
          width: 36px; height: 36px;
          transform: rotate(-45deg);
          box-shadow: 4px 4px 10px #c5bfb6, -3px -3px 8px #f5ede4;
          display: flex; align-items: center; justify-content: center;
        ">
          <span style="transform: rotate(45deg); font-size: 14px; font-weight: 700; color: ${color}; line-height: 1;">${group.length}</span>
        </div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -40],
      });

      const popupContent = `
        <div style="font-family: DM Sans, sans-serif; min-width: 160px;">
          <div style="font-weight: 700; font-size: 15px; color: #3a3128; margin-bottom: 8px;">${commune}</div>
          ${group.map(v => `
            <div style="display:flex; justify-content:space-between; font-size:12px; color:#7d736a; margin-bottom:4px;">
              <span>Véhicule #${v.id}</span>
              <span style="font-weight:600; color:${(v.etatBatterie||0)>60?'#22c55e':(v.etatBatterie||0)>30?'#f59e0b':'#ef4444'}">
                ${(v.etatBatterie||0).toFixed(0)}%
              </span>
            </div>
          `).join('')}
        </div>
      `;

      const marker = L.marker(coords, { icon });
      marker.bindPopup(popupContent, { className: 'zotroul-popup' });
      marker.addTo(markersLayer.current);
    });
  }, [vehicules]);

  // Group by commune for sidebar
  const byCommune = {};
  vehicules.forEach(v => { const k = v.commune || 'Inconnu'; if (!byCommune[k]) byCommune[k] = []; byCommune[k].push(v); });

  const flyTo = (commune) => {
    const coords = getCoords(commune);
    if (coords && leafletMap.current) {
      leafletMap.current.flyTo(coords, 13, { duration: 1 });
      setSelected(commune);
    }
  };

  return (
    <div>
      <PageHeader title="Carte des véhicules" subtitle="Kart véhikil — Localisation par commune" />
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 20, height: 580 }}>
        {/* Sidebar list */}
        <NCard style={{ padding: '16px 12px', overflowY: 'auto' }}>
          <div style={{ fontWeight: 600, color: '#3a3128', fontSize: 14, marginBottom: 14, padding: '0 6px' }}>
            Communes · Komin
          </div>
          {loading && <Spinner />}
          {error && <ErrorMsg msg={error} onRetry={load} />}
          {!loading && !error && Object.entries(byCommune).map(([commune, group]) => {
            const avg = group.reduce((s, v) => s + (v.etatBatterie || 0), 0) / group.length;
            const color = avg > 60 ? '#22c55e' : avg > 30 ? '#f59e0b' : '#ef4444';
            const isActive = selected === commune;
            return (
              <button key={commune} onClick={() => flyTo(commune)} style={{
                display: 'block', width: '100%', textAlign: 'left',
                background: '#e0d9d0', border: 'none', borderRadius: 12, cursor: 'pointer',
                padding: '12px 14px', marginBottom: 8, fontFamily: 'DM Sans, sans-serif',
                boxShadow: isActive
                  ? 'inset 3px 3px 8px #c5bfb6, inset -3px -3px 8px #f5ede4'
                  : '3px 3px 8px #c5bfb6, -3px -3px 8px #f5ede4',
                transition: 'all .2s',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontWeight: 600, fontSize: 13, color: '#3a3128' }}>{commune}</span>
                  <span style={{ fontSize: 11, background: '#1a6bff', color: '#fff', borderRadius: 6, padding: '2px 8px', fontWeight: 600 }}>{group.length}</span>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: '#d0c9c0', overflow: 'hidden' }}>
                  <div style={{ width: `${avg}%`, height: '100%', background: color, borderRadius: 3 }} />
                </div>
                {/* <div style={{ fontSize: 11, color, fontWeight: 600, marginTop: 4 }}>Batri moy. {avg.toFixed(0)}%</div> */}
              </button>
            );
          })}
          {!loading && !error && vehicules.length === 0 && (
            <div style={{ color: '#b0a090', fontSize: 13, textAlign: 'center', padding: 20 }}>Ayin véhikil</div>
          )}
        </NCard>

        {/* Map */}
        <NCard style={{ padding: 0, overflow: 'hidden', position: 'relative' }}>
          <div ref={mapRef} style={{ width: '100%', height: '100%', borderRadius: 20 }} />
          {loading && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(224,217,208,.8)', borderRadius: 20 }}>
              <Spinner />
            </div>
          )}
        </NCard>
      </div>
    </div>
  );
};

Object.assign(window, { CarteView });
