import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import { iconoUsuario, iconoDestino } from '../lib/geo'

let routingCargado = false

export default function RoutingMachine({ from, to, onRouteFound, onError }) {
  const map = useMap()
  const controlRef = useRef(null)
  const lastKeyRef = useRef('')

  useEffect(() => {
    if (!map || !from || !to) return

    const key = `${from[0]},${from[1]}|${to[0]},${to[1]}`
    if (key === lastKeyRef.current) return
    lastKeyRef.current = key

    let cancelado = false

    async function crearControl() {
      if (!routingCargado) {
        await import('leaflet-routing-machine')
        routingCargado = true
      }
      if (cancelado) return

      if (controlRef.current) {
        try {
          map.removeControl(controlRef.current)
        } catch {
          /* ignore */
        }
        controlRef.current = null
      }

      const control = L.Routing.control({
        waypoints: [L.latLng(from[0], from[1]), L.latLng(to[0], to[1])],
        lineOptions: {
          styles: [{ color: '#C6862E', weight: 5, opacity: 0.9 }],
        },
        createMarker: (i, wp) =>
          L.marker(wp.latLng, {
            icon: i === 0 ? iconoUsuario() : iconoDestino(),
          }),
        addWaypoints: false,
        draggableWaypoints: false,
        fitSelectedRoutes: false,
        show: false,
        routeWhileDragging: false,
        autoRoute: true,
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
    }

    crearControl()

    return () => {
      cancelado = true
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