import { createAvatar } from '@dicebear/core';

export function convertAvatarToBlob(avatar: ReturnType<typeof createAvatar>) {
  return new Blob([avatar.toString()], { type: 'image/svg+xml' });
}
