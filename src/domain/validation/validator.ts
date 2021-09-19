import { isEmail, isEmpty } from 'class-validator'

const email = (value: string) => {
  if (!isEmail(value)) {
    return 'INVALID_EMAIL'
  }
}

const name = (value: string) => {
  if (isEmpty(value)) {
    return 'INVALID_NAME'
  }
}

const re = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/
const password = (value: string) => {
  if (!re.test(value)) {
    return 'INVALID_PASSWORD'
  }
}

export const validator = {
  email,
  name,
  password,
}
