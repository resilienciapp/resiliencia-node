import { client } from 'db'

export const categories = () => client().category.findMany()
