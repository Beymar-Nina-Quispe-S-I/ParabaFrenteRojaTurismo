import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import RoutingMachine from './RoutingMachine'
import { fixLeafletDefaultIcon, iconoUsuario, iconoPunto } from '../lib/geo'

fixLeafletDefaultIcon()

function Recenter({ center, zoom }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, zoom, { animate: true })
  }, [center, zoom, map])
  return null
}

function InvalidateOnMount() {
  const map = useMap()
  useEffect(() => {
    setTimeout(() => map.invalidateSize(), 120)
  }, [map])
  return null
}

export default function MapView({
  center,
  zoom,
  userPosition,
  ubicaciones,
  route,
  onRouteFound,
  onRouteError,
  onTraceFromPopup,
}) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      zoomControl={false}
      attributionControl={false}
      scrollWheelZoom
      style={{ width: '100%', height: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
      />

      <InvalidateOnMount />
      <Recenter center={center} zoom={zoom} />

      {userPosition && (
        <Marker
          position={[userPosition.lat, userPosition.lng]}
          icon={iconoUsuario()}
        />
      )}

      {ubicaciones.map((u) => (
        <Marker
          key={u.id}
          position={[u.latitud, u.longitud]}
          icon={iconoPunto()}
        >
          <Popup>
            <b>{u.nombre}</b>
            <br />
            <small>{u.descripcion || ''}</small>
            <br />
            <a
              href="#"
              onClick={(ev) => {
                ev.preventDefault()
                onTraceFromPopup(u.latitud, u.longitud, u.nombre || 'Destino')
              }}
              style={{
                color: '#C6862E',
                fontWeight: 700,
                fontSize: 12,
              }}
            >
              Trazar ruta →
            </a>
          </Popup>
        </Marker>
      ))}

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