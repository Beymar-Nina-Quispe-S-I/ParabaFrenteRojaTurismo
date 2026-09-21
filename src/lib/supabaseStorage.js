import { sb } from './supabase'

export async function subirImagenRuta(file, userId) {
  if (!file) return null

  const ext = file.name.split('.').pop() || 'jpg'
  const fileName = `rutas/${userId}/${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}.${ext}`

  const { error } = await sb.storage
    .from('rutas-imagenes')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type,
    })

  if (error) throw new Error(error.message)

  const { data } = sb.storage.from('rutas-imagenes').getPublicUrl(fileName)
  return data.publicUrl
}