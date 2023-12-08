import { UseMutateFunction, useMutation } from '@tanstack/react-query';
import { useCustomToast } from 'components/app/hooks/useCustomToast';
import jsonpatch from 'fast-json-patch';

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
  const { mutate: patchUser } = useMutation({
    mutationFn: (newUserData: User) => patchUserOnServer(newUserData, user),
    onSuccess: (newUserData: User | null) => {
      if (user) {
        updateUser(newUserData);
        toast({
          title: 'The user information has updated',
          status: 'success',
        });
      }
    },
  });

  return patchUser;
}
