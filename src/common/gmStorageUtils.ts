/**
 * Typed wrappers around the userscript manager's value store.
 *
 * Unlike the sessionStorage helpers in storageUtils.ts, these values survive a browser
 * restart and are shared by every tab running the script, which is what state that has
 * to be remembered from one day (or one year) to the next requires.
 *
 * A script using these must declare the matching GM_getValue/GM_setValue/GM_deleteValue
 * grants in its manifest.
 */

/**
 * Get a value from userscript storage
 * @param key key to get
 * @param defaultVal value to return if key doesn't exist
 */
export const getStoredValue = <T>(key: string, defaultVal: T): T => GM_getValue<T>(key, defaultVal)

/**
 * Set a value in userscript storage
 * @param key key to set
 * @param value value to set
 */
export const setStoredValue = <T>(key: string, value: T): void => {
  GM_setValue(key, value)
}

/**
 * Remove a value from userscript storage
 * @param key key to remove
 */
export const deleteStoredValue = (key: string): void => {
  GM_deleteValue(key)
}
