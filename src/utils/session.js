/**
 * Session storage — uses sessionStorage so it clears when browser/tab closes.
 * This ensures landing page always shows on fresh app open.
 */
const USER_KEY = "ai-smart-care-user"

export function setCurrentUser(user) {
  sessionStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function getCurrentUser() {
  const saved = sessionStorage.getItem(USER_KEY)
  return saved ? JSON.parse(saved) : null
}

export function clearCurrentUser() {
  sessionStorage.removeItem(USER_KEY)
}
