// components.jsx — Sidebar + Toast + shared UI
// Exports to window: { Sidebar, ToastContainer, useToast }

/* ═══════════════════════════════════════════════════════════
   TOAST
═══════════════════════════════════════════════════════════ */
let _toastDispatch = null;

const useToast = () => {
  const show = (msg, type = 'success') => {
    if (_toastDispatch) _toastDispatch({ msg, type, id: Date.now() });
  };
  return { success: (m) => show(m, 'success'), error: (m) => show(m, 'error'), info: (m) => show(m, 'info') };
};

const ToastContainer = () => {
  const [toasts, setToasts] = React.useState([]);
  _toastDispatch = (t) => {
    setToasts(p => [...p, t]);
    setTimeout(() => setToasts(p => p.filter(x => x.id !== t.id)), 3200);
  };
  const icons = { success: '✓', error: '✕', info: 'i' };
  const colors = { success: '#22c55e', error: '#ef4444', info: '#1a6bff' };
  return (
    <div style={{ position: 'fixed', top: 24, right: 24, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 10 }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          display: 'flex', alignItems: 'center', gap: 12,
          background: '#e0d9d0', borderRadius: 14, padding: '12px 18px',
          boxShadow: '6px 6px 14px #c5bfb6, -6px -6px 14px #f5ede4',
          minWidth: 260, animation: 'toastIn .25s ease',
          fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: '#3a3128',
        }}>
          <span style={{
            width: 28, height: 28, borderRadius: '50%', background: colors[t.type],
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: 13, flexShrink: 0,
          }}>{icons[t.type]}</span>
          {t.msg}
        </div>
      ))}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   SIDEBAR
═══════════════════════════════════════════════════════════ */
const NAV_ITEMS = [
  { id: 'dashboard',    labelFR: 'Tableau de bord', labelKR: 'Tablodbòr',    icon: '⬡' },
  { id: 'vehicules',    labelFR: 'Véhicules',        labelKR: 'Véhikil',      icon: '◈' },
  { id: 'utilisateurs', labelFR: 'Utilisateurs',     labelKR: 'Itilizatèr',   icon: '◉' },
  { id: 'sessions',     labelFR: 'Sessions',          labelKR: 'Sésion',       icon: '◎' },
  { id: 'carte',        labelFR: 'Carte',             labelKR: 'Kart',         icon: '◌' },
];

const Sidebar = ({ active, onNav, lang }) => {
  const nm = (style) => ({
    background: '#e0d9d0',
    boxShadow: style === 'inset'
      ? 'inset 4px 4px 10px #c5bfb6, inset -4px -4px 10px #f5ede4'
      : '5px 5px 12px #c5bfb6, -5px -5px 12px #f5ede4',
    borderRadius: 16,
    ...( style === 'active' ? { boxShadow: 'inset 4px 4px 10px #c5bfb6, inset -4px -4px 10px #f5ede4' } : {} ),
  });

  return (
    <aside style={{
      width: 240, minHeight: '100vh', background: '#e0d9d0',
      display: 'flex', flexDirection: 'column', padding: '28px 18px',
      boxShadow: '6px 0 20px #c5bfb6', flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 36, padding: '0 6px' }}>
        <img src="Logo.png" alt="Zotroul" style={{ width: 44, height: 44, objectFit: 'contain', borderRadius: 12 }} />
        <div>
          <div style={{ fontWeight: 700, fontSize: 20, color: '#3a3128', letterSpacing: '-0.5px' }}>Zotroul</div>
          <div style={{ fontSize: 10, color: '#9e8e80', fontWeight: 500, letterSpacing: 1 }}>MOBILITÉ PARTAGÉE</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
        {NAV_ITEMS.map(item => {
          const isActive = active === item.id;
          return (
            <button key={item.id} onClick={() => onNav(item.id)} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '13px 18px', borderRadius: 14, border: 'none', cursor: 'pointer',
              background: '#e0d9d0', color: isActive ? '#1a6bff' : '#7d736a',
              fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: isActive ? 600 : 400,
              textAlign: 'left', transition: 'all .2s',
              boxShadow: isActive
                ? 'inset 4px 4px 10px #c5bfb6, inset -4px -4px 10px #f5ede4'
                : '4px 4px 10px #c5bfb6, -4px -4px 10px #f5ede4',
            }}>
              <span style={{ fontSize: 18 }}>{item.icon}</span>
              <div>
                <div>{item.labelFR}</div>
                <div style={{ fontSize: 10, opacity: 0.6, fontWeight: 400 }}>{item.labelKR}</div>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ marginTop: 'auto', padding: '12px 6px 0', borderTop: '1px solid #ccc5bb', fontSize: 11, color: '#a09080' }}>
        Backend → <span style={{ color: '#1a6bff' }}>localhost:8080</span>
      </div>
    </aside>
  );
};

