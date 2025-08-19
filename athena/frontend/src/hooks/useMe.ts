// import { useQuery, useMutation } from "@tanstack/react-query"
// import { getCurrentUser, deleteCurrentUser } from "@/api/user/me"
// import { useAuthStore } from "@/stores/authStore"
// import { useEffect } from "react"
//
// export function useMe() {
//   const setUser = useAuthStore((s) => s.setUser)
//
//   const query = useQuery({
//     staleTime: 5 * 60 * 1000,
//     queryKey: ["me"],
//     queryFn: getCurrentUser,
//     select: (res) => ({
//       id: res.id,
//       username: res.username,
//       isAdmin: res.is_admin,
//     }),
//   })
//
//   useEffect(() => {
//     if (query.isSuccess && query.data) {
//       setUser(query.data)
//     }
//   }, [query.isSuccess, query.data, setUser])
//
//   return query
// }
//
// export function useDeleteMe() {
//   const logout = useAuthStore((s) => s.logout)
//
//   return useMutation({
//     mutationFn: deleteCurrentUser,
//     onSuccess: () => logout(),
//   })
// }
