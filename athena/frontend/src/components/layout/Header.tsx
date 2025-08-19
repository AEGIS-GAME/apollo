import { Link, useMatchRoute } from "@tanstack/react-router"
import { Route as loginRoute } from "@/routes/login"
import { Route as registerRoute } from "@/routes/register"
import { Route as homeRoute } from "@/routes/index"
import Button from "../ui/Button"
import { useAuthStore } from "@/stores/authStore"
import { useIsLoggedIn } from "@/api/user/useUser"
import { useEffect } from "react"
import { useLogout } from "@/api/auth/useAuth"
import { useQueryClient } from "@tanstack/react-query"

export default function Header(): React.JSX.Element | null {
  const queryClient = useQueryClient()
  const logout = useLogout(queryClient)

  const setIsLoggedIn = useAuthStore((s) => s.setIsLoggedIn)
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn)
  const query = useIsLoggedIn()

  useEffect(() => {
    if (query.data !== undefined) {
      setIsLoggedIn(query.data)
    }
  }, [query.data, setIsLoggedIn])

  const hideHeaderRoutes = [loginRoute.to, registerRoute.to]
  const matchRoute = useMatchRoute()

  const matchedHideHeaderRoutes = hideHeaderRoutes.some((route) =>
    matchRoute({ to: route }),
  )

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
          {isLoggedIn ? (
            <Button label="Logout" onClick={() => logout.mutate()} />
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
