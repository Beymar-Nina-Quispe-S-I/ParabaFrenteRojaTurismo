import { useEffect, useState } from 'react'
import { sb } from '../lib/supabase'
import { reverseGeocode } from '../lib/geo'

export default function Modal({
  kind,
  user,
  onClose,
  onSwitch,
  onLogin,
  onRegister,
  onToast,
  onSpinner,
  onReload,
}) {
  const [ubicacionDetectada, setUbicacionDetectada] = useState(null)
  const [ubInfoVisible, setUbInfoVisible] = useState(false)

  const [loginU, setLoginU] = useState('')
  const [loginP, setLoginP] = useState('')
  const [regN, setRegN] = useState('')
  const [regE, setRegE] = useState('')
  const [regU, setRegU] = useState('')
  const [regP, setRegP] = useState('')

  const [avEspecie, setAvEspecie] = useState('Paraba Roja')
  const [avLugar, setAvLugar] = useState('')
  const [avCiudad, setAvCiudad] = useState('')
  const [avCantidad, setAvCantidad] = useState(1)
  const [avFecha, setAvFecha] = useState(new Date().toISOString().split('T')[0])
  const [avDesc, setAvDesc] = useState('')

  const [favoritos, setFavoritos] = useState(null)
  const [misAvist, setMisAvist] = useState(null)

  useEffect(() => {
    if (!kind) return
    setUbicacionDetectada(null)
    setUbInfoVisible(false)
    if (kind === 'favoritos' && user) cargarFavoritos()
    if (kind === 'misAvistamientos' && user) cargarMisAvist()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind, user])

  async function cargarFavoritos() {
    if (!user) return
    setFavoritos(null)
    const { data } = await sb
      .from('favoritos')
      .select('id,ubicaciones(id,nombre,latitud,longitud,ciudad,especie)')
      .eq('user_id', user.id)
    setFavoritos((data || []).filter((f) => f.ubicaciones))
  }

  async function cargarMisAvist() {
    if (!user) return
    setMisAvist(null)
    const { data } = await sb
      .from('avistamientos')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setMisAvist(data || [])
  }

  async function usarUbicacion() {
    if (!navigator.geolocation) {
      onToast('Geolocalización no disponible', 'error')
      return
    }
    onSpinner(true)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }
        setUbicacionDetectada(coords)
        const { lugar, ciudad } = await reverseGeocode(coords.lat, coords.lng)
        setAvLugar(lugar)
        setAvCiudad(ciudad)
        setUbInfoVisible(true)
        onSpinner(false)
        onToast('Ubicación detectada', 'success')
      },
      () => {
        onSpinner(false)
        onToast('No se pudo acceder a la ubicación', 'error')
        setUbicacionDetectada(null)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  async function submitLogin() {
    if (!loginU || !loginP) return onToast('Completa todos los campos', 'error')
    onSpinner(true)
    try {
      const u = await onLogin(loginU.trim(), loginP)
      onToast(`Bienvenido, ${u.nombre}!`, 'success')
      onClose()
    } catch (e) {
      onToast(e.message || 'Error al iniciar sesión', 'error')
    } finally {
      onSpinner(false)
    }
  }

  async function submitRegister() {
    if (!regN || !regE || !regU || !regP)
      return onToast('Completa todos los campos', 'error')
    if (regP.length < 6)
      return onToast('Contraseña mín. 6 caracteres', 'error')
    onSpinner(true)
    try {
      await onRegister(regN.trim(), regE.trim(), regU.trim(), regP)
      onToast('Cuenta creada! Ya puedes iniciar sesión', 'success')
      onSwitch('login')
    } catch (e) {
      onToast(e.message || 'Error al registrar', 'error')
    } finally {
      onSpinner(false)
    }
  }

  async function submitAvistamiento() {
    if (!user) return onToast('Inicia sesión primero', 'error')
    if (!avLugar && !avCiudad) return onToast('Indica lugar o ciudad', 'error')
    if (!avFecha) return onToast('Selecciona una fecha', 'error')

    onSpinner(true)
    const { error } = await sb.from('avistamientos').insert({
      user_id: user.id,
      especie: avEspecie,
      cantidad: avCantidad,
      lugar: avLugar || null,
      ciudad: avCiudad || null,
      descripcion: avDesc || null,
      fecha_avistamiento: avFecha,
    })

    if (error) {
      onSpinner(false)
      return onToast('Error: ' + error.message, 'error')
    }

    if (ubicacionDetectada) {
      await sb.from('ubicaciones').insert({
        nombre: avLugar || avCiudad || `Avistamiento de ${avEspecie}`,
        descripcion: avDesc || `Registrado por ${user.nombre || user.usuario}`,
        latitud: ubicacionDetectada.lat,
        longitud: ubicacionDetectada.lng,
        direccion: avLugar || null,
        ciudad: avCiudad || 'Bolivia',
        pais: 'Bolivia',
        tipo: 'avistamiento',
        estado: 'activo',
        especie: avEspecie,
        cantidad_avistada: avCantidad,
        fecha_avistamiento: avFecha,
        activo: true,
      })
    }

    onSpinner(false)
    onToast('Avistamiento registrado con éxito', 'success')
    onReload()
    onClose()
  }

  if (!kind) return null

  return (
    <div
      className="modal-overlay active"
      id="modalOverlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal">
        <div className="modal-handle" />

        {kind === 'login' && (
          <>
            <Header title="Iniciar Sesión" onClose={onClose} />
            <label className="field-label">Usuario o correo</label>
            <input
              value={loginU}
              onChange={(e) => setLoginU(e.target.value)}
              placeholder="usuario@correo.com"
            />
            <label className="field-label">Contraseña</label>
            <input
              type="password"
              value={loginP}
              onChange={(e) => setLoginP(e.target.value)}
              placeholder="••••••••"
            />
            <button className="btn-primary" onClick={submitLogin}>
              Ingresar
            </button>
            <p className="link">
              ¿No tienes cuenta?{' '}
              <a onClick={() => onSwitch('register')}>Registrarse</a>
            </p>
          </>
        )}

        {kind === 'register' && (
          <>
            <Header title="Crear Cuenta" onClose={onClose} />
            <label className="field-label">Nombre completo</label>
            <input
              value={regN}
              onChange={(e) => setRegN(e.target.value)}
              placeholder="Tu nombre"
            />
            <label className="field-label">Correo electrónico</label>
            <input
              type="email"
              value={regE}
              onChange={(e) => setRegE(e.target.value)}
              placeholder="tu@correo.com"
            />
            <label className="field-label">Usuario</label>
            <input
              value={regU}
              onChange={(e) => setRegU(e.target.value)}
              placeholder="nombre de usuario"
            />
            <label className="field-label">Contraseña</label>
            <input
              type="password"
              value={regP}
              onChange={(e) => setRegP(e.target.value)}
              placeholder="mín. 6 caracteres"
            />
            <button className="btn-primary" onClick={submitRegister}>
              Crear cuenta
            </button>
            <p className="link">
              ¿Ya tienes cuenta?{' '}
              <a onClick={() => onSwitch('login')}>Iniciar sesión</a>
            </p>
          </>
        )}

        {kind === 'favoritos' && (
          <>
            <Header title="Mis Favoritos" onClose={onClose} />
            {favoritos === null ? (
              <div className="skeleton-item">
                <div className="skeleton w60" />
                <div className="skeleton w40" />
              </div>
            ) : favoritos.length === 0 ? (
              <EmptyState text="No tienes favoritos todavía" />
            ) : (
              favoritos.map((f) => (
                <div
                  key={f.id}
                  style={{
                    padding: 14,
                    background: '#f9f8f6',
                    borderRadius: 12,
                    margin: '8px 0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <strong>{f.ubicaciones.nombre}</strong>
                    <br />
                    <small style={{ color: '#9a988f' }}>
                      {f.ubicaciones.ciudad || ''} ·{' '}
                      {f.ubicaciones.especie || 'Paraba Roja'}
                    </small>
                  </div>
                  <button
                    onClick={onClose}
                    style={{
                      padding: '9px 14px',
                      background: 'var(--teal)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 999,
                      cursor: 'pointer',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                    }}
                  >
                    Ir
                  </button>
                </div>
              ))
            )}
          </>
        )}

        {kind === 'misAvistamientos' && (
          <>
            <Header title="Mis Avistamientos" onClose={onClose} />
            {misAvist === null ? (
              <div className="skeleton-item">
                <div className="skeleton w60" />
                <div className="skeleton w40" />
              </div>
            ) : misAvist.length === 0 ? (
              <EmptyState text="No has registrado avistamientos todavía" />
            ) : (
              misAvist.map((a) => (
                <div key={a.id} className="mobile-avistamiento-item">
                  <div className="avistamiento-top">
                    <strong style={{ color: 'var(--accent)' }}>
                      {a.especie}
                    </strong>
                    <span className="avistamiento-date">
                      {new Date(
                        a.fecha_avistamiento || a.created_at
                      ).toLocaleDateString('es-BO', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="avistamiento-lugar">
                    {[a.lugar, a.ciudad].filter(Boolean).join(', ') ||
                      'Sin ubicación'}
                  </div>
                  <span className="badge-count">
                    {a.cantidad} {a.cantidad == 1 ? 'ave' : 'aves'}
                  </span>
                </div>
              ))
            )}
          </>
        )}

        {kind === 'registrarAvistamiento' && (
          <>
            <Header title="Registrar Avistamiento" onClose={onClose} />
            <label className="field-label">Especie</label>
            <select
              value={avEspecie}
              onChange={(e) => setAvEspecie(e.target.value)}
            >
              <option value="Paraba Roja">Paraba Roja (Ara rubrogenys)</option>
              <option value="Paraba Frente Roja">Paraba Frente Roja</option>
              <option value="Paraba Azul">Paraba Azul</option>
              <option value="Guacamayo Verde">Guacamayo Verde</option>
              <option value="Otra especie">Otra especie</option>
            </select>

            <button className="btn-secondary" onClick={usarUbicacion}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                width={16}
                height={16}
              >
                <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Usar ubicación actual
            </button>

            {ubInfoVisible && (
              <div className="ubicacion-info">
                ✅ Ubicación detectada correctamente
              </div>
            )}

            <label className="field-label">Lugar</label>
            <input
              value={avLugar}
              onChange={(e) => setAvLugar(e.target.value)}
              placeholder="Lugar del avistamiento"
            />
            <label className="field-label">Ciudad / Departamento</label>
            <input
              value={avCiudad}
              onChange={(e) => setAvCiudad(e.target.value)}
              placeholder="Ej. Cochabamba"
            />
            <label className="field-label">Cantidad de aves</label>
            <input
              type="number"
              min={1}
              value={avCantidad}
              onChange={(e) => setAvCantidad(parseInt(e.target.value) || 1)}
            />
            <label className="field-label">Fecha</label>
            <input
              type="date"
              value={avFecha}
              onChange={(e) => setAvFecha(e.target.value)}
            />
            <label className="field-label">Descripción (opcional)</label>
            <textarea
              rows={3}
              value={avDesc}
              onChange={(e) => setAvDesc(e.target.value)}
              placeholder="Detalles del avistamiento..."
            />
            <button className="btn-primary" onClick={submitAvistamiento}>
              Registrar avistamiento
            </button>
          </>
        )}
      </div>
    </div>
  )
}

function Header({ title, onClose }) {
  return (
    <div className="modal-header">
      <h2>{title}</h2>
      <button className="btn-close-modal" onClick={onClose}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}

function EmptyState({ text }) {
  return (
    <div className="empty-state">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
        <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
      <p>{text}</p>
    </div>
  )
}