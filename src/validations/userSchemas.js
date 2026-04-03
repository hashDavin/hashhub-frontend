import * as yup from 'yup'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const trimmedRequired = (label) =>
  yup
    .string()
    .transform((value) => (typeof value === 'string' ? value.trim() : value))
    .required(`${label} is required.`)

export const createEmployeeSchema = yup.object({
  name: trimmedRequired('Name'),
  email: yup
    .string()
    .transform((value) => (typeof value === 'string' ? value.trim() : value))
    .matches(emailRegex, 'Please enter a valid email address.')
    .required('Email is required.'),
  password: yup
    .string()
    .transform((value) => (typeof value === 'string' ? value.trim() : value))
    .min(8, 'Password must be at least 8 characters long.')
    .required('Password is required.'),
})

export const editEmployeeSchema = yup.object({
  name: trimmedRequired('Name'),
  email: yup
    .string()
    .transform((value) => (typeof value === 'string' ? value.trim() : value))
    .matches(emailRegex, 'Please enter a valid email address.')
    .required('Email is required.'),
  password: yup
    .string()
    .transform((value) => (typeof value === 'string' ? value.trim() : value))
    .test(
      'min-if-filled',
      'Password must be at least 8 characters long.',
      (value) => !value || value.length >= 8
    ),
})
