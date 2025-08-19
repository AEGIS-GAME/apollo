import LoginForm from "@/components/forms/LoginForm"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/login")({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4">
      <div className="w-full max-w-md">
        <LoginForm />
      </div>
    </div>
  )
}
