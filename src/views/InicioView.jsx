import { useEffect, useRef, useState } from 'react'
import { sb } from '../lib/supabase'

const SLIDES = [
  {
    img: 'https://cdn.sanity.io/images/71jmx9y3/production/f535cedc31a2607ca5d44499f2f8c9a4c865d79a-2260x3243.jpg?auto=format&fit=max&q=75&rect=0,0,2260,1306&w=1130',
    eyebrow: 'Ara rubrogenys',
    title: 'Paraba Roja',
    desc: 'Especie endémica de Bolivia, en peligro crítico de extinción',
    cta: 'Explorar hábitat',
    view: 'mapa',
  },
  {
    img: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=800&auto=format&fit=crop',
    eyebrow: 'Conservación',
    title: 'Valles secos',
    desc: 'Ayúdanos a proteger su hábitat natural registrando lo que observas',
    cta: 'Ver avistamientos',
    view: 'avistamientos',
  },
  {
    img: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&auto=format&fit=crop',
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
    desc: 'Obteniendo ubicación...',
    icon: '☀️',
  })
  const [alertas, setAlertas] = useState(null)
  const startX = useRef(0)
  const timer = useRef(null)

  useEffect(() => {
    timer.current = setInterval(() => {
      setIndex((i) => (i + 1) % SLIDES.length)
    }, 5000)
    return () => clearInterval(timer.current)
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    async function cargarAlertas() {
      const { data } = await sb
        .from('alertas')
        .select('*')
        .in('estado', ['activa', 'resuelta'])
        .order('nivel', { ascending: false })
        .limit(10)
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
          const codes = {
            0: ['Despejado', '☀️'],
            1: ['Parcialmente nublado', '⛅'],
            2: ['Parcialmente nublado', '⛅'],
            3: ['Nublado', '☁️'],
            45: ['Niebla', '🌫️'],
            48: ['Niebla', '🌫️'],
            51: ['Llovizna', '🌦️'],
            55: ['Llovizna', '🌦️'],
            61: ['Lluvia', '🌧️'],
            65: ['Lluvia', '🌧️'],
            71: ['Nieve', '🌨️'],
            77: ['Nieve', '🌨️'],
            80: ['Lluvia fuerte', '⛈️'],
            82: ['Lluvia fuerte', '⛈️'],
            95: ['Tormenta', '⛈️'],
            99: ['Tormenta', '⛈️'],
          }
          const [desc, icon] = codes[w.weathercode] || ['Variable', '🌤️']
          setClima({ temp: `${Math.round(w.temperature)}°C`, desc, icon })
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
      5000
    )
  }

  return (
    <div className="mobile-view active">
      <div className="carousel-container">
        <div
          className="carousel-slides"
          style={{ transform: `translate3d(-${index * 100}%,0,0)` }}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {SLIDES.map((s, i) => (
            <div
              key={i}
              className="carousel-slide"
              style={{ backgroundImage: `url('${s.img}')` }}
            >
              <div className="carousel-content">
                <div className="eyebrow">{s.eyebrow}</div>
                <h2>{s.title}</h2>
                <p>{s.desc}</p>
                <button
                  className="btn-explore"
                  onClick={() => (s.view ? onNavigate(s.view) : onOpenProfile())}
                >
                  {s.cta}
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="carousel-dots">
          {SLIDES.map((_, i) => (
            <div
              key={i}
              className={`carousel-dot ${i === index ? 'active' : ''}`}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
      </div>

      <div className={`mobile-header ${scrolled ? 'scrolled' : ''}`}>
        <div className="mobile-header-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
          </svg>
          <span>Ecos de Vuelo Rojo</span>
        </div>
        <button className="mobile-header-btn" onClick={onOpenProfile}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </button>
      </div>

      <div className="mobile-card">
        <h3>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M12 3v18m0 0l-4-4m4 4l4-4M3 12h18" />
          </svg>
          Clima actual
        </h3>
        <div className="mobile-weather">
          <div className="mobile-weather-icon">{clima.icon}</div>
          <div className="mobile-weather-info">
            <div className="mobile-weather-temp">{clima.temp}</div>
            <div className="mobile-weather-desc">{clima.desc}</div>
          </div>
        </div>
      </div>

      <div className="quick-route-card" onClick={() => onNavigate('rutas')}>
        <div className="qr-text">
          <h4>Rutas hacia hábitats</h4>
          <p>Traza el camino a un punto de avistamiento</p>
        </div>
        <button aria-label="Ver rutas">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>

      <div className="mobile-card">
        <h3>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          Alertas ambientales
        </h3>
        <div>
          {alertas === null ? (
            <div className="skeleton-item">
              <div className="skeleton w60" />
              <div className="skeleton w80" />
            </div>
          ) : alertas.length === 0 ? (
            <div className="mobile-alert green">No hay alertas activas</div>
          ) : (
            alertas.map((a) => {
              let c = 'orange'
              if (a.nivel === 'alto' || a.nivel === 'critico') c = 'red'
              if (a.nivel === 'bajo') c = 'green'
              return (
                <div key={a.id} className={`mobile-alert ${c}`}>
                  <strong>{a.titulo}</strong>
                  <br />
                  <small>{(a.descripcion || '').substring(0, 60)}...</small>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}