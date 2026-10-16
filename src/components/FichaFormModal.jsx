import { useEffect, useState } from 'react'

const CAMPOS_VACIOS = {
  nombre: '',
  nombre_cientifico: '',
  imagen: '',
  descripcion: '',
  reino: 'Animalia',
  filo: 'Chordata',
  clase: 'Aves',
  orden: '',
  familia: '',
  genero: '',
  especie: '',
  estado: '',
  habitat: '',
  distribucion: '',
  alimentacion: '',
  tamano: '',
  peso: '',
  envergadura: '',
  vida_silvestre: '',
  reproduccion: '',
  amenazas: [],
  curiosidades: [],
  activo: true,
}

export default function FichaFormModal({ open, ficha, onClose, onSave }) {
  const [datos, setDatos] = useState(CAMPOS_VACIOS)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [amenazaInput, setAmenazaInput] = useState('')
  const [curiosidadInput, setCuriosidadInput] = useState('')

  useEffect(() => {
    if (ficha) {
      setDatos({ ...CAMPOS_VACIOS, ...ficha })
    } else {
      setDatos(CAMPOS_VACIOS)
    }
    setError('')
  }, [ficha, open])

  function set(campo, valor) {
    setDatos((d) => ({ ...d, [campo]: valor }))
  }

  function agregarAmenaza() {
    if (!amenazaInput.trim()) return
    set('amenazas', [...(datos.amenazas || []), amenazaInput.trim()])
    setAmenazaInput('')
  }

  function quitarAmenaza(i) {
    set('amenazas', datos.amenazas.filter((_, idx) => idx !== i))
  }

  function agregarCuriosidad() {
    if (!curiosidadInput.trim()) return
    set('curiosidades', [...(datos.curiosidades || []), curiosidadInput.trim()])
    setCuriosidadInput('')
  }

  function quitarCuriosidad(i) {
    set('curiosidades', datos.curiosidades.filter((_, idx) => idx !== i))
  }

  async function submit() {
    setError('')
    if (!datos.nombre.trim()) return setError('El nombre es obligatorio')
    if (!datos.nombre_cientifico.trim())
      return setError('El nombre científico es obligatorio')

    setSaving(true)
    try {
      await onSave(datos)
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
      className="ficha-form-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="ficha-form-modal">
        <div className="ficha-form-header">
          <h2>{ficha ? 'Editar ficha' : 'Nueva ficha'}</h2>
          <button className="ficha-form-close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4}>
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="ficha-form-body">
          <Section titulo="Información básica">
            <Field label="Nombre común *">
              <input
                value={datos.nombre}
                onChange={(e) => set('nombre', e.target.value)}
                placeholder="Ej. Paraba Roja"
              />
            </Field>
            <Field label="Nombre científico *">
              <input
                value={datos.nombre_cientifico}
                onChange={(e) => set('nombre_cientifico', e.target.value)}
                placeholder="Ej. Ara rubrogenys"
              />
            </Field>
            <Field label="URL de imagen">
              <input
                value={datos.imagen || ''}
                onChange={(e) => set('imagen', e.target.value)}
                placeholder="https://..."
              />
            </Field>
            <Field label="Descripción">
              <textarea
                rows={3}
                value={datos.descripcion || ''}
                onChange={(e) => set('descripcion', e.target.value)}
              />
            </Field>
          </Section>

          <Section titulo="Taxonomía">
            <div className="ficha-form-row">
              <Field label="Reino">
                <input value={datos.reino} onChange={(e) => set('reino', e.target.value)} />
              </Field>
              <Field label="Filo">
                <input value={datos.filo} onChange={(e) => set('filo', e.target.value)} />
              </Field>
            </div>
            <div className="ficha-form-row">
              <Field label="Clase">
                <input value={datos.clase} onChange={(e) => set('clase', e.target.value)} />
              </Field>
              <Field label="Orden">
                <input value={datos.orden} onChange={(e) => set('orden', e.target.value)} />
              </Field>
            </div>
            <div className="ficha-form-row">
              <Field label="Familia">
                <input value={datos.familia} onChange={(e) => set('familia', e.target.value)} />
              </Field>
              <Field label="Género">
                <input value={datos.genero} onChange={(e) => set('genero', e.target.value)} />
              </Field>
            </div>
            <Field label="Especie">
              <input value={datos.especie} onChange={(e) => set('especie', e.target.value)} />
            </Field>
          </Section>

          <Section titulo="Datos biológicos">
            <Field label="Estado de conservación">
              <input
                value={datos.estado || ''}
                onChange={(e) => set('estado', e.target.value)}
                placeholder="Ej. En peligro crítico (CR)"
              />
            </Field>
            <Field label="Hábitat">
              <textarea
                rows={2}
                value={datos.habitat || ''}
                onChange={(e) => set('habitat', e.target.value)}
              />
            </Field>
            <Field label="Distribución">
              <textarea
                rows={2}
                value={datos.distribucion || ''}
                onChange={(e) => set('distribucion', e.target.value)}
              />
            </Field>
            <Field label="Alimentación">
              <textarea
                rows={2}
                value={datos.alimentacion || ''}
                onChange={(e) => set('alimentacion', e.target.value)}
              />
            </Field>
            <div className="ficha-form-row">
              <Field label="Tamaño">
                <input value={datos.tamano || ''} onChange={(e) => set('tamano', e.target.value)} />
              </Field>
              <Field label="Peso">
                <input value={datos.peso || ''} onChange={(e) => set('peso', e.target.value)} />
              </Field>
            </div>
            <div className="ficha-form-row">
              <Field label="Envergadura">
                <input
                  value={datos.envergadura || ''}
                  onChange={(e) => set('envergadura', e.target.value)}
                />
              </Field>
              <Field label="Vida silvestre">
                <input
                  value={datos.vida_silvestre || ''}
                  onChange={(e) => set('vida_silvestre', e.target.value)}
                />
              </Field>
            </div>
            <Field label="Reproducción">
              <textarea
                rows={2}
                value={datos.reproduccion || ''}
                onChange={(e) => set('reproduccion', e.target.value)}
              />
            </Field>
          </Section>

          <Section titulo="Amenazas">
            <div className="ficha-tag-input">
              <input
                value={amenazaInput}
                onChange={(e) => setAmenazaInput(e.target.value)}
                placeholder="Agregar amenaza..."
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), agregarAmenaza())}
              />
              <button type="button" onClick={agregarAmenaza}>+</button>
            </div>
            <div className="ficha-tags">
              {(datos.amenazas || []).map((a, i) => (
                <span key={i} className="ficha-tag">
                  {a}
                  <button onClick={() => quitarAmenaza(i)}>×</button>
                </span>
              ))}
            </div>
          </Section>

          <Section titulo="Curiosidades">
            <div className="ficha-tag-input">
              <input
                value={curiosidadInput}
                onChange={(e) => setCuriosidadInput(e.target.value)}
                placeholder="Agregar curiosidad..."
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), agregarCuriosidad())}
              />
              <button type="button" onClick={agregarCuriosidad}>+</button>
            </div>
            <div className="ficha-tags">
              {(datos.curiosidades || []).map((c, i) => (
                <span key={i} className="ficha-tag">
                  {c}
                  <button onClick={() => quitarCuriosidad(i)}>×</button>
                </span>
              ))}
            </div>
          </Section>

          {error && <div className="ficha-form-error">{error}</div>}

          <div className="ficha-form-actions">
            <button onClick={onClose}>Cancelar</button>
            <button className="primary" onClick={submit} disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Section({ titulo, children }) {
  return (
    <div className="ficha-form-section">
      <h4>{titulo}</h4>
      <div className="ficha-form-section-content">{children}</div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div className="ficha-form-field">
      <label>{label}</label>
      {children}
    </div>
  )
}