import { isEmail, isEmpty } from 'class-validator'
import { RRule } from 'rrule'

const duration = (value: number) => {
  if (value < 1) {
    return 'INVALID_DURATION'
  }
}

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

const recurrence = (value: string) => {
  if (!RRule.fromString(value).after(new Date())) {
    return 'INVALID_RECURRENCE'
  }
}

export const validator = {
  duration,
  email,
  name,
  password,
  recurrence,
}
