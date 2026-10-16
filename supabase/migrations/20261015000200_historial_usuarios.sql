ALTER TABLE public.roles
  ADD COLUMN IF NOT EXISTS ver_historial_usuarios boolean NOT NULL DEFAULT false;

UPDATE public.roles
SET ver_historial_usuarios = true
WHERE lower(nombre) = 'admin';

CREATE INDEX IF NOT EXISTS auditoria_user_created_idx
  ON public.auditoria (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS avistamientos_user_created_idx
  ON public.avistamientos (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS rutas_user_created_idx
  ON public.rutas (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS auditoria_heartbeat_recent_idx
  ON public.auditoria (created_at DESC, user_id)
  WHERE accion = 'heartbeat';

NOTIFY pgrst, 'reload schema';
