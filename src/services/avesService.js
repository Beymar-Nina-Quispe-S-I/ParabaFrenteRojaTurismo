import { sb } from '../lib/supabase';
import { AVES_INICIALES } from '../data/avesData';

const STORAGE_KEY = 'aves_omereque_react_v5';

// Obtener aves desde LocalStorage si existen
const obtenerLocal = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Error al leer caché local de aves:', e);
  }
  return AVES_INICIALES;
};

const guardarLocal = (aves) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(aves));
  } catch (e) {
    console.error('Error al guardar aves en caché local:', e);
  }
};

/**
 * Obtiene la lista de fichas de aves:
 * 1. Intenta consultar Supabase (tabla 'fichas_aves').
 * 2. Si no hay conexión o no existe la tabla, usa la caché local o el catálogo oficial AVES_INICIALES.
 */
export async function obtenerAves() {
  if (sb) {
    try {
      const { data, error } = await sb
        .from('fichas_aves')
        .select('*')
        .order('nombre_comun', { ascending: true });

      if (!error && data && data.length > 0) {
        guardarLocal(data);
        return { data, fuente: 'supabase' };
      }
    } catch (err) {
      console.warn('Modo offline / fallback local para fichas de aves:', err);
    }
  }

  const data = obtenerLocal();
  return { data, fuente: 'local' };
}
