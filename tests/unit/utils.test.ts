import { describe, it, expect } from '@jest/globals'
import { formatCurrency, formatDate, generateOrderNumber } from '@/lib/utils'

describe('Utils', () => {
  describe('formatCurrency', () => {
    it('should format Turkish Lira correctly', () => {
      expect(formatCurrency(1234.56)).toBe('₺1.234,56')
      expect(formatCurrency(1000)).toBe('₺1.000,00')
      expect(formatCurrency(0.99)).toBe('₺0,99')
    })
  })

  describe('formatDate', () => {
    it('should format date in Turkish locale', () => {
      const date = new Date('2024-11-26T10:30:00')
      const formatted = formatDate(date)
      expect(formatted).toContain('26')
      expect(formatted).toContain('2024')
    })
  })

  describe('generateOrderNumber', () => {
    it('should generate unique order numbers', () => {
      const order1 = generateOrderNumber()
      const order2 = generateOrderNumber()
      expect(order1).toMatch(/^ORD-\d{10}$/)
      expect(order2).toMatch(/^ORD-\d{10}$/)
      expect(order1).not.toBe(order2)
    })
  })
})
