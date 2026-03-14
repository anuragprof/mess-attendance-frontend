export default function Card({ title, children, footer }) {
  return (
    <div className="gradient-card p-5">
      {title && <div className="mb-4 text-lg font-bold text-blue-700 tracking-tight">{title}</div>}
      <div>{children}</div>
      {footer && <div className="mt-3 text-sm text-zinc-500">{footer}</div>}
    </div>
  )
}
