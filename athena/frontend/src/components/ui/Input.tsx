import React from "react"

interface InputProps extends React.ComponentPropsWithoutRef<"input"> {
  label?: string
  error?: string
}

export default function Input({
  label,
  error,
  className = "",
  ...props
}: InputProps): React.JSX.Element {
  return (
    <div className={`flex flex-col gap-1`}>
      {label && (
        <label className="text-fg-muted text-sm font-medium">{label}</label>
      )}
      <input
        className={`rounded-md px-2.5 py-1.5 text-fg placeholder:text-fg-muted
        border border-border focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary
        ${className} ${error ? "border-danger" : ""}`}
        {...props}
      />
      {error && <span className="text-danger text-sm">{error}</span>}
    </div>
  )
}
