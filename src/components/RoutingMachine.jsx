import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet-routing-machine'
import { iconoUsuario, iconoDestino } from '../lib/geo'

export default function RoutingMachine({ from, to, onRouteFound, onError }) {
  const map = useMap()

  useEffect(() => {
    const control = L.Routing.control({
      waypoints: [L.latLng(from[0], from[1]), L.latLng(to[0], to[1])],
      lineOptions: {
        styles: [{ color: '#C6862E', weight: 5, opacity: 0.88 }],
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

    return () => {
      try {
        map.removeControl(control)
      } catch {
        /* ignore */
      }
    }
  }, [from, to, map, onRouteFound, onError])

  return null
}