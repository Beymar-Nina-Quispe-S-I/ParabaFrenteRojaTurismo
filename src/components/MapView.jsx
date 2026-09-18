import { useEffect, useMemo } from 'react'
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  Tooltip,
  useMap,
} from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import RoutingMachine from './RoutingMachine'
import { fixLeafletDefaultIcon, iconoUsuario, haversineKm } from '../lib/geo'
import { HIDES_INICIALES, TRAMOS_RUTA, ESTADOS_RUTA } from '../data/hides'

fixLeafletDefaultIcon()

// ------------------------------------------------------------
// Marcador tipo bandera
// ------------------------------------------------------------
function iconoHide(nombre, estadoTramo = 'ok') {
  const color =
    estadoTramo === 'bloqueado'
      ? '#ef4444'
      : estadoTramo === 'barro'
      ? '#f59e0b'
      : '#22c55e'

  return L.divIcon({
    className: '',
    html: `
      <div class="hide-pin">
        <div class="hide-pin-head" style="background:${color}">
          <svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
            <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
        </div>
        <div class="hide-pin-tip" style="border-top-color:${color}"></div>
        <div class="hide-pin-label">${nombre}</div>
      </div>
    `,
    iconSize: [46, 66],
    iconAnchor: [23, 66],
    popupAnchor: [0, -58],
  })
}

// ------------------------------------------------------------
// Curva realista tipo sendero
// ------------------------------------------------------------
function generarCurva(desde, hasta, tramoId = '') {
  const [lat1, lng1] = desde
  const [lat2, lng2] = hasta
  const pasos = 24 // más puntos = curva más suave

  const dx = lng2 - lng1
  const dy = lat2 - lat1
  const len = Math.sqrt(dx * dx + dy * dy) || 1
  const perpX = -dy / len
  const perpY = dx / len

  // Semilla por tramo para que cada uno tenga forma única
  const seed = tramoId.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const seedA = ((seed % 7) - 3) / 10 // -0.3 a 0.3
  const seedB = (((seed * 3) % 5) - 2) / 15

  const curva = []

  for (let i = 0; i <= pasos; i++) {
    const t = i / pasos

    // Interpolación base (línea recta)
    const baseLat = lat1 + (lat2 - lat1) * t
    const baseLng = lng1 + (lng2 - lng1) * t

    // Curva doble senoidal (más orgánica)
    const curva1 = Math.sin(t * Math.PI) // pico al centro
    const curva2 = Math.sin(t * Math.PI * 2) * 0.3 // ondulación extra

    // Amplitud de la desviación
    const amplitud = (0.15 + Math.abs(seedA) * 0.1) * len
    const offset = (curva1 * 0.85 + curva2) * amplitud

    // Aplicar desviación perpendicular + ligera variación con la semilla
    const noise = Math.sin(t * 8 + seed) * len * 0.005

    curva.push([
      baseLat + perpY * offset + noise * 0.5,
      baseLng + perpX * offset + noise,
    ])
  }

  return curva
}

// ------------------------------------------------------------
// Helpers Leaflet
// ------------------------------------------------------------
function FitToHides({ hideCoords, padding = 0.25 }) {
  const map = useMap()
  useEffect(() => {
    if (!hideCoords || hideCoords.length === 0) return
    if (hideCoords.length === 1) {
      map.setView(hideCoords[0], 14, { animate: false })
      return
    }
    const bounds = L.latLngBounds(hideCoords)
    map.fitBounds(bounds.pad(padding), { animate: false })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map])
  return null
}

