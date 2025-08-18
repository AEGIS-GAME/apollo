import { Link, useMatchRoute } from "@tanstack/react-router"
import { Route as loginRoute } from "@/routes/login"
import { Route as registerRoute } from "@/routes/register"
import { Route as homeRoute } from "@/routes/index"
import Button from "../ui/Button"
import { useAuthStore } from "@/stores/authStore"
import { useLogout } from "@/hooks/useAuth"

export default function Header(): React.JSX.Element | null {
  const hideHeaderRoutes = [loginRoute.to, registerRoute.to]
  const matchRoute = useMatchRoute()

  const matchedHideHeaderRoutes = hideHeaderRoutes.some((route) =>
    matchRoute({ to: route }),
  )

  const user = useAuthStore((s) => s.user)
  const { mutate: logout } = useLogout()

  if (matchedHideHeaderRoutes) return null


  return (
    <header className="fixed top-0 z-10 w-full bg-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to={homeRoute.to} className="flex items-center">
          <img
            className="h-8 w-auto cursor-pointer"
            src="/favicon-dark.ico"
            alt="Aegis Logo"
          />
        </Link>

        <div className="flex gap-3">
          {user ? (
            <Button label="Logout" onClick={() => logout()} />
          ) : (
            <>
              <Link to={loginRoute.to}>
                <Button label="Login" />
              </Link>
              <Link to={registerRoute.to}>
                <Button label="Register" variant="secondary" />
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
