export function isGuid(val) {
  if (!val) return false
  const guidRe = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/
  return guidRe.test(val)
}

export function validate({ title, userId }) {
  const validationErrors = {}
  if (!title || !title.trim()) validationErrors.title = 'Title is required'
  if (!isGuid(userId)) validationErrors.userId = 'UserId must be a valid GUID'
  return validationErrors
}

export default { isGuid, validate }