function InvalidateOnMount() {
  const map = useMap()
  useEffect(() => {
    const t1 = setTimeout(() => map.invalidateSize(), 120)
    const t2 = setTimeout(() => map.invalidateSize(), 400)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [map])
  return null
}

function ResizeObserverLeaflet() {
  const map = useMap()
  useEffect(() => {
    const container = map.getContainer()
    const ro = new ResizeObserver(() => map.invalidateSize())
    ro.observe(container)
    return () => ro.disconnect()
  }, [map])
  return null
}

// ------------------------------------------------------------
// Componente principal
// ------------------------------------------------------------
export default function MapView({
  center,
  zoom,
  userPosition,
  ubicaciones,
  route,
  onRouteFound,
  onRouteError,
  onHideClick,
  onIrDirecto,
  onMapReady,
}) {
  const lista =
    ubicaciones && ubicaciones.length > 0 ? ubicaciones : HIDES_INICIALES

  const hideCoords = useMemo(
    () => lista.map((u) => [Number(u.latitud), Number(u.longitud)]),
    [lista]
  )

  const tramosLineas = useMemo(() => {
    return TRAMOS_RUTA.map((t) => {
      const desde = HIDES_INICIALES.find((h) => h.id === t.desde)
      const hasta = HIDES_INICIALES.find((h) => h.id === t.hasta)
      if (!desde || !hasta) return null

      const estado = ESTADOS_RUTA[t.estado] || ESTADOS_RUTA.ok
      const positions = generarCurva(
        [desde.latitud, desde.longitud],
        [hasta.latitud, hasta.longitud],
        t.id
      )

      return {
        id: t.id,
        nombre: t.nombre,
        estado,
        estadoKey: t.estado,
        positions,
      }
    }).filter(Boolean)
  }, [])

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      zoomControl={false}
      attributionControl={false}
      scrollWheelZoom
      preferCanvas
      style={{ width: '100%', height: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
        updateWhenIdle
        updateWhenZooming={false}
        keepBuffer={2}
      />

      <ResizeObserverLeaflet />
      <InvalidateOnMount />
      <FitToHides hideCoords={hideCoords} />
      <MapInstanceHandler onReady={onMapReady} />

      {tramosLineas.map((t) => (
        <Polyline
          key={t.id}
          positions={t.positions}
          pathOptions={{
            color: t.estado.color,
            weight: 5,
            opacity: 0.9,
            lineCap: 'round',
            lineJoin: 'round',
            dashArray: t.estadoKey === 'bloqueado' ? '10, 8' : undefined,
          }}
        >
          <Tooltip sticky direction="top" offset={[0, -8]}>
            <div className={`tramo-tooltip tramo-${t.estadoKey}`}>
              <span className="tramo-tooltip-icon">{t.estado.icono}</span>
              <div>
                <strong>{t.nombre}</strong>
                <br />
                <small>{t.estado.label}</small>
              </div>
            </div>
          </Tooltip>
        </Polyline>
      ))}

      {userPosition && (
        <Marker
          position={[userPosition.lat, userPosition.lng]}
          icon={iconoUsuario()}
        />
      )}

      {lista.map((u) => {
        const dist = userPosition
          ? haversineKm(
              userPosition.lat,
              userPosition.lng,
              u.latitud,
              u.longitud
            )
          : null

        const distLabel =
          dist == null
            ? '—'
            : dist < 1
            ? `${Math.round(dist * 1000)} m`
            : `${dist.toFixed(1)} km`

        return (
          <Marker
            key={u.id}
            position={[Number(u.latitud), Number(u.longitud)]}
            icon={iconoHide(u.nombre)}
          >
            <Popup
              className="hide-popup-mini"
              closeButton
              maxWidth={220}
              minWidth={200}
            >
              <div className="hide-popup-body">
                <h4 className="hide-popup-title">{u.nombre}</h4>
                <p className="hide-popup-sub">
                  {u.descripcion || u.ciudad || 'Punto de observación'}
                </p>

                <div className="hide-popup-dist">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  <span>
                    <strong>{distLabel}</strong> de distancia
                  </span>
                </div>

                <div className="hide-popup-actions">
                  <button
                    className="hide-popup-btn info"
                    onClick={() => onHideClick && onHideClick(u)}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Info
                  </button>
                  <button
                    className="hide-popup-btn ir"
                    onClick={() => onIrDirecto && onIrDirecto(u)}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    Ir
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        )
      })}

      {route && (
        <RoutingMachine
          from={route.from}
          to={route.to}
          onRouteFound={onRouteFound}
          onError={onRouteError}
        />
      )}
    </MapContainer>
  )
}

// ------------------------------------------------------------
// Comparte la instancia del mapa con el padre
// ------------------------------------------------------------
function MapInstanceHandler({ onReady }) {
  const map = useMap()
  useEffect(() => {
    if (onReady) onReady(map)
  }, [map, onReady])
  return null
}