import React, { useId } from "react"
import Label from "./Label"

interface InputProps extends React.ComponentPropsWithoutRef<"input"> {
  label?: string
  error?: string
}

export default function Input({
  label,
  error,
  id,
  className = "",
  ...props
}: InputProps): React.JSX.Element {
  const generatedId = useId()
  const inputId = id || generatedId
  return (
    <div className={`flex flex-col gap-1`}>
      {label && <Label htmlFor={inputId}>{label}</Label>}
      <input
        id={inputId}
        className={`rounded-md px-2.5 py-1.5 text-fg placeholder:text-fg-muted
          border border-border focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary
          ${className} ${error ? "border-danger" : ""}`}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...props}
      />
      {error && (
        <span id={`${inputId}-error`} className="text-danger text-sm">
          {error}
        </span>
      )}
    </div>
  )
}
