export default function Toast({ show, kind, message }) {
  return (
    <div id="toast" className={`toast ${kind} ${show ? 'show' : ''}`}>
      {message}
    </div>
  )
}