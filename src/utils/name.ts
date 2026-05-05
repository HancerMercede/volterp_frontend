export function getFirstName(fullName?: string): string {
  return fullName?.split(' ')[0] || '';
}

export function getInitials(fullName?: string): string {
  const parts = fullName?.split(' ') || [];
  return parts.length >= 2 
    ? `${parts[0]?.[0] || ''}${parts[1]?.[0] || ''}`.toUpperCase() 
    : (parts[0]?.substring(0, 2).toUpperCase() || '');
}