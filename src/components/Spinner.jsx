export default function Spinner({ active }) {
  return (
    <div
      id="spinnerOverlay"
      className={`spinner-overlay ${active ? 'active' : ''}`}
    >
      <div className="spinner-big" />
    </div>
  )
}