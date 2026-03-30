const parseBoolean = (rawValue, fallback = false) => {
  if (typeof rawValue === 'boolean') return rawValue;
  if (typeof rawValue !== 'string') return fallback;

  const normalized = rawValue.trim().toLowerCase();
  if (['1', 'true', 'yes', 'on'].includes(normalized)) return true;
  if (['0', 'false', 'no', 'off'].includes(normalized)) return false;

  return fallback;
};

// Default is closed so production remains protected until explicitly reopened.
export const registrationClosed = parseBoolean(import.meta.env.VITE_REGISTRATION_CLOSED, true);

export const registrationStatusByEvent = {
  day1: registrationClosed,
  day2: registrationClosed,
  hackathon: registrationClosed,
};

export const registrationClosedBadge = 'Reservations Closed';
export const registrationClosedMessage = 'Registration has ended for Day 1, Day 2, and Hackathon.';
export const registrationClosedSecondary = 'Reservations are now closed.';
