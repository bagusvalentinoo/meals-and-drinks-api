import jwt from 'jsonwebtoken'

/**
 * Get expiry token date time
 *
 * @param {string} token - JWT token
 * @returns {Date} - Expiry token date time
 */
export const getExpiryTokenDateTime = (token: string): Date => {
  const decoded = jwt.decode(token) as { exp: number }

  return new Date(decoded.exp * 1000)
}
