export { checkPassword, COMMON_PASSWORDS, type PasswordCheck } from '../../components/molecule/PasswordField/strength';

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const isEmail = (s: string) => EMAIL_RE.test(s.trim());
export const normalizeEmail = (s: string) => s.trim().toLowerCase();
/** a•••y@demo.petrock.test - keeps first and last character of the local part. */
export function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain) return email;
  if (local.length <= 2) return `${local[0] ?? ''}•••@${domain}`;
  return `${local[0]}•••${local[local.length - 1]}@${domain}`;
}
/** Loose US phone check: 10 digits (optionally +1). Optional field, so empty is fine. */
export const isPhone = (s: string) => s.trim() === '' || /^(\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/.test(s.trim());
