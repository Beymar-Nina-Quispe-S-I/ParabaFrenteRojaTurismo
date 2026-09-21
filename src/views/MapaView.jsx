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

  const [panelOpen, setPanelOpen] = useState(false)
  const [filtro, setFiltro] = useState('todos')
  const [mapCoords, setMapCoords] = useState({
    lat: -18.11,
    lng: -64.88,
    zoom: 11,
  })

  const mapRef = useRef(null)

  // Cargar ubicación cacheada o pedirla una vez
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

  // Cargar ubicaciones + rutas comunitarias
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

  // Escuchar movimientos del mapa
  useEffect(() => {
    if (!mapRef.current) return
    const map = mapRef.current

    const onMove = () => {
      const c = map.getCenter()
      setMapCoords({
        lat: c.lat,
        lng: c.lng,
        zoom: Math.round(map.getZoom()),
      })
    }

    map.on('moveend', onMove)
    map.on('zoomend', onMove)
    onMove()

    return () => {
      map.off('moveend', onMove)
      map.off('zoomend', onMove)
    }
  }, [mapRef.current])

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
      setMapHeaderLabel(nombre || 'Ruta activa')
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

  function handleHideClick(item) {
    setSelectedHide(item)
  }

  function handleIrDirecto(item) {
    trazarRuta(item.latitud, item.longitud, item.nombre)
    if (mapRef.current) {
      mapRef.current.flyTo([item.latitud, item.longitud], 15, {
        duration: 1,
      })
    }
    setPanelOpen(false)
  }

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

  useEffect(() => {
    window.__volarA = (lat, lng, nombre) => {
      if (mapRef.current) {
        mapRef.current.flyTo([lat, lng], 16, { duration: 1.2 })
      }
      setMapHeaderLabel(nombre || 'Mapa')
    }
    window.__trazarRuta = (lat, lng, nombre) => trazarRuta(lat, lng, nombre)
    return () => {
      delete window.__volarA
      delete window.__trazarRuta
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userPosition])

  function cerrarRuta() {
    setRoute(null)
    setRouteInfo(null)
    setMapHeaderLabel('Mapa')
  }

  const routeKey = route
    ? `${route.from[0]},${route.from[1]}|${route.to[0]},${route.to[1]}`
    : ''
  const routeMemo = useMemo(() => route, [routeKey])

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

  if (selectedHide && selectedHide.tipo !== 'ruta') {
    const tramo = TRAMOS_RUTA.find((t) => t.hasta === selectedHide.id)
    if (tramo) estadoSeleccionado = tramo.estado
  }

  const listaPanel = useMemo(() => {
    const hides = (ubicaciones || []).map((h) => ({ ...h, tipo: 'hide' }))
    const rutas = (rutasComunidad || []).map((r) => ({ ...r, tipo: 'ruta' }))

    let all = []
    if (filtro === 'hides') all = hides
    else if (filtro === 'comunidad') all = rutas
    else all = [...hides, ...rutas]

    return all
      .map((i) => ({
        ...i,
        distKm: userPosition
          ? haversineKm(userPosition.lat, userPosition.lng, i.latitud, i.longitud)
          : null,
      }))
      .sort((a, b) => (a.distKm ?? 9999) - (b.distKm ?? 9999))
  }, [ubicaciones, rutasComunidad, filtro, userPosition])

  return (
    <div className="mobile-view active mapa-view">
      {/* ============ MAPA (solo el mapa dentro) ============ */}
      <div className="mapa-canvas">
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

      {/* ============ TODO LO DEMÁS FUERA DEL MAPA ============ */}

      {/* Header flotante */}
      <div className="mapa-header">
        <div className="mapa-header-inner">
          <div className="mapa-header-left">
            <span className="mapa-header-icon">
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
            <div className="mapa-header-text">
              <strong>{mapHeaderLabel}</strong>
              <span>
                {mapCoords.lat.toFixed(4)}, {mapCoords.lng.toFixed(4)} · z
                {mapCoords.zoom}
              </span>
            </div>
          </div>

          <button
            className="mapa-header-btn"
            onClick={() => setPanelOpen((v) => !v)}
            aria-label="Abrir panel"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Filtros */}
        <div className="mapa-filtros">
          <button
            className={`mapa-chip ${filtro === 'todos' ? 'active' : ''}`}
            onClick={() => setFiltro('todos')}
          >
            Todos
            <span className="mapa-chip-count">
              {ubicaciones.length + rutasComunidad.length}
            </span>
          </button>
          <button
            className={`mapa-chip ${filtro === 'hides' ? 'active' : ''}`}
            onClick={() => setFiltro('hides')}
          >
            Hides
            <span className="mapa-chip-count">{ubicaciones.length}</span>
          </button>
          <button
            className={`mapa-chip ${filtro === 'comunidad' ? 'active' : ''}`}
            onClick={() => setFiltro('comunidad')}
          >
            Comunidad
            <span className="mapa-chip-count">{rutasComunidad.length}</span>
          </button>
        </div>
      </div>

      {/* Aviso de estados */}
      {!routeInfo && (
        <div className="mapa-estados">
          <div className="mapa-estado">
            <span className="mapa-estado-dot ok" />
            Transitable
          </div>
          <div className="mapa-estado">
            <span className="mapa-estado-dot barro" />
            Barro
          </div>
          <div className="mapa-estado">
            <span className="mapa-estado-dot bloqueado" />
            Bloqueado
          </div>
        </div>
      )}

      {/* Ruta activa */}
      <div className={`mapa-ruta-card ${routeInfo ? 'active' : ''}`}>
        <div className="mapa-ruta-icon">
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
        </div>
        <div className="mapa-ruta-body">
          <strong>{routeInfo?.nombre || '—'}</strong>
          <span>
            {routeInfo && routeInfo.km !== '...'
              ? `${routeInfo.km} km · aprox. ${routeInfo.min} min`
              : 'Calculando…'}
          </span>
        </div>
        <button
          className="mapa-ruta-close"
          onClick={cerrarRuta}
          aria-label="Cerrar ruta"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.4}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* FABs */}
      <div className="mapa-fabs">
        <button
          className="mapa-fab"
          onClick={pedirUbicacion}
          aria-label="Mi ubicación"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v3M12 19v3M2 12h3M19 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" />
          </svg>
        </button>

        <button
          className="mapa-fab"
          onClick={verMapaGuia}
          aria-label="Ver todo"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 8V6a2 2 0 012-2h2M4 16v2a2 2 0 002 2h2M16 4h2a2 2 0 012 2v2M16 20h2a2 2 0 002-2v-2" />
          </svg>
        </button>
      </div>

      {/* Panel deslizable */}
      <div
        className={`mapa-panel-overlay ${panelOpen ? 'active' : ''}`}
        onClick={() => setPanelOpen(false)}
      />
      <aside className={`mapa-panel ${panelOpen ? 'active' : ''}`}>
        <div className="mapa-panel-handle" />

        <div className="mapa-panel-header">
          <div>
            <h3>Puntos cercanos</h3>
            <span>
              {listaPanel.length} punto{listaPanel.length !== 1 ? 's' : ''}
            </span>
          </div>
          <button
            className="mapa-panel-close"
            onClick={() => setPanelOpen(false)}
            aria-label="Cerrar panel"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.4}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mapa-panel-list">
          {listaPanel.length === 0 ? (
            <div className="mapa-panel-empty">
              <p>No hay puntos con este filtro</p>
            </div>
          ) : (
            listaPanel.map((item) => (
              <button
                key={`${item.tipo}-${item.id}`}
                className={`mapa-panel-item ${item.tipo}`}
                onClick={() => {
                  if (mapRef.current) {
                    mapRef.current.flyTo(
                      [item.latitud, item.longitud],
                      16,
                      { duration: 1 }
                    )
                  }
                  setPanelOpen(false)
                }}
              >
                <div className="mapa-panel-item-thumb">
                  <div
                    className="mapa-panel-item-img"
                    style={{
                      backgroundImage:
                        item.imagen_url || item.imagen
                          ? `url('${item.imagen_url || item.imagen}')`
                          : undefined,
                    }}
                  />
                  <span className={`mapa-panel-item-badge ${item.tipo}`}>
                    {item.tipo === 'hide' ? 'H' : 'C'}
                  </span>
                </div>

                <div className="mapa-panel-item-info">
                  <strong>{item.nombre}</strong>
                  <span>
                    {item.descripcion || item.ciudad || 'Sin descripción'}
                  </span>
                  {item.distKm !== null && item.distKm !== undefined && (
                    <span className="mapa-panel-item-dist">
                      {item.distKm < 1
                        ? `${Math.round(item.distKm * 1000)} m`
                        : `${item.distKm.toFixed(1)} km`}{' '}
                      de distancia
                    </span>
                  )}
                </div>

                <svg
                  className="mapa-panel-item-arrow"
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
            ))
          )}
        </div>
      </aside>

      {/* Modal detalle */}
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