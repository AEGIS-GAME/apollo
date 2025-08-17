import { useMutation } from "@tanstack/react-query";
import { register } from "../api/auth";

export function useRegister() {
  return useMutation({
    mutationFn: ({ username, password }: { username: string; password: string }) =>
      register(username, password),
  });
}
