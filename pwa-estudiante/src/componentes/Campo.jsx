import './Campo.css'

export default function Campo({ etiqueta, error, children }) {
  return (
    <label className={error ? 'campo campo--error' : 'campo'}>
      <span className="campo__etiqueta">{etiqueta}</span>
      {children}
      {error && <span className="campo__error">{error}</span>}
    </label>
  )
}
