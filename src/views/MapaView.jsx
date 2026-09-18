import { useCallback, useEffect, useState } from 'react'
import MapView from '../components/MapView'
import { sb } from '../lib/supabase'

export default function MapaView() {
  const [ubicaciones, setUbicaciones] = useState([])
  const [userPosition, setUserPosition] = useState(null)
  const [center, setCenter] = useState([-17.7833, -63.1667])
  const [zoom, setZoom] = useState(7)
  const [route, setRoute] = useState(null)
  const [routeInfo, setRouteInfo] = useState(null)
  const [mapHeaderLabel, setMapHeaderLabel] = useState('Mapa')

  useEffect(() => {
    async function cargar() {
      const { data } = await sb
        .from('ubicaciones')
        .select('*')
        .eq('activo', true)
        .order('fecha_avistamiento', { ascending: false })
      setUbicaciones(data || [])
    }
    cargar()
  }, [])

  const pedirUbicacion = useCallback(() => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        setUserPosition({ lat, lng })
        setCenter([lat, lng])
        setZoom(15)
      },
      () => alert('No se pudo acceder a la ubicación'),
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }, [])

  function verPuntos() {
    if (!ubicaciones.length) {
      alert('Aún no hay avistamientos con ubicación en el mapa')
      return
    }
    const lats = ubicaciones.map((u) => u.latitud)
    const lngs = ubicaciones.map((u) => u.longitud)
    setCenter([
      (Math.min(...lats) + Math.max(...lats)) / 2,
      (Math.min(...lngs) + Math.max(...lngs)) / 2,
    ])
    setZoom(9)
  }

  function trazarDesdePopup(lat, lng, nombre) {
    const origen = userPosition || { lat: -17.7833, lng: -63.1667 }
    setRoute({
      from: [origen.lat, origen.lng],
      to: [lat, lng],
    })
    setMapHeaderLabel('Ruta activa')
    setRouteInfo({ nombre, km: '...', min: '...' })
  }

  // Exponer trazarRuta para RutasView
  useEffect(() => {
    window.__trazarRuta = (lat, lng, nombre) => {
      trazarDesdePopup(lat, lng, nombre)
    }
    return () => {
      delete window.__trazarRuta
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userPosition])

  function cerrarRuta() {
    setRoute(null)
    setRouteInfo(null)
    setMapHeaderLabel('Mapa')
  }

  return (
    <div className="mobile-view active">
      <div className="mobile-map-container">
        <div className="mobile-map" style={{ width: '100%', height: '100%' }}>
          <MapView
            center={center}
            zoom={zoom}
            userPosition={userPosition}
            ubicaciones={ubicaciones}
            route={route}
            onRouteFound={(km, min) =>
              setRouteInfo((r) => (r ? { ...r, km, min } : r))
            }
            onRouteError={() => {
              alert('No se pudo calcular la ruta')
              setRoute(null)
              setRouteInfo(null)
            }}
            onTraceFromPopup={trazarDesdePopup}
          />
        </div>
      </div>

      <div
        className="mobile-header map-header"
        style={{ position: 'fixed', zIndex: 100 }}
      >
        <div className="mobile-header-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          <span>{mapHeaderLabel}</span>
        </div>
      </div>

      <div className={`route-info-card ${routeInfo ? 'active' : ''}`}>
        <div className="route-info-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
        </div>
        <div className="route-info-body">
          <strong>{routeInfo?.nombre || '—'}</strong>
          <span>
            {routeInfo ? `${routeInfo.km} km · aprox. ${routeInfo.min} min` : '—'}
          </span>
        </div>
        <button className="route-info-close" onClick={cerrarRuta}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="map-controls">
        <button className="map-control-btn primary" onClick={pedirUbicacion}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Mi ubicación
        </button>
        <button className="map-control-btn secondary" onClick={verPuntos}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3M3 16v3a2 2 0 002 2h3m11-5v3a2 2 0 01-2 2h-3" />
          </svg>
          Ver puntos
        </button>
      </div>
    </div>
  )
}