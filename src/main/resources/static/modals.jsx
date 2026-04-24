// modals.jsx — CRUD modals for Véhicule, Utilisateur, Session
// Exports to window: { VehiculeModal, UtilisateurModal, SessionModal, ConfirmModal }

/* ═══════════════════════════════════════════════════════════
   MODAL SHELL
═══════════════════════════════════════════════════════════ */
const ModalShell = ({ title, subtitle, onClose, children, width = 480 }) => (
  <div style={{
    position: 'fixed', inset: 0, background: 'rgba(58,49,40,.35)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000, backdropFilter: 'blur(4px)',
  }} onClick={e => e.target === e.currentTarget && onClose()}>
    <div style={{
      background: '#e0d9d0', borderRadius: 22, width, maxWidth: '95vw',
      boxShadow: '12px 12px 30px #c5bfb6, -12px -12px 30px #f5ede4',
      padding: '30px 32px', animation: 'modalIn .22s ease',
      maxHeight: '90vh', overflowY: 'auto',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#3a3128' }}>{title}</h2>
          {subtitle && <p style={{ margin: '4px 0 0', fontSize: 13, color: '#9e8e80' }}>{subtitle}</p>}
        </div>
        <button onClick={onClose} style={{
          background: '#e0d9d0', border: 'none', borderRadius: 10, width: 32, height: 32,
          cursor: 'pointer', color: '#9e8e80', fontSize: 18, lineHeight: 1,
          boxShadow: '3px 3px 8px #c5bfb6, -3px -3px 8px #f5ede4',
        }}>×</button>
      </div>
      {children}
    </div>
  </div>
);

const FieldLabel = ({ children, sub }) => (
  <div style={{ marginBottom: 8 }}>
    <label style={{ fontSize: 12, fontWeight: 600, color: '#7d736a', letterSpacing: .4 }}>{children}</label>
    {sub && <span style={{ fontSize: 11, color: '#b0a090', marginLeft: 6 }}>{sub}</span>}
  </div>
);

const FieldGroup = ({ children }) => (
  <div style={{ marginBottom: 18 }}>{children}</div>
);

/* ═══════════════════════════════════════════════════════════
   VÉHICULE MODAL
═══════════════════════════════════════════════════════════ */
const VehiculeModal = ({ vehicule, defaultType = 'trotinette', onSave, onClose }) => {
  const isEdit = !!vehicule;
  const [form, setForm] = React.useState({
    etatBatterie: vehicule ? vehicule.etatBatterie : '',
    commune: vehicule ? vehicule.commune : '',
    type: vehicule ? (vehicule._type || defaultType) : defaultType,
    panier: vehicule ? (vehicule.panier || false) : false,
    porteBagage: vehicule ? (vehicule.porteBagage || false) : false,
  });
  const [loading, setLoading] = React.useState(false);
  const [err, setErr] = React.useState('');

  const handleSubmit = async () => {
    if (!form.commune.trim()) { setErr('La commune est obligatoire.'); return; }
    if (form.etatBatterie === '' || isNaN(Number(form.etatBatterie))) { setErr("L'état batterie doit être un nombre."); return; }
    setLoading(true);
    try {
      const api = apiForType(form.type);
      const base = { etatBatterie: parseFloat(form.etatBatterie), commune: form.commune.trim() };
      let payload;
      if (form.type === 'trotinette') payload = { ...base, panier: form.panier };
      else if (form.type === 'velo')   payload = { ...base, porteBagage: form.porteBagage };
      else if (form.type === 'scooter') payload = { ...base, panier: form.panier };
      else payload = base;

      if (isEdit) await api.update(vehicule.id, payload);
      else await api.create(payload);
      onSave();
    } catch (e) { setErr(e.message); }
    setLoading(false);
  };

  const typeOptions = [
    { value: 'trotinette', label: '▷ Trottinette' },
    { value: 'velo',       label: '◷ Vélo' },
    { value: 'scooter',    label: '◈ Scooter' },
  ];

  // Inline toggle for boolean fields
  const Toggle = ({ label, labelKR, value, onChange }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 10, background: '#e0d9d0', boxShadow: 'inset 4px 4px 8px #c5bfb6, inset -4px -4px 8px #f5ede4' }}>
      <div>
        <div style={{ fontSize: 13, color: '#3a3128', fontWeight: 500 }}>{label}</div>
        <div style={{ fontSize: 10, color: '#b0a090' }}>{labelKR}</div>
      </div>
      <button onClick={() => onChange(!value)} style={{
        width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
        background: value ? '#44adfd' : '#c5bfb6', transition: 'background .2s', position: 'relative',
        boxShadow: value ? '0 2px 8px #a0d0f8' : 'none',
      }}>
        <span style={{
          position: 'absolute', top: 3, left: value ? 22 : 3,
          width: 18, height: 18, borderRadius: '50%', background: '#fff',
          transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,.2)',
        }} />
      </button>
    </div>
  );

  return (
    <ModalShell
      title={isEdit ? 'Modifier le véhicule' : 'Ajouter un véhicule'}
      subtitle={isEdit ? `Chanj véhikil #${vehicule.id}` : 'Nouvo véhikil'}
      onClose={onClose}>
      {/* Type selector — disabled on edit */}
      <FieldGroup>
        <FloatSelect label="Type de véhicule" sub="· Tip véhikil"
          value={form.type}
          onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
          style={{ opacity: isEdit ? 0.6 : 1 }}
          disabled={isEdit}>
          {typeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </FloatSelect>
        {isEdit && <div style={{ fontSize: 11, color: '#b0a090', marginTop: 4 }}>Le type ne peut pas être modifié après création.</div>}
      </FieldGroup>
      <FieldGroup>
        <FloatInput label="État batterie" sub="· Batri (%)"
          type="number" min="0" max="100" step="0.1"
          value={form.etatBatterie} onChange={e => setForm(p => ({ ...p, etatBatterie: e.target.value }))} />
      </FieldGroup>
      <FieldGroup>
        <FloatInput label="Commune" sub="· Komin"
          value={form.commune} onChange={e => setForm(p => ({ ...p, commune: e.target.value }))} />
      </FieldGroup>
      {/* Type-specific fields */}
      {(form.type === 'trotinette') && (
        <FieldGroup>
          <FieldLabel sub="Panié">Panier</FieldLabel>
          <Toggle label="Panier inclus" labelKR="Ék panié" value={form.panier} onChange={v => setForm(p => ({ ...p, panier: v }))} />
        </FieldGroup>
      )}
      {form.type === 'velo' && (
        <FieldGroup>
          <FieldLabel sub="Port-bagaj">Porte-bagage</FieldLabel>
          <Toggle label="Porte-bagage inclus" labelKR="Ék port-bagaj" value={form.porteBagage} onChange={v => setForm(p => ({ ...p, porteBagage: v }))} />
        </FieldGroup>
      )}
      {form.type === 'scooter' && (
        <FieldGroup>
          <FieldLabel sub="Panié">Panier</FieldLabel>
          <Toggle label="Panier inclus" labelKR="Ék panié" value={form.panier} onChange={v => setForm(p => ({ ...p, panier: v }))} />
        </FieldGroup>
      )}
      {err && <div style={{ color: '#ef4444', fontSize: 13, marginBottom: 14 }}>⚠ {err}</div>}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
        <BtnGhost onClick={onClose}>Annuler · Anilé</BtnGhost>
        <BtnBlue onClick={handleSubmit} disabled={loading}>
          {loading ? '…' : isEdit ? 'Enregistrer · Gard' : 'Créer · Kré'}
        </BtnBlue>
      </div>
    </ModalShell>
  );
};

