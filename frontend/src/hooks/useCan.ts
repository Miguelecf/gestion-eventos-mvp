type PermissionCheck = (action: string, subject?: string) => boolean;

export function useCan(): PermissionCheck {
  return () => false;
}

