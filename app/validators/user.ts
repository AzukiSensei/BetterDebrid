import vine from '@vinejs/vine'

/**
 * Shared rules for email and password.
 */
const email = () => vine.string().trim().toLowerCase().email().maxLength(254)
const password = () => vine.string().minLength(8).maxLength(128)

/**
 * Validator to use when performing self-signup.
 *
 * The "passwordConfirmation" field is declared explicitly, so that it is part
 * of the request body type shared with the frontend. Otherwise the signup form
 * has no way to know about the errors reported for this field.
 */
export const signupValidator = vine.create({
  fullName: vine.string().trim().minLength(1).maxLength(100),
  email: email().unique({ table: 'users', column: 'email' }),
  password: password().confirmed({
    confirmationField: 'passwordConfirmation',
  }),
  passwordConfirmation: vine.string().maxLength(128),
  terms: vine.accepted(),
  turnstileToken: vine.string().trim().minLength(1).maxLength(2048),
})

/**
 * Validator to use when logging in an existing user
 */
export const loginValidator = vine.create({
  email: email(),
  password: vine.string().maxLength(128),
  remember: vine.boolean().optional(),
  turnstileToken: vine.string().trim().minLength(1).maxLength(2048),
})
