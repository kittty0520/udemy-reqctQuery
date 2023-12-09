import {
  UseMutateFunction,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { useCustomToast } from 'components/app/hooks/useCustomToast';
import jsonpatch from 'fast-json-patch';
import { queryKeys } from 'react-query/constants';

import type { User } from '../../../../../shared/types';
import { axiosInstance, getJWTHeader } from '../../../axiosInstance';
import { useUser } from './useUser';

// for when we need a server function
async function patchUserOnServer(
  newData: User | null,
  originalData: User | null,
): Promise<User | null> {
  if (!newData || !originalData) return null;
  // create a patch for the difference between newData and originalData
  const patch = jsonpatch.compare(originalData, newData);

  // send patched data to the server
  const { data } = await axiosInstance.patch(
    `/user/${originalData.id}`,
    { patch },
    {
      headers: getJWTHeader(originalData),
    },
  );
  return data.user;
}

export function usePatchUser(): UseMutateFunction<
  User,
  unknown,
  User,
  unknown
> {
  const { user, updateUser } = useUser();
  const toast = useCustomToast();
  const queryClient = useQueryClient();

  const { mutate: patchUser } = useMutation({
    mutationFn: (newData: User) => patchUserOnServer(newData, user),
    // onMutate returns context that is passsed to onError
    onMutate: async (newData: User | null) => {
      // user Data에 대해 진행중인 쿼리를 취소하여 오래된 서버 데이터가
      // 낙관적 업데이트를 오버라이드 하지 않도록 한다.
      queryClient.cancelQueries({ queryKey: [queryKeys.user], exact: true });

      // 이전 user data를 스냅샷한다.
      const previousUserData: User = queryClient.getQueryData([queryKeys.user]);

      // optimistically update the cache with new user value
      updateUser(newData);

      // return context object with snapshotted value
      return { previousUserData };
    },
    onSuccess: (newUserData: User | null) => {
      if (user) {
        toast({
          title: 'The user information has updated',
          status: 'success',
        });
      }
    },
    onError: (error, newData, context) => {
      // roll back cache to saved value
      if (context.previousUserData) {
        updateUser(context.previousUserData);
        toast({
          title: 'Update failed : restoring previous values',
          status: 'warning',
        });
      }
    },
    onSettled: () => {
      // invalidate user query to make sure we're in sync with server data
      queryClient.invalidateQueries({
        queryKey: [queryKeys.user],
      });
    },
  });

  return patchUser;
}
