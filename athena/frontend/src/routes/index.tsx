import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/")({
  component: App,
})

function App() {
  return (
    <div className="w-full h-screen flex items-center justify-center"></div>
  )
}
