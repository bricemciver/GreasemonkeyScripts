/**
 * Get an item from session storage
 * @param key key to get
 * @param defaultVal value to return if key doesn't exist
 */
export const getItemFromSessionStorage = (key: string, defaultVal: any) => {
  const val = window.sessionStorage.getItem(key)
  if (!val || val === 'undefined') return defaultVal
  try {
    return JSON.parse(val)
  } catch (_e) {
    return val
  }
}

/**
 * Set an item into storage
 * @param key key to set
 * @param value value to set
 */
export const setItemInSessionStorage = (key: string, value: any) => {
  window.sessionStorage.setItem(key, JSON.stringify(value))
}
