const escapeMap = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#039;',
};

export const sanitizeString = (value) => String(value || '')
  .trim()
  .replace(/[&<>"']/g, (char) => escapeMap[char]);

export const sanitizeObjectStrings = (value) => {
  if (typeof value === 'string') return sanitizeString(value);
  if (Array.isArray(value)) return value.map(sanitizeObjectStrings);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, sanitizeObjectStrings(item)]),
    );
  }
  return value;
};

export const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());

export const validatePasswordStrength = (password) => {
  const value = String(password || '');
  const hasLength = value.length >= 8;
  const hasLetter = /[A-Za-z]/.test(value);
  const hasNumber = /\d/.test(value);

  return {
    valid: hasLength && hasLetter && hasNumber,
    reason: !hasLength
      ? 'Password must be at least 8 characters.'
      : !hasLetter
        ? 'Password must include at least one letter.'
        : !hasNumber
          ? 'Password must include at least one number.'
          : '',
  };
};
