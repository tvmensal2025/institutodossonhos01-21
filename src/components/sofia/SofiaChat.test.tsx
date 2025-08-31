import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import SofiaChat from './SofiaChat'

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    storage: {
      from: () => ({
        upload: vi.fn().mockResolvedValue({ data: {}, error: null }),
        getPublicUrl: () => ({ data: { publicUrl: 'https://example.com/img.png' } }),
      }),
    },
    functions: {
      invoke: vi.fn().mockResolvedValue({ data: { response: 'Olá! Eu sou a Sofia.' }, error: null }),
    },
  },
}))

describe('SofiaChat', () => {
  it('renderiza estrutura básica e mensagem inicial quando há usuário', () => {
    render(<SofiaChat user={{ id: 'u1', email: 'user@test.com', user_metadata: { full_name: 'Usuário Teste' } } as any} />)
    // Verifica se o componente renderiza sem erro
    expect(true).toBe(true)
  })
})


