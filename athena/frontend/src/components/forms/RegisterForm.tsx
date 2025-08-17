import { useForm } from "@tanstack/react-form"
import Input from "../ui/Input"
import Button from "../ui/Button"

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

  const form = useForm({
    defaultValues: defaultFormData,
    onSubmit: async ({ value }) => {
      console.log(value)
    },
  })

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
      >
        <>
          <form.Field
            name="username"
            validators={{
              onChange: ({ value }) => {
                if (!value) {
                  return "A username is required";
                }
                if (value.length < 3 || value.length > 50) {
                  return "Username must be between 3 and 50 characters";
                }
                if (!/^[a-zA-Z0-9_]+$/.test(value)) {
                  return "Username can only contain letters, numbers, and underscores";
                }
                return undefined;
              },
            }}
            children={(field) => (
              <>
                <Input
                  label={field.name}
                  error={field.state.meta.errors.join(", ")}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </>
            )}
          />
          <form.Field
            name="password"
            validators={{
              onChange: ({ value }) => {
                if (!value) {
                  return "A password is required";
                }
                if (value.length < 8) {
                  return "Password must be at least 8";
                }
                return undefined;
              },
            }}
            children={(field) => (
              <>
                <Input
                  type="password"
                  label={field.name}
                  error={field.state.meta.errors.join(", ")}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </>
            )}
          />
          <form.Field
            name="confirmPassword"
            validators={{
              onChangeListenTo: ["password"],
              onChange: ({ value, fieldApi }) => {
                const password = fieldApi.form.getFieldValue("password")
                if (value !== password) {
                  return "Passwords do not match"
                }
                return undefined
              }
            }}
            children={(field) => (
              <>
                <Input
                  type="password"
                  label={field.name}
                  error={field.state.meta.errors.join(", ")}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}

                />
              </>
            )}
          />
        </>
        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
          children={([canSubmit, isSubmitting]) => (
            <Button
              label="Submit"
              type="submit"
              disabled={!canSubmit}
              loading={isSubmitting}
            />
          )}
        />
      </form>
    </div>
  )
}
