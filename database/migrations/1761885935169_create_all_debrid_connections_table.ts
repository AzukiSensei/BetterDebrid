import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'all_debrid_connections'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table
        .integer('user_id')
        .unsigned()
        .notNullable()
        .unique()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
      table.text('encrypted_api_key').notNullable()
      table.string('username', 100).nullable()
      table.string('account_email', 254).nullable()
      table.boolean('is_premium').notNullable().defaultTo(false)
      table.timestamp('premium_until', { useTz: true }).nullable()
      table.timestamp('last_synced_at', { useTz: true }).nullable()
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
