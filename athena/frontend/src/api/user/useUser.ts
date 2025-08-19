import { useQuery, type UseQueryResult } from "@tanstack/react-query"
import { tokenVerify } from "../auth/useAuth"

export function useIsLoggedIn(): UseQueryResult<boolean> {
  return useQuery({
    queryKey: ["loggedIn"],
    queryFn: async () => await tokenVerify(),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  })
}
