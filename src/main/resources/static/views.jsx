// views.jsx — Dashboard, VehiculesView, UtilisateursView, SessionsView
// Exports to window: { DashboardView, VehiculesView, UtilisateursView, SessionsView }

/* ═══════════════════════════════════════════════════════════
   DASHBOARD
═══════════════════════════════════════════════════════════ */
const DashboardView = () => {
  const toast = useToast();
  const [data, setData] = React.useState({ utilisateurs: [], vehicules: [], sessions: [] });
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  const load = async () => {
    setLoading(true); setError('');
    try {
      const [u, v, s] = await Promise.all([
        UtilisateurAPI.getAll(),
        Promise.all([TrotinetteAPI.getAll(), VeloAPI.getAll(), ScooterAPI.getAll()])
          .then(([t, ve, sc]) => [
            ...(t||[]).map(x=>({...x,_type:'trotinette'})),
            ...(ve||[]).map(x=>({...x,_type:'velo'})),
            ...(sc||[]).map(x=>({...x,_type:'scooter'})),
          ]),
        SessionAPI.getAll(),
      ]);
      setData({ utilisateurs: u || [], vehicules: v || [], sessions: s || [] });
    } catch (e) { setError(e.message); toast.error('Connexion au backend échouée'); }
    setLoading(false);
  };

  React.useEffect(() => { load(); }, []);

  if (loading) return <Spinner />;
  if (error) return <ErrorMsg msg={error} onRetry={load} />;

  const { utilisateurs, vehicules, sessions } = data;
  const totalRevenu = sessions.reduce((sum, s) => sum + (s.prix || 0), 0);
  const avgBattery = vehicules.length ? vehicules.reduce((s, v) => s + (v.etatBatterie || 0), 0) / vehicules.length : 0;
  const communeMap = {};
  vehicules.forEach(v => { communeMap[v.commune] = (communeMap[v.commune] || 0) + 1; });
  const recentSessions = [...sessions].sort((a, b) => new Date(b.dateDebut) - new Date(a.dateDebut)).slice(0, 5);

  return (
    <div>
      <PageHeader title="Tableau de bord" subtitle="Tablodbòr — Zéstion la flòt" />

      {/* KPIs */}
      <div className="kpi-grid">
        <KpiCard label="Véhicules" sublabel="Véhikil" value={vehicules.length} color="#1a6bff" sub={`Batterie moy. ${avgBattery.toFixed(0)}%`} />
        <KpiCard label="Utilisateurs" sublabel="Itilizatèr" value={utilisateurs.length} color="#8b5cf6" />
        <KpiCard label="Sessions" sublabel="Sésion" value={sessions.length} color="#10b981" sub={`${sessions.length} total`} />
        <KpiCard label="Revenu total" sublabel="Larzant total" value={`${totalRevenu.toFixed(2)} €`} color="#f59e0b" />
      </div>

      {/* 2-col row */}
      <div className="two-col-grid">
        {/* Véhicules par commune */}
        <NCard>
          <div style={{ fontWeight: 600, color: '#3a3128', marginBottom: 16, fontSize: 15 }}>Véhicules par commune <span style={{ fontSize: 11, color: '#9e8e80' }}>· Véhikil par komin</span></div>
          {Object.entries(communeMap).length === 0 && <div style={{ color: '#b0a090', fontSize: 13 }}>Aucune donnée</div>}
          {Object.entries(communeMap).map(([commune, count]) => (
            <div key={commune} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 13, color: '#3a3128' }}>{commune}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#1a6bff' }}>{count}</span>
              </div>
              <div style={{ height: 8, borderRadius: 4, background: '#d0c9c0', overflow: 'hidden' }}>
                <div style={{ width: `${(count / vehicules.length) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #2979ff, #1a6bff)', borderRadius: 4 }} />
              </div>
            </div>
          ))}
        </NCard>

        {/* État batterie */}
        <NCard>
          <div style={{ fontWeight: 600, color: '#3a3128', marginBottom: 16, fontSize: 15 }}>État batterie <span style={{ fontSize: 11, color: '#9e8e80' }}>· Etat batri</span></div>
          {vehicules.length === 0 && <div style={{ color: '#b0a090', fontSize: 13 }}>Aucune donnée</div>}
          {vehicules.map(v => (
            <div key={v.id} style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, color: '#7d736a', marginBottom: 4 }}>#{v.id} · {v.commune}</div>
              <BatteryBar value={v.etatBatterie} />
            </div>
          ))}
        </NCard>
      </div>

      {/* Recent sessions */}
      <NCard>
        <div style={{ fontWeight: 600, color: '#3a3128', marginBottom: 16, fontSize: 15 }}>Sessions récentes <span style={{ fontSize: 11, color: '#9e8e80' }}>· Sésion résan</span></div>
        <NTable
          cols={[
            { label: '#', render: r => <span style={{ color: '#1a6bff', fontWeight: 600 }}>#{r.id}</span> },
            { label: 'Utilisateur · Utilizatèr', render: r => r.utilisateur?.username || '—' },
            { label: 'Véhicule · Véhikil', render: r => r.vehicule ? `#${r.vehicule.id} · ${r.vehicule.commune}` : '—' },
            { label: 'Début · Dépar', render: r => r.dateDebut ? new Date(r.dateDebut).toLocaleString('fr-FR') : '—' },
            { label: 'Prix · Pri', render: r => r.prix != null ? <span style={{ fontWeight: 600, color: '#f59e0b' }}>{r.prix.toFixed(2)} €</span> : '—' },
          ]}
          rows={recentSessions}
          emptyMsg="Aucune session · Ayin sésion"
        />
      </NCard>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   VÉHICULES VIEW — fetches from 3 typed APIs
═══════════════════════════════════════════════════════════ */
const TYPE_DEFS = [
  { key: 'trotinette', labelFR: 'Trottinettes', labelKR: 'Trotinet', icon: '🛴', color: '#44adfd' },
  { key: 'velo',       labelFR: 'Vélos',         labelKR: 'Vélo',     icon: '🚲', color: '#8b5cf6' },
  { key: 'scooter',    labelFR: 'Scooters',      labelKR: 'Skoutèr',  icon: '🛵', color: '#f59e0b' },
];

const VehiculesView = () => {
  const toast = useToast();
  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [activeTypes, setActiveTypes] = React.useState({ trotinette: true, velo: true, scooter: true });
  const [modal, setModal] = React.useState(null);

  const load = async () => {
    setLoading(true); setError('');
    try {
      const [trotinettes, velos, scooters] = await Promise.all([
        TrotinetteAPI.getAll(),
        VeloAPI.getAll(),
        ScooterAPI.getAll(),
      ]);
      const all = [
        ...(trotinettes || []).map(t => ({ ...t, _type: 'trotinette' })),
        ...(velos       || []).map(v => ({ ...v, _type: 'velo' })),
        ...(scooters    || []).map(s => ({ ...s, _type: 'scooter' })),
      ];
      setItems(all);
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  React.useEffect(() => { load(); }, []);

  const toggleType = (key) => setActiveTypes(p => ({ ...p, [key]: !p[key] }));

  const handleDelete = async (item) => {
    try {
      await apiForType(item._type).delete(item.id);
      toast.success('Véhicule supprimé · Souplimé');
      setModal(null); load();
    } catch (e) { toast.error(e.message); }
  };

  const handleSave = () => {
    toast.success(modal?.type === 'edit' ? 'Véhicule modifié · Chanjé' : 'Véhicule kréyé');
    setModal(null); load();
  };

  const filtered = items.filter(v => {
    if (!activeTypes[v._type]) return false;
    return (v.commune || '').toLowerCase().includes(search.toLowerCase()) || String(v.id).includes(search);
  });

  const countByType = (key) => items.filter(v => v._type === key).length;

  return (
    <div>
      <PageHeader title="Véhicules" subtitle="Véhikil — Zéstion la flòt"
        action={<BtnBlue onClick={() => setModal({ type: 'create' })}>+ Ajouter · Azout</BtnBlue>} />

      {/* Type filter chips */}
      <div className="type-chips">
        {TYPE_DEFS.map(td => {
          const on = activeTypes[td.key];
          return (
            <button key={td.key} onClick={() => toggleType(td.key)} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 18px', borderRadius: 12, border: 'none', cursor: 'pointer',
              background: '#e0d9d0', fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 600,
              color: on ? td.color : '#b0a090',
              boxShadow: on
                ? 'inset 4px 4px 10px #c5bfb6, inset -4px -4px 10px #f5ede4'
                : '4px 4px 10px #c5bfb6, -4px -4px 10px #f5ede4',
              transition: 'all .2s',
            }}>
              <span style={{
                width: 16, height: 16, borderRadius: 4, border: `2px solid ${on ? td.color : '#c5bfb6'}`,
                background: on ? td.color : 'transparent', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: 10, color: '#fff', flexShrink: 0,
              }}>{on ? '✓' : ''}</span>
              <span style={{ fontSize: 16 }}>{td.icon}</span>
              <div style={{ textAlign: 'left' }}>
                <div>{td.labelFR}</div>
                <div style={{ fontSize: 10, opacity: .6, fontWeight: 400 }}>{td.labelKR}</div>
              </div>
              <span style={{
                marginLeft: 4, fontSize: 11, fontWeight: 700,
                background: on ? td.color : '#c5bfb6', color: '#fff',
                borderRadius: 6, padding: '1px 7px',
              }}>{countByType(td.key)}</span>
            </button>
          );
        })}
      </div>

      <NCard>
        <SearchBar value={search} onChange={setSearch} placeholder="Chercher par commune ou ID… · Rod par komin ou ID…" />
        {loading ? <Spinner /> : error ? <ErrorMsg msg={error} onRetry={load} /> : (
          <NTable
            cols={[
              { label: 'ID', render: r => <span style={{ color: '#1a6bff', fontWeight: 700 }}>#{r.id}</span> },
              { label: 'Type', render: r => {
                const td = TYPE_DEFS.find(t => t.key === r._type) || TYPE_DEFS[0];
                return <span style={{ color: td.color, fontWeight: 600 }}>{td.icon} {td.labelFR.replace(/s$/, '')}</span>;
              }},
              { label: 'Commune · Komin', key: 'commune' },
              { label: 'Batterie · Batri', render: r => <BatteryBar value={r.etatBatterie} /> },
              { label: 'Options', render: r => {
                if (r._type === 'trotinette' || r._type === 'scooter')
                  return <span style={{ fontSize: 12, color: r.panier ? '#22c55e' : '#c0b0a0' }}>{r.panier ? '✓ Panier' : '— Panier'}</span>;
                if (r._type === 'velo')
                  return <span style={{ fontSize: 12, color: r.porteBagage ? '#22c55e' : '#c0b0a0' }}>{r.porteBagage ? '✓ Porte-bagage' : '— Porte-bagage'}</span>;
                return '—';
              }},
              { label: 'Sessions · Sésion', render: r => <span style={{ color: '#8b5cf6', fontWeight: 600 }}>{r.sessions?.length ?? 0}</span> },
              {
                label: 'Actions', render: r => (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <BtnBlue small onClick={() => setModal({ type: 'edit', data: r })}>Modifier</BtnBlue>
                    <BtnGhost small danger onClick={() => setModal({ type: 'delete', data: r })}>Supprimer</BtnGhost>
                  </div>
                )
              },
            ]}
            rows={filtered}
            emptyMsg="Ayin véhikil trouvé · Aucun véhicule trouvé"
          />
        )}
      </NCard>

      {modal?.type === 'create' && <VehiculeModal onSave={handleSave} onClose={() => setModal(null)} />}
      {modal?.type === 'edit' && <VehiculeModal vehicule={modal.data} onSave={handleSave} onClose={() => setModal(null)} />}
      {modal?.type === 'delete' && (
        <ConfirmModal
          message={`Souplimé véhikil #${modal.data.id} (${modal.data.commune}) ?`}
          onConfirm={() => handleDelete(modal.data)}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   UTILISATEURS VIEW
═══════════════════════════════════════════════════════════ */
const UtilisateursView = () => {
  const toast = useToast();
  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [modal, setModal] = React.useState(null);

  const load = async () => {
    setLoading(true); setError('');
    try { setItems(await UtilisateurAPI.getAll() || []); }
    catch (e) { setError(e.message); }
    setLoading(false);
  };

  React.useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    try {
      await UtilisateurAPI.delete(id);
      toast.success('Utilisateur supprimé · Utilizatèr souplimé');
      setModal(null); load();
    } catch (e) { toast.error(e.message); }
  };

  const handleSave = () => {
    toast.success(modal?.type === 'edit' ? 'Utilisateur modifié · Chanjé' : 'Utilisateur créé · Kréyé');
    setModal(null); load();
  };

  const filtered = items.filter(u =>
    (u.username || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.numeroTelephone || '').includes(search) ||
    String(u.id).includes(search)
  );

  return (
    <div>
      <PageHeader title="Utilisateurs" subtitle="Itilizatèr — Zéstion bann kont"
        action={<BtnBlue onClick={() => setModal({ type: 'create' })}>+ Ajouter · Azout</BtnBlue>} />
      <NCard>
        <SearchBar value={search} onChange={setSearch} placeholder="Chercher par nom ou téléphone… · Rod par nom ou téléfòn…" />
        {loading ? <Spinner /> : error ? <ErrorMsg msg={error} onRetry={load} /> : (
          <NTable
            cols={[
              { label: 'ID', render: r => <span style={{ color: '#1a6bff', fontWeight: 700 }}>#{r.id}</span> },
              { label: 'Username · Non', render: r => <span style={{ fontWeight: 600, color: '#3a3128' }}>{r.username}</span> },
              { label: 'Téléphone · Téléfòn', render: r => r.numeroTelephone || <span style={{ color: '#c0b0a0' }}>—</span> },
              { label: 'Sessions · Sésion', render: r => <span style={{ color: '#8b5cf6', fontWeight: 600 }}>{r.sessions?.length ?? 0}</span> },
              {
                label: 'Actions', render: r => (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <BtnBlue small onClick={() => setModal({ type: 'edit', data: r })}>Modifier</BtnBlue>
                    <BtnGhost small danger onClick={() => setModal({ type: 'delete', data: r })}>Supprimer</BtnGhost>
                  </div>
                )
              },
            ]}
            rows={filtered}
            emptyMsg="Aucun utilisateur trouvé · Ayin utilizatèr trouvé"
          />
        )}
      </NCard>
      {modal?.type === 'create' && <UtilisateurModal onSave={handleSave} onClose={() => setModal(null)} />}
      {modal?.type === 'edit' && <UtilisateurModal utilisateur={modal.data} onSave={handleSave} onClose={() => setModal(null)} />}
      {modal?.type === 'delete' && (
        <ConfirmModal
          message={`Supprimer l'utilisateur "${modal.data.username}" (#${modal.data.id}) ?`}
          onConfirm={() => handleDelete(modal.data.id)}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   SESSIONS VIEW
═══════════════════════════════════════════════════════════ */
const SessionsView = () => {
  const toast = useToast();
  const [items, setItems] = React.useState([]);
  const [utilisateurs, setUtilisateurs] = React.useState([]);
  const [vehicules, setVehicules] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [modal, setModal] = React.useState(null);

  const load = async () => {
    setLoading(true); setError('');
    try {
      const [s, u, v] = await Promise.all([
        SessionAPI.getAll(),
        UtilisateurAPI.getAll(),
        VehiculeAPI.getAll(),
      ]);
      setItems(s || []);
      setUtilisateurs(u || []);
      setVehicules(v || []);
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  React.useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    try {
      await SessionAPI.delete(id);
      toast.success('Session supprimée · Sésion souplimé');
      setModal(null); load();
    } catch (e) { toast.error(e.message); }
  };

  const handleSave = () => {
    toast.success(modal?.type === 'edit' ? 'Session modifiée · Sésion chanjé' : 'Session créée · Sésion kréyé');
    setModal(null); load();
  };

  const fmtDate = d => d ? new Date(d).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }) : '—';
  const duration = (a, b) => {
    if (!a || !b) return '—';
    const diff = (new Date(b) - new Date(a)) / 60000;
    return diff > 0 ? `${Math.floor(diff / 60)}h${String(Math.round(diff % 60)).padStart(2, '0')}` : '—';
  };

  const filtered = items.filter(s =>
    String(s.id).includes(search) ||
    (s.utilisateur?.username || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.vehicule?.commune || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <PageHeader title="Sessions" subtitle="Sésion — Istorik bann lokasion"
        action={<BtnBlue onClick={() => setModal({ type: 'create' })}>+ Ajouter · Azout</BtnBlue>} />
      <NCard>
        <SearchBar value={search} onChange={setSearch} placeholder="Chercher par ID, utilisateur, commune… · Rod par ID, itilizatèr, komin…" />
        {loading ? <Spinner /> : error ? <ErrorMsg msg={error} onRetry={load} /> : (
          <NTable
            cols={[
              { label: '#', render: r => <span style={{ color: '#1a6bff', fontWeight: 700 }}>#{r.id}</span> },
              { label: 'Utilisateur · Utilizatèr', render: r => r.utilisateur?.username || '—' },
              { label: 'Véhicule · Véhikil', render: r => r.vehicule ? `#${r.vehicule.id} · ${r.vehicule.commune}` : '—' },
              { label: 'Début · Dépar', render: r => fmtDate(r.dateDebut) },
              { label: 'Fin · La fin', render: r => fmtDate(r.dateFin) },
              { label: 'Durée', render: r => duration(r.dateDebut, r.dateFin) },
              { label: 'Prix · Pri', render: r => r.prix != null ? <span style={{ fontWeight: 600, color: '#f59e0b' }}>{r.prix.toFixed(2)} €</span> : '—' },
              {
                label: 'Actions', render: r => (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <BtnBlue small onClick={() => setModal({ type: 'edit', data: r })}>Modifier</BtnBlue>
                    <BtnGhost small danger onClick={() => setModal({ type: 'delete', data: r })}>Supprimer</BtnGhost>
                  </div>
                )
              },
            ]}
            rows={filtered}
            emptyMsg="Aucune session trouvée · Ayin sésion trouvé"
          />
        )}
      </NCard>
      {modal?.type === 'create' && (
        <SessionModal utilisateurs={utilisateurs} vehicules={vehicules} onSave={handleSave} onClose={() => setModal(null)} />
      )}
      {modal?.type === 'edit' && (
        <SessionModal session={modal.data} utilisateurs={utilisateurs} vehicules={vehicules} onSave={handleSave} onClose={() => setModal(null)} />
      )}
      {modal?.type === 'delete' && (
        <ConfirmModal
          message={`Supprimer la session #${modal.data.id} ?`}
          onConfirm={() => handleDelete(modal.data.id)}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
};

Object.assign(window, { DashboardView, VehiculesView, UtilisateursView, SessionsView });
