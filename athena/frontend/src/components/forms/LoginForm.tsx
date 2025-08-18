import { useForm } from "@tanstack/react-form"
import Input from "../ui/Input"
import Button from "../ui/Button"
import ErrorMessage from "../ui/ErrorMessage"
import { useNavigate } from "@tanstack/react-router"
import { useLogin } from "@/api/auth/useAuth"
import { useQueryClient } from "@tanstack/react-query"

export default function LoginForm(): React.JSX.Element {
  interface FormData {
    username: string
    password: string
  }

  const defaultFormData: FormData = {
    username: "",
    password: "",
  }

  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const loginMutation = useLogin(queryClient)

  const form = useForm({
    defaultValues: defaultFormData,
    onSubmit: async ({ value }) => {
      const credentials = {
        username: value.username,
        password: value.password
      }
      loginMutation.mutate(credentials, {
        onSuccess: () => navigate({ to: "/" })
      })
    },
  })

  return (
    <div className="w-full max-w-md bg-card rounded-2xl shadow-lg p-8 sm:p-10">
      <h2 className="text-fg text-2xl font-semibold mb-6 text-center">Login</h2>
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

        {loginMutation.isError && (
          <ErrorMessage className="text-center">
            {loginMutation.error.message}
          </ErrorMessage>
        )}
        {loginMutation.isSuccess && (
          <span
            className="text-success text-center text-sm mt-2 block"
            role="status"
          >
            Login successful
          </span>
        )}

        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
        >
          {([canSubmit, isSubmitting]) => (
            <Button
              label="Login"
              type="submit"
              disabled={!canSubmit}
              loading={isSubmitting}
              fullWidth
            />
          )}
        </form.Subscribe>
      </form>
    </div>
  )
}
