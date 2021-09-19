import { createStubCategory } from '__mocks__/category'
import { client } from 'db'

import { categories } from '.'

jest.mock('db')

const mockClient = client as jest.Mock

const mockFindMany = jest.fn()

const stubCategory = createStubCategory()

describe('categories', () => {
  beforeEach(() => {
    mockClient.mockReturnValue({
      category: { findMany: mockFindMany },
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('returns an empty list of categories', () => {
    mockFindMany.mockResolvedValue([])

    expect(categories()).resolves.toEqual([])
  })

  it('returns the list of categories', () => {
    mockFindMany.mockResolvedValue([stubCategory])

    expect(categories()).resolves.toEqual([
      {
        created_at: new Date('2000-05-25'),
        description: 'Entrega de comida.',
        id: 1,
        name: 'Olla Popular',
        updated_at: new Date('2000-05-25'),
      },
    ])
  })
})
