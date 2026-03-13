export default function Card({ title, children, footer }) {
  return (
    <div className="bg-gradient-to-b from-blue-50 to-white border-2 border-blue-200 rounded-2xl shadow-lg p-5">
      {title && <div className="mb-4 text-lg font-bold text-blue-700 tracking-tight">{title}</div>}
      <div>{children}</div>
      {footer && <div className="mt-3 text-sm text-zinc-500">{footer}</div>}
    </div>
  )
}
