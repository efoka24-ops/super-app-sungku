export function buildUserId(user) {
  if (user?.phone) return String(user.phone).trim();
  if (user?.email) return String(user.email).trim().toLowerCase();
  return `${user?.firstName || "user"}-${user?.lastName || "unknown"}`.toLowerCase();
}

export function createToken(userId) {
  const random = Math.random().toString(36).slice(2);
  return `token_${userId}_${random}`;
}
