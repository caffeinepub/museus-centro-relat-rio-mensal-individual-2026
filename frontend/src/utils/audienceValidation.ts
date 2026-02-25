export interface AudienceValidationResult {
  isValid: boolean;
  errorMessage: string | null;
  total: number;
}

export function validateAudience(
  totalAudience: number,
  children: number,
  youth: number,
  adults: number,
  elderly: number,
  pcd: number
): AudienceValidationResult {
  const total = children + youth + adults + elderly + pcd;
  if (total > totalAudience) {
    return {
      isValid: false,
      errorMessage: `A soma dos perfis (${total}) não pode ultrapassar o público total (${totalAudience}).`,
      total,
    };
  }
  return { isValid: true, errorMessage: null, total };
}
