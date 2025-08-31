import { describe, it, expect } from 'vitest'
import { getRandomEmoji, generateAvatarUrl, getUserAvatar } from './avatar-utils'

describe('avatar-utils', () => {
  it('getRandomEmoji returns a deterministic emoji per name', () => {
    const a = getRandomEmoji('Ana Maria')
    const b = getRandomEmoji('Ana Maria')
    expect(a).toBe(b)
  })

  it('generateAvatarUrl builds a dicebear url with seed', () => {
    const url = generateAvatarUrl('João Silva')
    expect(url).toContain('api.dicebear.com')
    expect(url).toContain('seed=Jo%C3%A3o%20Silva')
  })

  it('getUserAvatar prefers photo when provided', () => {
    const result = getUserAvatar('https://example.com/photo.jpg', 'User X')
    expect(result.type).toBe('photo')
    expect(result.value).toContain('example.com')
  })
})


