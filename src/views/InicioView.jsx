import { useEffect, useRef, useState } from 'react'
import { sb } from '../lib/supabase'
import '../styles/inicio.css'
const SLIDES = [
  {
    img: 'https://cdn.sanity.io/images/71jmx9y3/production/f535cedc31a2607ca5d44499f2f8c9a4c865d79a-2260x3243.jpg?auto=format&fit=max&q=70&rect=0,0,2260,1306&w=800',
    eyebrow: 'Ara rubrogenys',
    title: 'Paraba Roja',
    desc: 'Especie endémica de Bolivia, en peligro crítico de extinción',
    cta: 'Explorar hábitat',
    view: 'mapa',
  },
  {
    img: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=800&auto=format&fit=crop&q=70',
    eyebrow: 'Conservación',
    title: 'Valles secos',
    desc: 'Ayúdanos a proteger su hábitat natural registrando lo que observas',
    cta: 'Ver avistamientos',
    view: 'avistamientos',
  },
  {
    img: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&auto=format&fit=crop&q=70',
    eyebrow: 'Comunidad',
    title: 'Red de observadores',
    desc: 'Únete a la red que protege y documenta a la paraba roja',
    cta: 'Mi perfil',
    view: null,
  },
]

export default function InicioView({ onNavigate, onOpenProfile }) {
  const [index, setIndex] = useState(0)
  const [scrolled, setScrolled] = useState(false)
  const [clima, setClima] = useState({
    temp: '--°C',
    desc: 'Obteniendo…',
    code: 0,
    ciudad: 'Bolivia',
  })
  const [alertas, setAlertas] = useState(null)
  const [typedText, setTypedText] = useState('')
  const startX = useRef(0)
  const timer = useRef(null)
  const typeTimer = useRef(null)

  // Carrusel automático
  useEffect(() => {
    timer.current = setInterval(() => {
      setIndex((i) => (i + 1) % SLIDES.length)
    }, 7000)
    return () => clearInterval(timer.current)
  }, [])

  // Efecto máquina de escribir
  useEffect(() => {
    const fullText = SLIDES[index].title
    let i = 0
    setTypedText('')

    if (typeTimer.current) clearInterval(typeTimer.current)

    const delay = setTimeout(() => {
      typeTimer.current = setInterval(() => {
        if (i < fullText.length) {
          setTypedText(fullText.slice(0, i + 1))
          i++
        } else {
          clearInterval(typeTimer.current)
        }
      }, 70)
    }, 350)

    return () => {
      clearTimeout(delay)
      if (typeTimer.current) clearInterval(typeTimer.current)
    }
  }, [index])

  // Header scrolled
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Alertas + clima
  useEffect(() => {
    async function cargarAlertas() {
      const { data } = await sb
        .from('alertas')
        .select('*')
        .in('estado', ['activa', 'resuelta'])
        .order('nivel', { ascending: false })
        .limit(6)
      setAlertas(data || [])
    }
    cargarAlertas()

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
            ciudad: 'Tu ubicación',
          })
        })
        .catch(() => {})
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchClima(pos.coords.latitude, pos.coords.longitude),
        () => fetchClima(-17.7833, -63.1667),
        { enableHighAccuracy: true, timeout: 15000 }
      )
    } else {
      fetchClima(-17.7833, -63.1667)
    }
  }, [])

  function onTouchStart(e) {
    startX.current = e.changedTouches[0].screenX
    if (timer.current) clearInterval(timer.current)
  }
  function onTouchEnd(e) {
    const diff = startX.current - e.changedTouches[0].screenX
    if (Math.abs(diff) > 50) {
      setIndex((i) =>
        diff > 0
          ? (i + 1) % SLIDES.length
          : (i - 1 + SLIDES.length) % SLIDES.length
      )
    }
    timer.current = setInterval(
      () => setIndex((i) => (i + 1) % SLIDES.length),
      7000
    )
  }

  const activeSlide = SLIDES[index]

  return (
    <div className="mobile-view active inicio-view">
      {/* HERO 100% */}
      <section className="inicio-hero">
        <div
          className="inicio-hero-bg"
          style={{ backgroundImage: `url('${activeSlide.img}')` }}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <div className="inicio-hero-overlay" />

          <div className="inicio-hero-content">
            <span className="inicio-hero-eyebrow">
              <span className="inicio-hero-eyebrow-dot" />
              {activeSlide.eyebrow}
            </span>

            <h1 className="inicio-hero-title">
              <span className="inicio-hero-typed">{typedText}</span>
              <span className="inicio-hero-cursor" aria-hidden="true" />
            </h1>

            <p className="inicio-hero-desc">{activeSlide.desc}</p>

            <button
              className="inicio-hero-btn"
              onClick={() =>
                activeSlide.view
                  ? onNavigate(activeSlide.view)
                  : onOpenProfile()
              }
            >
              <span>{activeSlide.cta}</span>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.4}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </button>
          </div>

          <div className="inicio-hero-dots">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                className={`inicio-hero-dot-btn ${
                  i === index ? 'active' : ''
                }`}
                onClick={() => setIndex(i)}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Header flotante */}
        <header className={`inicio-header ${scrolled ? 'scrolled' : ''}`}>
          <div className="inicio-header-brand">
            <div className="inicio-header-logo">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
            </div>
            <div className="inicio-header-text">
              <strong>Ecos de Vuelo Rojo</strong>
              <span>Paraba Roja · Bolivia</span>
            </div>
          </div>

          <button
            className="inicio-header-avatar"
            onClick={onOpenProfile}
            aria-label="Perfil"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </button>
        </header>
      </section>

      {/* HOY EN EL VALLE */}
      <section className="inicio-section">
        <div className="inicio-section-title">
          <h2>Hoy en el valle</h2>
          <span className="inicio-section-sub">Información en tiempo real</span>
        </div>

        <div className="inicio-grid-2">
          {/* Clima */}
          <div className="inicio-card clima-card">
            <div className="inicio-card-head">
              <span className="inicio-card-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                </svg>
              </span>
              <span className="inicio-card-label">Clima</span>
            </div>

            <div className="clima-body">
              <ClimaIcon code={clima.code} />
              <div className="clima-info">
                <strong className="clima-temp">{clima.temp}</strong>
                <span className="clima-desc">{clima.desc}</span>
              </div>
            </div>

            <span className="inicio-card-foot">{clima.ciudad}</span>
          </div>

          {/* Alertas */}
          <div className="inicio-card alertas-card">
            <div className="inicio-card-head">
              <span className="inicio-card-icon alert">
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
              </span>
              <span className="inicio-card-label">Alertas</span>
            </div>

            <div className="alertas-body">
              {alertas === null ? (
                <span className="alertas-skeleton" />
              ) : alertas.length === 0 ? (
                <div className="alertas-empty">Todo tranquilo</div>
              ) : (
                <div className="alertas-count">
                  <strong>{alertas.length}</strong>
                  <span>activa{alertas.length > 1 ? 's' : ''}</span>
                </div>
              )}
            </div>

            <span className="inicio-card-foot">Últimas 24 h</span>
          </div>
        </div>
      </section>

      {/* ACCIONES RÁPIDAS */}
      <section className="inicio-section">
        <div className="inicio-section-title">
          <h2>Acciones rápidas</h2>
          <span className="inicio-section-sub">Lo más usado</span>
        </div>

        <div className="inicio-acciones">
          <button
            className="inicio-accion"
            onClick={() => onNavigate('mapa')}
          >
            <span className="inicio-accion-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </span>
            <span className="inicio-accion-text">
              <strong>Mapa de hides</strong>
              <span>Explora puntos de observación</span>
            </span>
            <svg
              className="inicio-accion-arrow"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.4}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>

          <button
            className="inicio-accion"
            onClick={() => onNavigate('rutas')}
          >
            <span className="inicio-accion-icon ruta">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="6" cy="19" r="2.4" />
                <circle cx="18" cy="5" r="2.4" />
                <path d="M8.4 19h7.6a3.2 3.2 0 000-6.4H8a3.2 3.2 0 010-6.4h7.6" />
              </svg>
            </span>
            <span className="inicio-accion-text">
              <strong>Rutas y hides</strong>
              <span>Traza caminos y registra puntos</span>
            </span>
            <svg
              className="inicio-accion-arrow"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.4}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>

          <button
            className="inicio-accion"
            onClick={() => onNavigate('avistamientos')}
          >
            <span className="inicio-accion-icon avist">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 17l6-6 4 4 8-8m0 0v7m0-7h-7" />
              </svg>
            </span>
            <span className="inicio-accion-text">
              <strong>Avistamientos</strong>
              <span>Registros de la comunidad</span>
            </span>
            <svg
              className="inicio-accion-arrow"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.4}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      </section>
    </div>
  )
}

