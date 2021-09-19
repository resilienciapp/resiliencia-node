import { compareSync, hashSync } from 'bcrypt'

export const encrypt = (data: string | Buffer) => hashSync(data, 10)

export const compare = (data: string | Buffer, encrypted: string) =>
  compareSync(data, encrypted)
