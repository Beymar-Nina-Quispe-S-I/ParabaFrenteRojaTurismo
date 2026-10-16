import L from 'leaflet'

export function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export const iconoUsuario = () =>
  L.divIcon({
    className: '',
    html: '<div class="user-location-marker"><div class="ulm-halo"></div><div class="ulm-pulse"></div><div class="ulm-core"></div></div>',
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  })

export const iconoDestino = () =>
  L.divIcon({
    className: '',
    html: '<div style="width:18px;height:18px;background:#C6862E;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.4);"></div>',
    iconSize: [18, 18],
    iconAnchor: [9, 18],
  })

export const iconoPunto = () =>
  L.divIcon({
    className: '',
    html: '<div style="width:16px;height:16px;background:#D6483F;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.35);"></div>',
    iconSize: [16, 16],
    iconAnchor: [8, 16],
    popupAnchor: [0, -14],
  })

export async function reverseGeocode(lat, lng) {
  try {
    const r = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
    )
    const geo = await r.json()
    const a = geo.address || {}
    return {
      lugar: a.road || a.neighbourhood || a.suburb || 'Ubicación actual',
      ciudad:
        [a.city || a.town || a.village, a.state].filter(Boolean).join(', ') ||
        'Bolivia',
    }
  } catch {
    return { lugar: 'Ubicación actual', ciudad: 'Bolivia' }
  }
}

export function fixLeafletDefaultIcon() {
  delete L.Icon.Default.prototype._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl:
      'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl:
      'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  })
}