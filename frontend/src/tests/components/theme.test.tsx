import { describe, it, expect } from 'vitest'

describe('theme', () => {
  it('test_theme_toggle', () => {
    document.documentElement.classList.remove('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
    document.documentElement.classList.add('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    document.documentElement.classList.remove('dark')
  })
})
