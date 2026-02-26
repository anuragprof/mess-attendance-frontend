export default function Card({ title, children, footer }) {
  return (
    <div className="bg-white rounded-2xl shadow p-4">
      {title && <div className="mb-2 font-semibold">{title}</div>}
      <div>{children}</div>
      {footer && <div className="mt-3 text-sm text-zinc-500">{footer}</div>}
    </div>
  )
}