/* ═══════════════════════════════════════════════════════════
   UTILISATEUR MODAL
═══════════════════════════════════════════════════════════ */
const UtilisateurModal = ({ utilisateur, onSave, onClose }) => {
  const isEdit = !!utilisateur;
  const [form, setForm] = React.useState({
    username: utilisateur ? utilisateur.username : '',
    numeroTelephone: utilisateur ? utilisateur.numeroTelephone : '',
  });
  const [loading, setLoading] = React.useState(false);
  const [err, setErr] = React.useState('');

  const handleSubmit = async () => {
    if (!form.username.trim()) { setErr("Le nom d'utilisateur est obligatoire."); return; }
    setLoading(true);
    try {
      const payload = { username: form.username.trim(), numeroTelephone: form.numeroTelephone.trim() };
      if (isEdit) await UtilisateurAPI.update(utilisateur.id, payload);
      else await UtilisateurAPI.create(payload);
      onSave();
    } catch (e) { setErr(e.message); }
    setLoading(false);
  };

  return (
    <ModalShell title={isEdit ? "Modifier l'utilisateur" : "Ajouter un utilisateur"}
      subtitle={isEdit ? `Chanj itilizatèr #${utilisateur.id}` : 'Nouvo itilizatèr'}
      onClose={onClose}>
      <FieldGroup>
        <FloatInput label="Nom d'utilisateur" sub="· Non d'itilizatèr"
          value={form.username} onChange={e => setForm(p => ({ ...p, username: e.target.value }))} />
      </FieldGroup>
      <FieldGroup>
        <FloatInput label="Numéro de téléphone" sub="· Nimewo téléfòn"
          value={form.numeroTelephone} onChange={e => setForm(p => ({ ...p, numeroTelephone: e.target.value }))} />
      </FieldGroup>
      {err && <div style={{ color: '#ef4444', fontSize: 13, marginBottom: 14 }}>⚠ {err}</div>}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
        <BtnGhost onClick={onClose}>Annuler · Anilé</BtnGhost>
        <BtnBlue onClick={handleSubmit} disabled={loading}>
          {loading ? '…' : isEdit ? 'Enregistrer · Gard' : 'Créer · Kré'}
        </BtnBlue>
      </div>
    </ModalShell>
  );
};

