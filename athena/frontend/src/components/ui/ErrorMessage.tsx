interface ErrorMessageProps {
  id?: string
  className?: string
  children: React.ReactNode
}

export default function ErrorMessage({
  id,
  className,
  children,
}: ErrorMessageProps) {
  if (!children) return null

  return (
    <span
      id={id}
      className={`text-danger text-sm mt-1 block ${className ?? ""}`}
      role="alert"
    >
      {children}
    </span>
  )
}