/* ═══════════════════════════════════════════════════════════
   SHARED COMPONENTS
═══════════════════════════════════════════════════════════ */

// Neumorphic card
const NCard = ({ children, style = {} }) => (
  <div style={{
    background: '#e0d9d0', borderRadius: 20,
    boxShadow: '8px 8px 20px #c5bfb6, -8px -8px 20px #f5ede4',
    padding: 24, ...style,
  }}>{children}</div>
);

// Neumorphic input
const NInput = ({ style = {}, ...props }) => (
  <input {...props} style={{
    background: '#e0d9d0', border: 'none', outline: 'none',
    borderRadius: 10, padding: '10px 14px',
    boxShadow: 'inset 4px 4px 8px #c5bfb6, inset -4px -4px 8px #f5ede4',
    fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: '#3a3128',
    width: '100%', boxSizing: 'border-box', ...style,
  }} />
);

// Neumorphic select
const NSelect = ({ children, style = {}, ...props }) => (
  <select {...props} style={{
    background: '#e0d9d0', border: 'none', outline: 'none',
    borderRadius: 10, padding: '10px 14px',
    boxShadow: 'inset 4px 4px 8px #c5bfb6, inset -4px -4px 8px #f5ede4',
    fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: '#3a3128',
    width: '100%', boxSizing: 'border-box', cursor: 'pointer', ...style,
  }}>{children}</select>
);

// Blue primary button
const BtnBlue = ({ children, style = {}, small = false, ...props }) => (
  <button {...props} style={{
    background: 'linear-gradient(135deg, #2979ff, #1a6bff)',
    color: '#fff', border: 'none', borderRadius: 12, cursor: 'pointer',
    padding: small ? '8px 16px' : '12px 22px',
    fontFamily: 'DM Sans, sans-serif', fontSize: small ? 13 : 14, fontWeight: 600,
    boxShadow: '4px 4px 12px #a0b8e8, -2px -2px 8px #f5ede4',
    transition: 'all .18s', display: 'inline-flex', alignItems: 'center', gap: 6, ...style,
  }}>{children}</button>
);

// Ghost / danger button
const BtnGhost = ({ children, danger = false, style = {}, small = false, ...props }) => (
  <button {...props} style={{
    background: '#e0d9d0', border: 'none', borderRadius: 10, cursor: 'pointer',
    padding: small ? '7px 13px' : '10px 18px',
    fontFamily: 'DM Sans, sans-serif', fontSize: small ? 12 : 13, fontWeight: 500,
    color: danger ? '#ef4444' : '#7d736a',
    boxShadow: '3px 3px 8px #c5bfb6, -3px -3px 8px #f5ede4',
    transition: 'all .18s', ...style,
  }}>{children}</button>
);

// Page header
const PageHeader = ({ title, subtitle, action }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
    <div>
      <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: '#3a3128', letterSpacing: '-0.5px' }}>{title}</h1>
      {subtitle && <p style={{ margin: '4px 0 0', fontSize: 13, color: '#9e8e80' }}>{subtitle}</p>}
    </div>
    {action}
  </div>
);

// Search bar
const SearchBar = ({ value, onChange, placeholder }) => (
  <div style={{ position: 'relative', marginBottom: 20 }}>
    <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9e8e80', fontSize: 15 }}>⌕</span>
    <NInput value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder || 'Rechercher…'}
      style={{ paddingLeft: 36 }} />
  </div>
);

