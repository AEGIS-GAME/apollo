import React from "react"

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode
  htmlFor?: string
  className?: string
}

export default function Label({
  children,
  htmlFor,
  className = "",
  ...props
}: LabelProps): React.JSX.Element {
  return (
    <label
      htmlFor={htmlFor}
      className={`text-fg-muted text-sm font-medium ${className}`}
      {...props}
    >
      {children}
    </label>
  )
}
