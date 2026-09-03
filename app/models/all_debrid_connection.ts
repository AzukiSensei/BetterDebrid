import encryption from '@adonisjs/core/services/encryption'
import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class AllDebridConnection extends BaseModel {
  static table = 'all_debrid_connections'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column({ serializeAs: null })
  declare encryptedApiKey: string

  @column()
  declare username: string | null

  @column()
  declare accountEmail: string | null

  @column()
  declare isPremium: boolean

  @column.dateTime()
  declare premiumUntil: DateTime | null

  @column.dateTime()
  declare lastSyncedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  setApiKey(apiKey: string) {
    this.encryptedApiKey = encryption.encrypt(apiKey)
  }

  getApiKey() {
    const apiKey = encryption.decrypt<string>(this.encryptedApiKey)
    if (!apiKey) {
      throw new Error('Impossible de déchiffrer la connexion AllDebrid')
    }
    return apiKey
  }
}
