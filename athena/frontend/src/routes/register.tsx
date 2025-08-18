import RegisterForm from "@/components/forms/RegisterForm"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/register")({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4">
      <div className="w-full max-w-md">
        <RegisterForm />
      </div>
    </div>
  )
}
