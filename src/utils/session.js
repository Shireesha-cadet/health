const USER_KEY = "ai-smart-care-user"

export function setCurrentUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function getCurrentUser() {
  const saved = localStorage.getItem(USER_KEY)
  return saved ? JSON.parse(saved) : null
}

export function clearCurrentUser() {
  localStorage.removeItem(USER_KEY)
}
