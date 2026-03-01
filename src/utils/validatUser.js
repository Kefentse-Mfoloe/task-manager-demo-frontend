export function validateEmail(editedEmail) {
  return editedEmail && editedEmail.includes('@')
}

export function validatePassword(editedPassword) {
  if (!editedPassword || editedPassword.length < 8) return false
  const hasUpper = /[A-Z]/.test(editedPassword)
  const hasLower = /[a-z]/.test(editedPassword)
  const hasDigit = /[0-9]/.test(editedPassword)
  return hasUpper && hasLower && hasDigit
}

export function validate({ firstName, lastName, email, password }) {
  const errorObject = {}
  if (!firstName || !firstName.trim()) errorObject.firstName = 'First name is required'
  if (!lastName || !lastName.trim()) errorObject.lastName = 'Last name is required'
  if (!validateEmail(email)) errorObject.email = 'Valid email is required'
  if (!validatePassword(password)) errorObject.password = 'Password must be 8+ chars with upper, lower and digit'
  return errorObject
}

export default { validateEmail, validatePassword, validate }
