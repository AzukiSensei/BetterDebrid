import AllDebridConnection from '#models/all_debrid_connection'

export async function findConnection(userId: number) {
  return AllDebridConnection.query().where('userId', userId).first()
}

export async function requireConnection(userId: number) {
  const connection = await findConnection(userId)
  if (!connection) {
    throw new Error('Connectez votre compte AllDebrid pour utiliser cette fonctionnalité.')
  }
  return connection
}
