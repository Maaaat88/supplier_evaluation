import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AuthenticatedUser, LoginInput } from 'shared';
import { apiFetch } from '../lib/api.js';

const AUTH_QUERY_KEY = ['auth', 'me'] as const;

export function useAuth() {
  const queryClient = useQueryClient();

  const meQuery = useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn: () => apiFetch<AuthenticatedUser>('/auth/me'),
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: (input: LoginInput) =>
      apiFetch<AuthenticatedUser>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
    onSuccess: (user) => {
      queryClient.setQueryData(AUTH_QUERY_KEY, user);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => apiFetch<void>('/auth/logout', { method: 'POST' }),
    onSuccess: () => {
      queryClient.setQueryData(AUTH_QUERY_KEY, null);
      queryClient.clear();
    },
  });

  return {
    user: meQuery.data ?? null,
    isLoading: meQuery.isLoading,
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    logout: logoutMutation.mutate,
  };
}