// Battery bar
const BatteryBar = ({ value }) => {
  const pct = Math.min(100, Math.max(0, value || 0));
  const color = pct > 60 ? '#22c55e' : pct > 30 ? '#f59e0b' : '#ef4444';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, height: 8, borderRadius: 4, background: '#d0c9c0', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 4, transition: 'width .4s' }} />
      </div>
      <span style={{ fontSize: 12, color, fontWeight: 600, minWidth: 36 }}>{pct.toFixed(0)}%</span>
    </div>
  );
};

// KPI card
const KpiCard = ({ label, sublabel, value, sub, color = '#1a6bff' }) => (
  <NCard style={{ padding: '20px 24px' }}>
    <div style={{ fontSize: 11, color: '#9e8e80', fontWeight: 600, letterSpacing: .5, marginBottom: 2 }}>{label.toUpperCase()}</div>
    {sublabel && <div style={{ fontSize: 10, color: '#b0a090', marginBottom: 10 }}>{sublabel}</div>}
    <div style={{ fontSize: 34, fontWeight: 700, color, letterSpacing: '-1px', lineHeight: 1 }}>{value}</div>
    {sub && <div style={{ fontSize: 12, color: '#9e8e80', marginTop: 6 }}>{sub}</div>}
  </NCard>
);

// Loading spinner
const Spinner = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
    <div style={{
      width: 40, height: 40, borderRadius: '50%',
      boxShadow: '4px 4px 12px #c5bfb6, -4px -4px 12px #f5ede4',
      border: '3px solid transparent', borderTopColor: '#1a6bff',
      animation: 'spin .8s linear infinite',
    }} />
  </div>
);

// Error message
const ErrorMsg = ({ msg, onRetry }) => (
  <NCard style={{ textAlign: 'center', padding: 40 }}>
    <div style={{ fontSize: 32, marginBottom: 12 }}>⚠</div>
    <div style={{ color: '#ef4444', fontWeight: 600, marginBottom: 8 }}>Erreur de connexion</div>
    <div style={{ color: '#9e8e80', fontSize: 13, marginBottom: 20 }}>{msg}</div>
    {onRetry && <BtnBlue onClick={onRetry}>Réessayer</BtnBlue>}
  </NCard>
);

// Table
const NTable = ({ cols, rows, emptyMsg = 'Aucune donnée' }) => (
  <div style={{ overflowX: 'auto' }}>
    <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
      <thead>
        <tr>
          {cols.map((c, i) => (
            <th key={i} style={{
              padding: '8px 16px', textAlign: 'left', fontSize: 11,
              color: '#9e8e80', fontWeight: 600, letterSpacing: .5,
              textTransform: 'uppercase',
            }}>{c.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 && (
          <tr><td colSpan={cols.length} style={{ textAlign: 'center', padding: 40, color: '#b0a090', fontSize: 14 }}>{emptyMsg}</td></tr>
        )}
        {rows.map((row, ri) => (
          <tr key={ri} style={{ background: '#e0d9d0' }}>
            {cols.map((c, ci) => (
              <td key={ci} style={{
                padding: '14px 16px', fontSize: 14, color: '#3a3128',
                borderRadius: ci === 0 ? '12px 0 0 12px' : ci === cols.length - 1 ? '0 12px 12px 0' : 0,
                boxShadow: ci === 0 ? '4px 4px 10px #c5bfb6, -4px -4px 10px #f5ede4' : 'none',
                background: '#e0d9d0',
              }}>
                {c.render ? c.render(row) : row[c.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// Vehicle type registry (localStorage-backed, frontend-only)
const VehicleTypes = {
  TYPES:    { trottinettes: 'trottinette', velos: 'velo', scooters: 'scooter' },
  LABELS:   { trottinette: 'Trottinette', velo: 'Vélo', scooter: 'Scooter' },
  LABELS_KR:{ trottinette: 'Trotinet', velo: 'Vélo', scooter: 'Skoutèr' },
  ICONS:    { trottinette: '▷', velo: '◷', scooter: '◈' },
  get: (id) => localStorage.getItem(`zt_vtype_${id}`) || 'trottinette',
  set: (id, type) => localStorage.setItem(`zt_vtype_${id}`, type),
};

Object.assign(window, {
  useToast, ToastContainer, Sidebar,
  NCard, NInput, NSelect, BtnBlue, BtnGhost,
  PageHeader, SearchBar, BatteryBar, KpiCard,
  Spinner, ErrorMsg, NTable, VehicleTypes,
});
