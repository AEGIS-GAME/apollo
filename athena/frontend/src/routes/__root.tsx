import Header from "@/components/layout/Header"
import { useMe } from "@/hooks/useMe"
import { TanstackDevtools } from "@tanstack/react-devtools"
import { Outlet, createRootRoute } from "@tanstack/react-router"
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools"

export const Route = createRootRoute({
  head: () => ({
    links: [{ rel: "icon", href: "/favicon.ico" }],
  }),
  component: () => {
    useMe()

    return (
      <>
        <Header />
        <Outlet />
        <TanstackDevtools
          config={{
            position: "bottom-left",
          }}
          plugins={[
            {
              name: "Tanstack Router",
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
      </>
    )
  },
})
