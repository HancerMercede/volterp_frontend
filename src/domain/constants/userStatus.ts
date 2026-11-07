export const UserStatus = {
  INVITED: 'invited',
  ACTIVE: 'active',
  INACTIVE: 'inactive',
} as const;

export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];

export const USER_STATUSES: readonly UserStatus[] = [
  UserStatus.INVITED,
  UserStatus.ACTIVE,
  UserStatus.INACTIVE,
];

export function isUserStatus(value: unknown): value is UserStatus {
  return (
    typeof value === 'string' &&
    (USER_STATUSES as readonly string[]).includes(value)
  );
}

// `status` only exists since the invitation flow; `isActive` stays the fallback.
export function resolveUserStatus(user: {
  status?: string | null;
  isActive: boolean;
}): UserStatus {
  const raw =
    typeof user.status === 'string' ? user.status.trim().toLowerCase() : null;

  if (raw && isUserStatus(raw)) return raw;

  return user.isActive ? UserStatus.ACTIVE : UserStatus.INACTIVE;
}
