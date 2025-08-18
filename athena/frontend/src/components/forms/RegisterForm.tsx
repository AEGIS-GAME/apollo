import { useForm } from "@tanstack/react-form"
import Input from "../ui/Input"
import Button from "../ui/Button"
import { useRegister } from "@/hooks/useAuth"
import ErrorMessage from "../ui/ErrorMessage"
import { useNavigate } from "@tanstack/react-router"

export default function RegisterForm(): React.JSX.Element {
  interface FormData {
    username: string
    password: string
    confirmPassword: string
  }

  const defaultFormData: FormData = {
    username: "",
    password: "",
    confirmPassword: "",
  }


  const navigate = useNavigate()
  const registerMutation = useRegister()
  const form = useForm({
    defaultValues: defaultFormData,
    onSubmit: async ({ value }) => {
      registerMutation.mutate(value, {
        onSuccess: () => navigate({ to: "/" })
      })
    },
  })

  return (
    <div className="w-full max-w-md bg-card rounded-2xl shadow-lg p-8 sm:p-10">
      <h2 className="text-fg text-2xl font-semibold mb-6 text-center">
        Register
      </h2>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
        className="flex flex-col gap-4"
      >
        <form.Field
          name="username"
          validators={{
            onChange: ({ value }) => {
              if (!value) return "A username is required"
              if (value.length < 3 || value.length > 50)
                return "Username must be between 3 and 50 characters"
              if (!/^[a-zA-Z0-9_]+$/.test(value))
                return "Username can only contain letters, numbers, and underscores"
              return undefined
            },
          }}
        >
          {(field) => (
            <Input
              label="Username"
              error={field.state.meta.errors.join(", ")}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
            />
          )}
        </form.Field>

        <form.Field
          name="password"
          validators={{
            onChange: ({ value }) => {
              if (!value) return "A password is required"
              if (value.length < 8)
                return "Password must be at least 8 characters"
              return undefined
            },
          }}
        >
          {(field) => (
            <Input
              type="password"
              label="Password"
              error={field.state.meta.errors.join(", ")}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
            />
          )}
        </form.Field>

        <form.Field
          name="confirmPassword"
          validators={{
            onChangeListenTo: ["password"],
            onChange: ({ value, fieldApi }) => {
              const password = fieldApi.form.getFieldValue("password")
              if (value !== password) return "Passwords do not match"
              return undefined
            },
          }}
        >
          {(field) => (
            <Input
              type="password"
              label="Confirm Password"
              error={field.state.meta.errors.join(", ")}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
            />
          )}
        </form.Field>

        {registerMutation.isError && <ErrorMessage className="text-center">{registerMutation.error.message}</ErrorMessage>}
        {registerMutation.isSuccess && (
          <span className="text-success text-center text-sm mt-2 block" role="status">
            Registration successful
          </span>
        )}

        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
        >
          {([canSubmit, isSubmitting]) => (
            <Button
              label="Register"
              type="submit"
              disabled={!canSubmit}
              loading={isSubmitting || registerMutation.isPending}
              fullWidth
            />
          )}
        </form.Subscribe>
      </form>
    </div>
  )
}
