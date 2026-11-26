import { describe, expect, it } from 'vitest'
import { RESERVED_SUBDOMAINS, RESERVED_SIGNUP_SLUGS, hubHost } from '../../src/lib/platform'

describe('platform reserved slugs', () => {
  it('reserves product and platform subdomains', () => {
    for (const s of [
      'www',
      'eticaret',
      'admin',
      'app',
      'api',
      'mail',
      'randevu',
      'yonet',
      'ajans',
      'otel',
      'menu',
      'panel',
    ]) {
      expect(RESERVED_SUBDOMAINS.has(s)).toBe(true)
      expect(RESERVED_SIGNUP_SLUGS.has(s)).toBe(true)
    }
  })

  it('allows typical store slugs', () => {
    expect(RESERVED_SUBDOMAINS.has('shopmagaza')).toBe(false)
    expect(RESERVED_SIGNUP_SLUGS.has('shopmagaza')).toBe(false)
  })

  it('builds hub host under platform domain', () => {
    expect(hubHost('posa360.com')).toBe('eticaret.posa360.com')
  })
})
