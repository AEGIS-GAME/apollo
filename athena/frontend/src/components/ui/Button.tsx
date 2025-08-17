import { LoaderCircle } from "lucide-react"

const VARIANTS = {
  primary: "bg-primary text-fg hover:bg-primary-hover hover:cursor-pointer",
  secondary: "bg-primary-muted text-fg hover:bg-gray-300 hover:cursor-pointer",
  danger: "bg-danger text-white hover:bg-danger-hover hover:cursor-pointer",
  outline:
    "border border-primary text-fg hover:bg-primary-muted hover:cursor-pointer",
}

type VariantType = keyof typeof VARIANTS

const DISABLED = "cursor-not-allowed opacity-50"

interface ButtonProps extends React.ComponentPropsWithoutRef<"button"> {
  label: string
  variant?: VariantType
  loading?: boolean
  fullWidth?: boolean
}

export default function Button({
  label,
  variant = "primary",
  disabled = false,
  loading = false,
  fullWidth = false,
  className = "",
  ...props
}: ButtonProps): React.JSX.Element {
  const style = `${disabled ? DISABLED : VARIANTS[variant]} ${fullWidth ? "w-full" : ""} ${className}`
  return (
    <button
      type="button"
      disabled={disabled || loading}
      aria-disabled={disabled || loading}
      aria-busy={loading}
      aria-label={label}
      className={`flex flex-row items-center justify-center h-8 gap-2 rounded-md px-2.5 py-1.5 ${style}`}
      {...props}
    >
      {loading ? (
        <>
          <LoaderCircle focusable="false" aria-hidden="true" />
          <span className="sr-only">Loading {label}</span>
        </>
      ) : (
        label
      )}
    </button>
  )
}
