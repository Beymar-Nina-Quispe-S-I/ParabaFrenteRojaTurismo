alter table public.roles
  add column if not exists ver_rutas boolean not null default true,
  add column if not exists crear_fichas boolean not null default false,
  add column if not exists editar_fichas boolean not null default false,
  add column if not exists activar_fichas boolean not null default false,
  add column if not exists eliminar_fichas boolean not null default false,
  add column if not exists activar_rutas boolean not null default false,
  add column if not exists aprobar_rutas boolean not null default false;

create table if not exists public.hides_establecidos (
  id text primary key,
  activo boolean not null default true,
  updated_at timestamptz not null default now()
);

insert into public.hides_establecidos (id)
values ('hide-1'), ('hide-2'), ('hide-3'), ('hide-4'), ('hide-5')
on conflict (id) do nothing;

alter table public.hides_establecidos enable row level security;

create or replace function public.puede_activar_rutas()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.users u
    join public.roles r on r.id = u.role_id
    where u.id = auth.uid()
      and (lower(r.nombre) = 'admin' or r.activar_rutas)
  );
$$;

revoke all on function public.puede_activar_rutas() from public;
grant execute on function public.puede_activar_rutas() to authenticated;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'hides_establecidos'
      and policyname = 'hides_establecidos_lectura_publica'
  ) then
    execute 'create policy hides_establecidos_lectura_publica
      on public.hides_establecidos for select to anon, authenticated using (true)';
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'hides_establecidos'
      and policyname = 'hides_establecidos_cambiar_estado'
  ) then
    execute 'create policy hides_establecidos_cambiar_estado
      on public.hides_establecidos for update to authenticated
      using (public.puede_activar_rutas())
      with check (public.puede_activar_rutas())';
  end if;
end $$;

alter table public.rutas
  add column if not exists estado_revision text not null default 'aprobada';

do $$
begin
  if not exists (
    select 1
    from information_schema.table_constraints
    where constraint_schema = 'public'
      and table_name = 'rutas'
      and constraint_name = 'rutas_estado_revision_check'
  ) then
    alter table public.rutas
      add constraint rutas_estado_revision_check
      check (estado_revision in ('pendiente', 'aprobada', 'rechazada'));
  end if;
end $$;

update public.roles
set crear_fichas = coalesce(gestionar_fichas, false),
    editar_fichas = coalesce(gestionar_fichas, false),
    activar_fichas = coalesce(gestionar_fichas, false),
    eliminar_fichas = coalesce(gestionar_fichas, false);

  notify pgrst, 'reload schema';