/* ═══════════════════════════════════════════════════════════
   SESSION MODAL
═══════════════════════════════════════════════════════════ */
const SessionModal = ({ session, utilisateurs, vehicules, onSave, onClose }) => {
  const isEdit = !!session;
  const fmt = (d) => d ? new Date(d).toISOString().slice(0, 16) : '';
  const [form, setForm] = React.useState({
    dateDebut: session ? fmt(session.dateDebut) : '',
    dateFin: session ? fmt(session.dateFin) : '',
    prix: session ? session.prix : '',
    utilisateurId: session ? (session.utilisateur?.id || '') : '',
    vehiculeId: session ? (session.vehicule?.id || '') : '',
  });
  const [loading, setLoading] = React.useState(false);
  const [err, setErr] = React.useState('');

  const handleSubmit = async () => {
    if (!form.utilisateurId) { setErr("L'utilisateur est obligatoire."); return; }
    if (!form.vehiculeId) { setErr("Le véhicule est obligatoire."); return; }
    if (!form.dateDebut) { setErr("La date de début est obligatoire."); return; }
    setLoading(true);
    try {
      const payload = {
        dateDebut: form.dateDebut ? new Date(form.dateDebut).toISOString() : null,
        dateFin: form.dateFin ? new Date(form.dateFin).toISOString() : null,
        prix: form.prix !== '' ? parseFloat(form.prix) : null,
        utilisateur: { id: parseInt(form.utilisateurId) },
        vehicule: { id: parseInt(form.vehiculeId) },
      };
      if (isEdit) await SessionAPI.update(session.id, payload);
      else await SessionAPI.create(payload);
      onSave();
    } catch (e) { setErr(e.message); }
    setLoading(false);
  };

  return (
    <ModalShell title={isEdit ? 'Modifier la session' : 'Ajouter une session'}
      subtitle={isEdit ? `Chanj sésion #${session.id}` : 'Nouvo sésion'}
      onClose={onClose} width={520}>
      <div className="session-dates-grid">
        <FieldGroup>
          <FloatInput label="Date de début" sub="· Dat dépar"
            type="datetime-local" value={form.dateDebut} onChange={e => setForm(p => ({ ...p, dateDebut: e.target.value }))} />
        </FieldGroup>
        <FieldGroup>
          <FloatInput label="Date de fin" sub="· Dat la fin"
            type="datetime-local" value={form.dateFin} onChange={e => setForm(p => ({ ...p, dateFin: e.target.value }))} />
        </FieldGroup>
      </div>
      <FieldGroup>
        <FloatInput label="Prix" sub="· Pri (€)"
          type="number" step="0.01" value={form.prix} onChange={e => setForm(p => ({ ...p, prix: e.target.value }))} />
      </FieldGroup>
      <FieldGroup>
        <FloatSelect label="Utilisateur" sub="· Utilizatèr"
          value={form.utilisateurId} onChange={e => setForm(p => ({ ...p, utilisateurId: e.target.value }))}>
          <option value=""></option>
          {utilisateurs.map(u => <option key={u.id} value={u.id}>#{u.id} · {u.username}</option>)}
        </FloatSelect>
      </FieldGroup>
      <FieldGroup>
        <FloatSelect label="Véhicule" sub="· Véhikil"
          value={form.vehiculeId} onChange={e => setForm(p => ({ ...p, vehiculeId: e.target.value }))}>
          <option value=""></option>
          {vehicules.map(v => <option key={v.id} value={v.id}>#{v.id} · {v.commune} ({(v.etatBatterie||0).toFixed(0)}%)</option>)}
        </FloatSelect>
      </FieldGroup>
      {err && <div style={{ color: '#ef4444', fontSize: 13, marginBottom: 14 }}>⚠ {err}</div>}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
        <BtnGhost onClick={onClose}>Annuler · Anilé</BtnGhost>
        <BtnBlue onClick={handleSubmit} disabled={loading}>
          {loading ? '…' : isEdit ? 'Enregistrer · Gard' : 'Créer · Kré'}
        </BtnBlue>
      </div>
    </ModalShell>
  );
};

/* ═══════════════════════════════════════════════════════════
   CONFIRM MODAL
═══════════════════════════════════════════════════════════ */
const ConfirmModal = ({ message, onConfirm, onClose }) => (
  <ModalShell title="Confirmer la suppression" subtitle="Ou sir ou vlé souplim sa ?" onClose={onClose} width={380}>
    <p style={{ color: '#7d736a', fontSize: 14, marginBottom: 24 }}>{message}</p>
    <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
      <BtnGhost onClick={onClose}>Annuler · Anilé</BtnGhost>
      <button onClick={onConfirm} style={{
        background: 'linear-gradient(135deg, #ff4444, #ef4444)',
        color: '#fff', border: 'none', borderRadius: 12, cursor: 'pointer',
        padding: '12px 22px', fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 600,
        boxShadow: '4px 4px 12px #e0b0b0',
      }}>Supprimer · Souplim</button>
    </div>
  </ModalShell>
);

Object.assign(window, { VehiculeModal, UtilisateurModal, SessionModal, ConfirmModal });
