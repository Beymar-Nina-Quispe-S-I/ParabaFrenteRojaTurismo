import { lazy, Suspense, useEffect, useState } from 'react'
import './App.css'

import Toast from './components/Toast'
import Spinner from './components/Spinner'
import Modal from './components/Modal'
import ProfileDrawer from './components/ProfileDrawer'
import BottomNav from './components/BottomNav'
import DesktopLayout from './components/DesktopLayout'
import ExitConfirmModal from './components/ExitConfirmModal'

import { useToast } from './hooks/useToast'
import { useAuth } from './hooks/useAuth'
import { usePermissions } from './hooks/usePermissions'
import { usePresence } from './hooks/usePresence'
import { useMediaQuery } from './hooks/useMediaQuery'
import { useBeforeUnload } from './hooks/useBeforeUnload'
import { useBackGuard } from './hooks/useBackGuard'

const InicioView = lazy(() => import('./views/InicioView'))
const MapaView = lazy(() => import('./views/MapaView'))
const AvistamientosView = lazy(() => import('./views/AvistamientosView'))
const RutasView = lazy(() => import('./views/RutasView'))
const RolesView = lazy(() => import('./views/RolesView'))
const UsuariosView = lazy(() => import('./views/UsuariosView'))
const SolicitudesView = lazy(() => import('./views/SolicitudesView'))
const AuditoriaView = lazy(() => import('./views/AuditoriaView'))
const HistorialUsuariosView = lazy(() => import('./views/HistorialUsuariosView'))
const DashboardView = lazy(() => import('./views/DashboardView'))
const FichaTecnicaView = lazy(() => import('./views/FichaTecnicaView'))

export default function App() {
  const [view, setView] = useState('inicio')
  const [profileOpen, setProfileOpen] = useState(false)
  const [modal, setModal] = useState(null)
  const [spinner, setSpinner] = useState(false)
  const [userPosition, setUserPosition] = useState(null)

  const isDesktop = useMediaQuery('(min-width: 1024px)')

  const { toast, msg, kind, show } = useToast()
  const { user, login, register, logout } = useAuth()
  const { esAdmin, tiene } = usePermissions(user)
  const presence = usePresence(user)

  useBeforeUnload(true)
  const { confirmOpen, requestCancel, requestConfirm } = useBackGuard(true)

  useEffect(() => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setUserPosition({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }),
      () => {},
      { enableHighAccuracy: true, timeout: 15000 }
    )
  }, [])

  function openModal(k) {
    if (
      (k === 'favoritos' ||
        k === 'misAvistamientos' ||
        k === 'registrarAvistamiento') &&
      !user
    ) {
      setModal('login')
      return
    }
    setModal(k)
  }

  function onTrazar(lat, lng, nombre) {
    setView('mapa')
    setTimeout(() => {
      if (window.__volarA) window.__volarA(lat, lng, nombre)
      if (window.__trazarRuta) window.__trazarRuta(lat, lng, nombre)
    }, 400)
  }

  function reloadAvistamientos() {
    window.__reloadAvist && window.__reloadAvist()
  }

  const content = (
    <Suspense
      fallback={
        <div className="view-loader">
          <div className="view-loader-spinner" />
        </div>
      }
    >
      {view === 'inicio' && (
        <InicioView
          onNavigate={setView}
          onOpenProfile={() => setProfileOpen(true)}
        />
      )}
      {view === 'mapa' && <MapaView />}
      {view === 'avistamientos' && (
        <AvistamientosView onOpenModal={openModal} />
      )}
      {view === 'rutas' && tiene('ver_rutas') && (
        <RutasView
          userPosition={userPosition}
          onTrazar={onTrazar}
          onOpenModal={openModal}
          onToast={toast}
        />
      )}
      {view === 'usuarios' && esAdmin && <UsuariosView onToast={toast} />}
      {view === 'roles' && esAdmin && <RolesView onToast={toast} />}
      {view === 'solicitudes' && esAdmin && (
        <SolicitudesView onToast={toast} />
      )}
      {view === 'auditoria' && esAdmin && <AuditoriaView presence={presence} />}
      {view === 'historial' && tiene('ver_historial_usuarios') && (
        <HistorialUsuariosView onToast={toast} />
      )}
      {view === 'dashboard' && esAdmin && <DashboardView onToast={toast} />}
      {view === 'ficha' && <FichaTecnicaView onToast={toast} />}
    </Suspense>
  )

  return (
    <>
      <Spinner active={spinner} />
      <Toast show={show} kind={kind} message={msg} />

      {isDesktop ? (
        <DesktopLayout
          view={view}
          onNavigate={setView}
          user={user}
          esAdmin={esAdmin}
          onOpenModal={openModal}
          onOpenProfile={() => setProfileOpen(true)}
          onLogout={() => {
            logout()
            toast('Sesión cerrada', 'info')
          }}
          onToast={toast}
        >
          {content}
        </DesktopLayout>
      ) : (
        <div id="mobileApp">
          {content}
          <BottomNav current={view} onChange={setView} />
        </div>
      )}

      <ProfileDrawer
        open={profileOpen}
        user={user}
        onClose={() => setProfileOpen(false)}
        onNav={(v) => setView(v)}
        onOpenModal={openModal}
        onLogout={() => {
          logout()
          toast('Sesión cerrada', 'info')
        }}
        onToast={toast}
      />

      <Modal
        kind={modal}
        user={user}
        onClose={() => setModal(null)}
        onSwitch={setModal}
        onLogin={login}
        onRegister={register}
        onToast={toast}
        onSpinner={setSpinner}
        onReload={reloadAvistamientos}
      />

      <ExitConfirmModal
        open={confirmOpen}
        onCancel={requestCancel}
        onConfirm={requestConfirm}
      />
    </>
  )
}