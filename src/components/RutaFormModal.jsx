import { useEffect, useState } from 'react'
import { subirImagenRuta } from '../lib/supabaseStorage'

const ESPECIES = [
  'Ara rubrogenys',
  'Paraba Frente Roja',
  'Paraba Azul',
  'Guacamayo Verde',
  'Otra especie',
]

export default function RutaFormModal({ open, onClose, onSave, user }) {
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [especie, setEspecie] = useState(ESPECIES[0])
  const [ciudad, setCiudad] = useState('')
  const [latitud, setLatitud] = useState('')
  const [longitud, setLongitud] = useState('')
  const [cantidad, setCantidad] = useState(1)
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) {
      setNombre('')
      setDescripcion('')
      setEspecie(ESPECIES[0])
      setCiudad('')
      setLatitud('')
      setLongitud('')
      setCantidad(1)
      setFile(null)
      setPreview(null)
      setError('')
    }
  }, [open])

  function onPickFile(e) {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  function usarUbicacionActual() {
    if (!navigator.geolocation) {
      setError('Geolocalización no disponible')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitud(pos.coords.latitude.toFixed(6))
        setLongitud(pos.coords.longitude.toFixed(6))
      },
      () => setError('No se pudo obtener la ubicación'),
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  async function submit() {
    setError('')
    if (!user) return setError('Debes iniciar sesión')
    if (!nombre.trim()) return setError('El nombre es obligatorio')

    const lat = parseFloat(latitud)
    const lng = parseFloat(longitud)
    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return setError('Coordenadas inválidas')
    }

    setSaving(true)
    try {
      let imagen_url = null
      if (file) imagen_url = await subirImagenRuta(file, user.id)

      await onSave({
        nombre: nombre.trim(),
        descripcion: descripcion.trim() || null,
        especie,
        ciudad: ciudad.trim() || 'Bolivia',
        latitud: lat,
        longitud: lng,
        dms: null,
        imagen_url,
        cantidad_avistada: Number(cantidad) || 1,
        activo: true,
      })

      onClose()
    } catch (e) {
      setError(e.message || 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  if (!open) return null

  return (
    <div
      className="ruta-form-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="ruta-form-modal">
        <div className="ruta-form-header">
          <h2>Registrar nueva ruta</h2>
          <button className="ruta-form-close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4}>
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="ruta-form-body">
          <label className="ruta-form-photo">
            {preview ? (
              <div
                className="ruta-form-photo-preview"
                style={{ backgroundImage: `url('${preview}')` }}
              />
            ) : (
              <div className="ruta-form-photo-empty">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M3 7a4 4 0 014-4h10a4 4 0 014 4v10a4 4 0 01-4 4H7a4 4 0 01-4-4V7z" />
                  <path d="M3 15l5-5 4 4 3-3 6 6M9 10a2 2 0 100-4 2 2 0 000 4z" />
                </svg>
                <span>Añadir foto de referencia</span>
              </div>
            )}
            <input type="file" accept="image/*" onChange={onPickFile} hidden />
          </label>

          <label className="ruta-form-label">Nombre del hide / ruta</label>
          <input
            className="ruta-form-input"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej. Hide 6 · Mirador"
          />

          <label className="ruta-form-label">Descripción</label>
          <textarea
            className="ruta-form-input"
            rows={2}
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Detalles del punto"
          />

          <div className="ruta-form-row">
            <div>
              <label className="ruta-form-label">Especie</label>
              <select
                className="ruta-form-input"
                value={especie}
                onChange={(e) => setEspecie(e.target.value)}
              >
                {ESPECIES.map((e) => (
                  <option key={e} value={e}>
                    {e}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="ruta-form-label">Cantidad</label>
              <input
                type="number"
                min={1}
                className="ruta-form-input"
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
              />
            </div>
          </div>

          <label className="ruta-form-label">Ciudad / Departamento</label>
          <input
            className="ruta-form-input"
            value={ciudad}
            onChange={(e) => setCiudad(e.target.value)}
            placeholder="Ej. Cochabamba · Bolivia"
          />

          <div className="ruta-form-row">
            <div>
              <label className="ruta-form-label">Latitud</label>
              <input
                className="ruta-form-input"
                value={latitud}
                onChange={(e) => setLatitud(e.target.value)}
                placeholder="-18.099103"
              />
            </div>
            <div>
              <label className="ruta-form-label">Longitud</label>
              <input
                className="ruta-form-input"
                value={longitud}
                onChange={(e) => setLongitud(e.target.value)}
                placeholder="-64.921034"
              />
            </div>
          </div>

          <button type="button" className="ruta-form-geo" onClick={usarUbicacionActual}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Usar mi ubicación actual
          </button>

          {error && <div className="ruta-form-error">{error}</div>}

          <button className="ruta-form-submit" onClick={submit} disabled={saving}>
            {saving ? 'Guardando…' : 'Guardar ruta'}
          </button>
        </div>
      </div>
    </div>
  )
}