import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet-routing-machine'
import { iconoUsuario, iconoDestino } from '../lib/geo'

export default function RoutingMachine({ from, to, onRouteFound, onError }) {
  const map = useMap()
  const controlRef = useRef(null)
  const lastKeyRef = useRef('')

  useEffect(() => {
    if (!map || !from || !to) return

    // 🔑 Clave única: si no cambia, no recreamos el control
    const key = `${from[0]},${from[1]}|${to[0]},${to[1]}`
    if (key === lastKeyRef.current) return
    lastKeyRef.current = key

    // Destruir el control anterior si existe
    if (controlRef.current) {
      try {
        map.removeControl(controlRef.current)
      } catch {
        /* ignore */
      }
      controlRef.current = null
    }

    // Crear nuevo control
    const control = L.Routing.control({
      waypoints: [L.latLng(from[0], from[1]), L.latLng(to[0], to[1])],
      lineOptions: {
        styles: [{ color: '#5fff4e', weight: 5, opacity: 0.9 }],
      },
      createMarker: (i, wp) =>
        L.marker(wp.latLng, {
          icon: i === 0 ? iconoUsuario() : iconoDestino(),
        }),
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      show: false,
      router: L.Routing.osrmv1({
        serviceUrl: 'https://router.project-osrm.org/route/v1',
      }),
    }).addTo(map)

    control.on('routesfound', (e) => {
      const r = e.routes[0]
      onRouteFound &&
        onRouteFound(
          Number((r.summary.totalDistance / 1000).toFixed(1)),
          Math.round(r.summary.totalTime / 60)
        )
    })

    control.on('routingerror', () => {
      onError && onError()
    })

    controlRef.current = control

    return () => {
      if (controlRef.current) {
        try {
          map.removeControl(controlRef.current)
        } catch {
          /* ignore */
        }
        controlRef.current = null
      }
    }
  }, [map, from, to, onRouteFound, onError])

  return null
}