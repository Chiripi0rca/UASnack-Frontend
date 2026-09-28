export default function IconoOjo ({tachado}) {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/>
            <circle cx="12" cy="12" r="3"/>
            {tachado && <path d="M3 3l18 18"/>}
        </svg>
    )
}