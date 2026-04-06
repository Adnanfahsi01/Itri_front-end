// Registrations are intentionally reopened across Day 1, Day 2, and Hackathon.
export const registrationClosed = false;
export const registrationOpen = !registrationClosed;

export const registrationStatusByEvent = {
  day1: false,
  day2: false,
  hackathon: false,
};

export const registrationOpenMessage = '🎉 Registrations are now OPEN! Secure your spot now.';
export const registrationUrgencyBadge = 'Limited spots available';

// Kept for backward compatibility with components still importing these names.
export const registrationClosedBadge = 'Registrations Open';
export const registrationClosedMessage = registrationOpenMessage;
export const registrationClosedSecondary = 'Limited spots available.';
