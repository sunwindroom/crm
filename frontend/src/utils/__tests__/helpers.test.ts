import { describe, it, expect } from 'vitest'

describe('Utility Functions', () => {
  describe('formatMoney', () => {
    it('should format money correctly', () => {
      const formatMoney = (value: number) => {
        return (value / 10000).toFixed(2) + '万'
      }

      expect(formatMoney(100000)).toBe('10.00万')
      expect(formatMoney(500000)).toBe('50.00万')
      expect(formatMoney(1234567)).toBe('123.46万')
    })
  })

  describe('formatFileSize', () => {
    it('should format file size correctly', () => {
      const formatFileSize = (size: number) => {
        if (size < 1024) return size + ' B'
        if (size < 1024 * 1024) return (size / 1024).toFixed(2) + ' KB'
        return (size / (1024 * 1024)).toFixed(2) + ' MB'
      }

      expect(formatFileSize(500)).toBe('500 B')
      expect(formatFileSize(2048)).toBe('2.00 KB')
      expect(formatFileSize(5242880)).toBe('5.00 MB')
    })
  })

  describe('validatePhone', () => {
    it('should validate phone number correctly', () => {
      const phoneRegex = /^1[3-9]\d{9}$/

      expect(phoneRegex.test('13800138000')).toBe(true)
      expect(phoneRegex.test('15912345678')).toBe(true)
      expect(phoneRegex.test('12345678901')).toBe(false)
      expect(phoneRegex.test('1380013800')).toBe(false)
    })
  })

  describe('validateEmail', () => {
    it('should validate email correctly', () => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

      expect(emailRegex.test('test@example.com')).toBe(true)
      expect(emailRegex.test('user.name@domain.co')).toBe(true)
      expect(emailRegex.test('invalid-email')).toBe(false)
      expect(emailRegex.test('test@')).toBe(false)
    })
  })
})