function ClimaIcon({ code }) {
  const cls = 'clima-svg'
  if (code === 0) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={cls}>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
      </svg>
    )
  }
  if (code >= 1 && code <= 3) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={cls}>
        <circle cx="8" cy="8" r="3" />
        <path d="M8 3v1M8 12v1M3 8h1M12 8h1M4.2 4.2l.7.7M11.1 11.1l.7.7M4.2 11.8l.7-.7M11.1 4.9l.7-.7" />
        <path d="M7 18a4 4 0 018 0h2a3 3 0 100-6" opacity="0.9" />
      </svg>
    )
  }
  if (code >= 45 && code <= 48) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={cls}>
        <path d="M3 12h18M3 16h18M3 8h18" />
      </svg>
    )
  }
  if (code >= 51 && code <= 67) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={cls}>
        <path d="M7 15a4 4 0 118 0h2a3 3 0 100-6" />
        <path d="M8 19l-1 2M12 19l-1 2M16 19l-1 2" />
      </svg>
    )
  }
  if (code >= 71 && code <= 77) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={cls}>
        <path d="M7 15a4 4 0 118 0h2a3 3 0 100-6" />
        <path d="M8 19h.01M12 19h.01M16 19h.01M10 21h.01M14 21h.01" />
      </svg>
    )
  }
  if (code >= 80) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={cls}>
        <path d="M7 15a4 4 0 118 0h2a3 3 0 100-6" />
        <path d="M12 18l-2 4M16 18l-2 4" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={cls}>
      <path d="M7 15a4 4 0 118 0h2a3 3 0 100-6" />
    </svg>
  )
}