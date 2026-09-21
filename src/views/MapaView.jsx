import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import L from 'leaflet'
import MapView from '../components/MapView'
import HideDetailModal from '../components/HideDetailModal'
import { sb } from '../lib/supabase'
import { HIDES_INICIALES, TRAMOS_RUTA } from '../data/hides'
import { haversineKm } from '../lib/geo'

export default function MapaView() {
  const [ubicaciones, setUbicaciones] = useState(HIDES_INICIALES)
  const [rutasComunidad, setRutasComunidad] = useState([])
  const [userPosition, setUserPosition] = useState(null)
  const [center, setCenter] = useState([-18.11, -64.88])
  const [zoom, setZoom] = useState(11)
  const [route, setRoute] = useState(null)
  const [routeInfo, setRouteInfo] = useState(null)
  const [mapHeaderLabel, setMapHeaderLabel] = useState('Mapa')

  const [selectedHide, setSelectedHide] = useState(null)

  const mapRef = useRef(null)

  // ----------------------------------------------------------
  // Cargar ubicación cacheada o pedirla una vez
  // ----------------------------------------------------------
  useEffect(() => {
    try {
      const cached = sessionStorage.getItem('userPosition')
      if (cached) {
        const { lat, lng, ts } = JSON.parse(cached)
        if (Date.now() - ts < 5 * 60 * 1000) {
          setUserPosition({ lat, lng })
          return
        }
      }
    } catch {
      /* ignore */
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude
          const lng = pos.coords.longitude
          setUserPosition({ lat, lng })
          try {
            sessionStorage.setItem(
              'userPosition',
              JSON.stringify({ lat, lng, ts: Date.now() })
            )
          } catch {
            /* ignore */
          }
        },
        () => {},
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
      )
    }
  }, [])

  // ----------------------------------------------------------
  // Cargar ubicaciones + rutas comunitarias desde Supabase
  // ----------------------------------------------------------
  useEffect(() => {
    async function cargar() {
      try {
        const { data: ubic } = await sb
          .from('ubicaciones')
          .select('*')
          .eq('activo', true)
          .order('fecha_avistamiento', { ascending: false })

        const extra = (ubic || []).filter(
          (u) =>
            !HIDES_INICIALES.some(
              (h) =>
                Math.abs(h.latitud - u.latitud) < 0.00001 &&
                Math.abs(h.longitud - u.longitud) < 0.00001
            )
        )
        setUbicaciones([...HIDES_INICIALES, ...extra])

        const { data: rutas } = await sb
          .from('rutas')
          .select('*')
          .eq('activo', true)
          .order('created_at', { ascending: false })
        setRutasComunidad(rutas || [])
      } catch {
        /* silencioso */
      }
    }
    cargar()
  }, [])

  // ----------------------------------------------------------
  // Botón "Mi ubicación"
  // ----------------------------------------------------------
  const pedirUbicacion = useCallback(() => {
    if (!navigator.geolocation) {
      alert('Geolocalización no disponible')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        try {
          sessionStorage.setItem(
            'userPosition',
            JSON.stringify({ lat, lng, ts: Date.now() })
          )
        } catch {
          /* ignore */
        }
        setUserPosition({ lat, lng })
        if (mapRef.current) {
          mapRef.current.flyTo([lat, lng], 15, { duration: 1.2 })
        }
      },
      () => alert('No se pudo acceder a la ubicación'),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    )
  }, [])

  // ----------------------------------------------------------
  // Ver mapa guía
  // ----------------------------------------------------------
  function verMapaGuia() {
    const lista = [...ubicaciones, ...rutasComunidad]
    if (!lista.length) return
    if (mapRef.current) {
      const coords = lista.map((u) => [u.latitud, u.longitud])
      if (coords.length === 1) {
        mapRef.current.flyTo(coords[0], 14, { duration: 1.4 })
      } else {
        const bounds = L.latLngBounds(coords)
        mapRef.current.flyToBounds(bounds.pad(0.18), {
          duration: 1.4,
          maxZoom: 14,
        })
      }
    }
  }

  // ----------------------------------------------------------
  // Trazar ruta (sin mover la ubicación del usuario)
  // ----------------------------------------------------------
  function trazarRuta(lat, lng, nombre) {
    const run = (origen) => {
      setRoute((prev) => {
        if (
          prev &&
          prev.to[0] === lat &&
          prev.to[1] === lng &&
          prev.from[0] === origen.lat &&
          prev.from[1] === origen.lng
        ) {
          return prev
        }
        return { from: [origen.lat, origen.lng], to: [lat, lng] }
      })
      setMapHeaderLabel('Ruta activa')
      setRouteInfo((prev) => {
        if (prev && prev.nombre === nombre) return prev
        return { nombre, km: '...', min: '...' }
      })
    }

    if (userPosition) {
      run(userPosition)
      return
    }

    if (!navigator.geolocation) {
      alert('Geolocalización no disponible. No se puede trazar la ruta.')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const real = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        try {
          sessionStorage.setItem(
            'userPosition',
            JSON.stringify({ ...real, ts: Date.now() })
          )
        } catch {
          /* ignore */
        }
        setUserPosition(real)
        run(real)
      },
      () => {
        alert('Activa tu ubicación para trazar la ruta')
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    )
  }

  // ----------------------------------------------------------
  // Callbacks estables
  // ----------------------------------------------------------
  const handleRouteFound = useCallback((km, min) => {
    setRouteInfo((r) => (r ? { ...r, km, min } : r))
  }, [])

  const handleRouteError = useCallback(() => {
    alert('No se pudo calcular la ruta')
    setRoute(null)
    setRouteInfo(null)
  }, [])

  const handleMapReady = useCallback((map) => {
    mapRef.current = map
  }, [])

  // ----------------------------------------------------------
  // Click en un hide → abre el modal de detalle
  // ----------------------------------------------------------
  function handleHideClick(hide) {
    setSelectedHide(hide)
  }

  // ----------------------------------------------------------
  // Botón "Recorrer" del popup chiquito
  // ----------------------------------------------------------
  function handleIrDirecto(hide) {
    trazarRuta(hide.latitud, hide.longitud, hide.nombre)
    if (mapRef.current) {
      mapRef.current.flyTo([hide.latitud, hide.longitud], 15, {
        duration: 1,
      })
    }
  }

  // ----------------------------------------------------------
  // Botón "Recorrer" del modal grande
  // ----------------------------------------------------------
  function handleRecorrer() {
    if (!selectedHide) return
    trazarRuta(selectedHide.latitud, selectedHide.longitud, selectedHide.nombre)
    if (mapRef.current) {
      mapRef.current.flyTo(
        [selectedHide.latitud, selectedHide.longitud],
        15,
        { duration: 1 }
      )
    }
    setSelectedHide(null)
  }

  // ----------------------------------------------------------
  // Exponer para RutasView
  // ----------------------------------------------------------
  useEffect(() => {
    window.__trazarRuta = (lat, lng, nombre) => trazarRuta(lat, lng, nombre)
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

  // ----------------------------------------------------------
  // Memo de route
  // ----------------------------------------------------------
  const routeKey = route
    ? `${route.from[0]},${route.from[1]}|${route.to[0]},${route.to[1]}`
    : ''
  const routeMemo = useMemo(() => route, [routeKey])

  // ----------------------------------------------------------
  // Distancia + estado del hide seleccionado
  // ----------------------------------------------------------
  let distanciaSeleccionada = null
  let estadoSeleccionado = 'ok'

  if (selectedHide && userPosition) {
    distanciaSeleccionada = haversineKm(
      userPosition.lat,
      userPosition.lng,
      selectedHide.latitud,
      selectedHide.longitud
    )
  }

  if (selectedHide) {
    const tramo = TRAMOS_RUTA.find((t) => t.hasta === selectedHide.id)
    if (tramo) estadoSeleccionado = tramo.estado
  }

  // ----------------------------------------------------------
  // Render
  // ----------------------------------------------------------
  return (
    <div className="mobile-view active">
      <div className="mobile-map-container">
        <div className="mobile-map" style={{ width: '100%', height: '100%' }}>
          <MapView
            center={center}
            zoom={zoom}
            userPosition={userPosition}
            ubicaciones={ubicaciones}
            rutasComunidad={rutasComunidad}
            route={routeMemo}
            onRouteFound={handleRouteFound}
            onRouteError={handleRouteError}
            onHideClick={handleHideClick}
            onIrDirecto={handleIrDirecto}
            onMapReady={handleMapReady}
          />
        </div>
      </div>

      {/* Header */}
      <div
        className="mobile-header map-header"
        style={{ position: 'fixed', zIndex: 100 }}
      >
        <div className="mobile-header-title">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          <span>{mapHeaderLabel}</span>
        </div>
      </div>

      {/* Aviso de estados arriba */}
      <div className="ruta-aviso">
        <div className="ruta-aviso-item">
          <span className="ruta-aviso-dot ok" />
          <span>Transitable</span>
        </div>
        <div className="ruta-aviso-item">
          <span className="ruta-aviso-dot barro" />
          <span>Barro</span>
        </div>
        <div className="ruta-aviso-item">
          <span className="ruta-aviso-dot bloqueado" />
          <span>Bloqueado</span>
        </div>
      </div>

      {/* Ruta activa */}
      <div className={`route-info-card ${routeInfo ? 'active' : ''}`}>
        <div className="route-info-icon">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
        </div>
        <div className="route-info-body">
          <strong>{routeInfo?.nombre || '—'}</strong>
          <span>
            {routeInfo && routeInfo.km !== '...'
              ? `${routeInfo.km} km · aprox. ${routeInfo.min} min`
              : 'Calculando…'}
          </span>
        </div>
        <button
          className="route-info-close"
          onClick={cerrarRuta}
          aria-label="Cerrar ruta"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Controles */}
      <div className="map-controls">
        <button className="map-control-btn primary" onClick={pedirUbicacion}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Mi ubicación
        </button>
        <button className="map-control-btn secondary" onClick={verMapaGuia}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          Ver mapa guía
        </button>
      </div>

      <HideDetailModal
        hide={selectedHide}
        estadoTramo={estadoSeleccionado}
        distanciaKm={distanciaSeleccionada}
        onClose={() => setSelectedHide(null)}
        onIr={handleRecorrer}
      />
    </div>
  )
}