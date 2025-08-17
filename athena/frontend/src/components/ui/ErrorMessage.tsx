interface ErrorMessageProps {
  id?: string
  children: React.ReactNode
}

export default function ErrorMessage({ id, children }: ErrorMessageProps) {
  if (!children) return null

  return (
    <span
      id={id}
      className="text-danger text-center text-sm mt-1 block"
      role="alert"
    >
      {children}
    </span>
  )
}
