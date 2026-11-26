/** Session tenant membership shape used across the app */
export type SessionTenant = {
  tenantId: string
  tenantSlug: string
  role: string
  permissions?: string[]
}
