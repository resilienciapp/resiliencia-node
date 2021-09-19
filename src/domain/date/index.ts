import { GraphQLScalarType, Kind } from 'graphql'

export const date = new GraphQLScalarType({
  description: 'Date custom scalar type',
  name: 'Date',
  parseLiteral: ast => (ast.kind === Kind.STRING ? new Date(ast.value) : null),
  parseValue: (value: string) => new Date(value),
  serialize: (value: string | Date) => new Date(value).toISOString(),
})
