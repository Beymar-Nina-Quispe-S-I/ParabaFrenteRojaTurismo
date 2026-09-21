import { useEffect, useState } from 'react'
import { sb } from '../lib/supabase'

export default function DesktopNavbar({ view, user, onOpenProfile, onLogout }) {
  const [clima, setClima] = useState({ temp: '--°C', desc: '—', code: 0 })
  const [alertasCount, setAlertasCount] = useState(0)
  const [userMenu, setUserMenu] = useState(false)

  useEffect(() => {
    function fetchClima(lat, lon) {
      fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=auto`
      )
        .then((r) => r.json())
        .then((d) => {
          if (!d.current_weather) return
          const w = d.current_weather
          const descMap = {
            0: 'Despejado',
            1: 'Parcialmente nublado',
            2: 'Parcialmente nublado',
            3: 'Nublado',
            45: 'Niebla',
            48: 'Niebla',
            51: 'Llovizna',
            55: 'Llovizna',
            61: 'Lluvia',
            65: 'Lluvia',
            71: 'Nieve',
            77: 'Nieve',
            80: 'Lluvia fuerte',
            82: 'Lluvia fuerte',
            95: 'Tormenta',
            99: 'Tormenta',
          }
          setClima({
            temp: `${Math.round(w.temperature)}°C`,
            desc: descMap[w.weathercode] || 'Variable',
            code: w.weathercode,
          })
        })
        .catch(() => {})
    }
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (p) => fetchClima(p.coords.latitude, p.coords.longitude),
        () => fetchClima(-17.7833, -63.1667),
        { enableHighAccuracy: true, timeout: 15000 }
      )
    } else {
      fetchClima(-17.7833, -63.1667)
    }

    sb.from('alertas')
      .select('id', { count: 'exact', head: true })
      .in('estado', ['activa'])
      .then(({ count }) => setAlertasCount(count || 0))
  }, [])

  const titles = {
    inicio: 'Inicio',
    mapa: 'Mapa de avistamientos',
    avistamientos: 'Avistamientos comunitarios',
    rutas: 'Rutas hacia hábitats',
  }

  return (
    <header className="desktop-navbar">
      <div className="dn-left">
        <h1 className="dn-title">{titles[view] || 'Ecos de Vuelo Rojo'}</h1>
        <span className="dn-subtitle">
          Conservación de la <em>Ara rubrogenys</em> · Bolivia
        </span>
      </div>

      <div className="dn-right">
        <div className="dn-chip" title={clima.desc}>
          <span className="dn-chip-icon">
            <ClimaIcon code={clima.code} />
          </span>
          <span className="dn-chip-text">
            <strong>{clima.temp}</strong>
            <small>{clima.desc}</small>
          </span>
        </div>

        <div className="dn-chip alert" title="Alertas activas">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <span className="dn-chip-count">{alertasCount}</span>
        </div>

        {user ? (
          <div className="dn-user-wrap">
            <button
              className="dn-user"
              onClick={() => setUserMenu((v) => !v)}
            >
              <div className="dn-user-avatar">
                {(user.nombre || user.usuario || 'U').charAt(0).toUpperCase()}
              </div>
              <span className="dn-user-name">
                {user.nombre || user.usuario}
              </span>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                width={14}
                height={14}
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>

            {userMenu && (
              <div
                className="dn-user-menu"
                onMouseLeave={() => setUserMenu(false)}
              >
                <button
                  onClick={() => {
                    onOpenProfile()
                    setUserMenu(false)
                  }}
                >
                  Mi perfil
                </button>
                <button
                  onClick={() => {
                    onLogout()
                    setUserMenu(false)
                  }}
                >
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        ) : (
          <button className="dn-login" onClick={onOpenProfile}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              width={16}
              height={16}
            >
              <path d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            Iniciar sesión
          </button>
        )}
      </div>
    </header>
  )
}

function ClimaIcon({ code }) {
  const cls = 'dn-clima-svg'
  if (code === 0) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cls}
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
      </svg>
    )
  }
  if (code >= 1 && code <= 3) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cls}
      >
        <circle cx="8" cy="8" r="3" />
        <path d="M8 3v1M8 12v1M3 8h1M12 8h1M4.2 4.2l.7.7M11.1 11.1l.7.7M4.2 11.8l.7-.7M11.1 4.9l.7-.7" />
        <path d="M7 18a4 4 0 018 0h2a3 3 0 100-6" opacity="0.9" />
      </svg>
    )
  }
  if (code >= 45 && code <= 48) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cls}
      >
        <path d="M3 12h18M3 16h18M3 8h18" />
      </svg>
    )
  }
  if (code >= 51 && code <= 67) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cls}
      >
        <path d="M7 15a4 4 0 118 0h2a3 3 0 100-6" />
        <path d="M8 19l-1 2M12 19l-1 2M16 19l-1 2" />
      </svg>
    )
  }
  if (code >= 71 && code <= 77) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cls}
      >
        <path d="M7 15a4 4 0 118 0h2a3 3 0 100-6" />
        <path d="M8 19h.01M12 19h.01M16 19h.01M10 21h.01M14 21h.01" />
      </svg>
    )
  }
  if (code >= 80) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cls}
      >
        <path d="M7 15a4 4 0 118 0h2a3 3 0 100-6" />
        <path d="M12 18l-2 4M16 18l-2 4" />
      </svg>
    )
  }
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cls}
    >
      <path d="M7 15a4 4 0 118 0h2a3 3 0 100-6" />
    </svg>
  )
}