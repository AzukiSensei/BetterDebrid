import vine from '@vinejs/vine'

export const pinCheckValidator = vine.compile(
  vine.object({
    pin: vine.string().trim().minLength(4).maxLength(20),
    check: vine.string().trim().minLength(8).maxLength(200),
  })
)

export const unlockLinkValidator = vine.compile(
  vine.object({
    link: vine
      .string()
      .trim()
      .url({ protocols: ['http', 'https'] })
      .maxLength(4096),
    password: vine.string().trim().maxLength(500).optional(),
  })
)

export const delayedLinkValidator = vine.compile(
  vine.object({
    id: vine.number().positive(),
  })
)

export const streamingLinkValidator = vine.compile(
  vine.object({
    id: vine.string().trim().minLength(1).maxLength(200),
    stream: vine.string().trim().minLength(1).maxLength(200),
  })
)

export const magnetUploadValidator = vine.compile(
  vine.object({
    magnets: vine.string().trim().minLength(20).maxLength(12000),
  })
)

export const magnetIdValidator = vine.compile(
  vine.object({
    id: vine.number().positive(),
  })
)
