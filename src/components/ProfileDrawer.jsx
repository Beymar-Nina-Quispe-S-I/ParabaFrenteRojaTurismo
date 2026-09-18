export default function ProfileDrawer({
  open,
  user,
  onClose,
  onNav,
  onOpenModal,
  onLogout,
}) {
  return (
    <>
      <div
        className={`profile-drawer-overlay ${open ? 'active' : ''}`}
        onClick={onClose}
      />
      <aside className={`profile-drawer ${open ? 'active' : ''}`}>
        <button className="profile-drawer-close" onClick={onClose}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="profile-drawer-header">
          {user ? (
            <>
              <div className="profile-drawer-avatar">
                {(user.nombre || user.usuario || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="profile-drawer-name">
                {user.nombre || user.usuario}
              </div>
              <div className="profile-drawer-email">{user.email}</div>
            </>
          ) : (
            <>
              <div
                className="profile-drawer-avatar"
                style={{ background: '#4a4a63' }}
              >
                👤
              </div>
              <div className="profile-drawer-name">Invitado</div>
              <div className="profile-drawer-email">
                Inicia sesión para más funciones
              </div>
            </>
          )}
        </div>

        <div className="profile-drawer-body">
          {user ? (
            <>
              <Item
                icon={<PathAvist />}
                label="Mis Avistamientos"
                onClick={() => {
                  onClose()
                  onOpenModal('misAvistamientos')
                }}
              />
              <Item
                icon={<PathRuta />}
                label="Rutas"
                onClick={() => {
                  onClose()
                  onNav('rutas')
                }}
              />
              <Item
                icon={<PathStar />}
                label="Mis Favoritos"
                onClick={() => {
                  onClose()
                  onOpenModal('favoritos')
                }}
              />
              <div className="profile-drawer-divider" />
              <Item
                icon={<PathLogout />}
                label="Cerrar Sesión"
                color="#C0392B"
                onClick={() => {
                  onClose()
                  onLogout()
                }}
              />
            </>
          ) : (
            <>
              <Item
                icon={<PathLogin />}
                label="Iniciar Sesión"
                onClick={() => {
                  onClose()
                  onOpenModal('login')
                }}
              />
              <Item
                icon={<PathRegister />}
                label="Crear Cuenta"
                onClick={() => {
                  onClose()
                  onOpenModal('register')
                }}
              />
              <div className="profile-drawer-divider" />
              <Item
                icon={<PathRuta />}
                label="Rutas"
                onClick={() => {
                  onClose()
                  onNav('rutas')
                }}
              />
            </>
          )}
        </div>
      </aside>
    </>
  )
}

function Item({ icon, label, onClick, color }) {
  return (
    <div
      className="profile-drawer-item"
      style={color ? { color } : undefined}
      onClick={onClick}
    >
      {icon}
      {label}
    </div>
  )
}

const PathAvist = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M3 17l6-6 4 4 8-8m0 0v7m0-7h-7" />
  </svg>
)
const PathRuta = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <circle cx="6" cy="19" r="2.4" />
    <circle cx="18" cy="5" r="2.4" />
    <path d="M8.4 19h7.6a3.2 3.2 0 000-6.4H8a3.2 3.2 0 010-6.4h7.6" />
  </svg>
)
const PathStar = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
)
const PathLogout = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
)
const PathLogin = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
  </svg>
)
const PathRegister = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
  </svg>
)