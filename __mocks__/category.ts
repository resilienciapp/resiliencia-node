import { Category } from '@prisma/client'

export const createStubCategory = (opts?: Partial<Category>): Category => ({
  created_at: new Date('2000-05-25T00:00:00.000Z'),
  description: 'Entrega de comida.',
  id: 1,
  name: 'Olla Popular',
  updated_at: new Date('2000-05-25T00:00:00.000Z'),
  ...opts,
})
