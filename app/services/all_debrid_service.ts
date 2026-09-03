export interface AllDebridUser {
  username: string
  email: string
  isPremium: boolean
  isSubscribed: boolean
  isTrial: boolean
  premiumUntil: number | string
  lang?: string
  fidelityPoints?: number
  limitedHostersQuotas?: Record<string, number>
  notifications?: string[]
}

export interface AllDebridPin {
  pin: string
  check: string
  expires_in: number
  user_url: string
  base_url: string
}

export interface AllDebridPinCheck {
  activated: boolean
  expires_in: number
  apikey?: string
}

export interface AllDebridStream {
  id: string
  ext?: string
  quality?: string | number
  filesize?: number
  name?: string
}

export interface AllDebridUnlockedLink {
  link?: string
  host?: string
  filename: string
  filesize?: number
  streams?: AllDebridStream[]
  id?: string
  hostDomain?: string
  delayed?: number
}

export interface AllDebridDelayedLink {
  status: number
  time_left: number
  link?: string
}

export interface AllDebridMagnet {
  id: number
  filename: string
  size: number
  status: string
  statusCode: number
  downloaded?: number
  uploaded?: number
  seeders?: number
  downloadSpeed?: number
  uploadSpeed?: number
  uploadDate: number
  completionDate?: number
}

export interface AllDebridMagnetUpload {
  magnet?: string
  file?: string
  hash?: string
  name?: string
  size?: number
  ready?: boolean
  id?: number
  error?: { code: string; message: string }
}

export interface AllDebridFileNode {
  n: string
  s?: number
  l?: string
  e?: AllDebridFileNode[]
}

export interface AllDebridHistoryLink {
  link: string
  filename: string
  size: number
  date: number
  host: string
}

interface ApiSuccess<T> {
  status: 'success'
  data: T
}

interface ApiFailure {
  status: 'error'
  error: {
    code: string
    message: string
  }
}

type ApiResponse<T> = ApiSuccess<T> | ApiFailure
type Fetcher = typeof fetch

const ERROR_MESSAGES: Record<string, string> = {
  AUTH_BAD_APIKEY: 'La connexion AllDebrid a expiré. Reconnectez votre compte.',
  AUTH_BLOCKED: 'Cette connexion AllDebrid est bloquée pour cette adresse réseau.',
  AUTH_USER_BANNED: 'Ce compte AllDebrid est suspendu.',
  MAINTENANCE: 'AllDebrid est en maintenance. Réessayez dans quelques minutes.',
  LINK_HOST_NOT_SUPPORTED: "Cet hébergeur n'est pas pris en charge.",
  LINK_DOWN: "Le fichier n'est plus disponible chez l’hébergeur.",
  LINK_HOST_UNAVAILABLE: 'Cet hébergeur est temporairement indisponible.',
  LINK_TOO_MANY_DOWNLOADS: 'Trop de téléchargements sont déjà en cours.',
  LINK_HOST_FULL: 'Les serveurs de l’hébergeur sont occupés. Réessayez plus tard.',
  LINK_HOST_LIMIT_REACHED: 'Le quota de cet hébergeur est atteint.',
  LINK_PASS_PROTECTED: 'Ce lien est protégé par un mot de passe.',
  LINK_TEMPORARY_UNAVAILABLE: 'Ce lien est temporairement indisponible.',
  MUST_BE_PREMIUM: 'Un abonnement AllDebrid Premium est requis.',
  MAGNET_INVALID_URI: 'Le magnet ou hash fourni est invalide.',
  MAGNET_INVALID_FILE: "Ce fichier n'est pas un torrent valide.",
  MAGNET_MUST_BE_PREMIUM: 'Un abonnement AllDebrid Premium est requis pour les magnets.',
  MAGNET_TOO_MANY_ACTIVE: 'La limite de 30 magnets actifs est atteinte.',
  MAGNET_INVALID_ID: 'Ce magnet n’existe plus ou n’est pas accessible.',
  PIN_EXPIRED: 'Le code de connexion a expiré. Générez-en un nouveau.',
  PIN_INVALID: 'Le code de connexion est invalide. Générez-en un nouveau.',
  DELAYED_INVALID_ID: 'Cette génération différée a expiré.',
}

export class AllDebridApiError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly statusCode?: number
  ) {
    super(ERROR_MESSAGES[code] ?? message ?? 'AllDebrid a retourné une erreur.')
    this.name = 'AllDebridApiError'
  }
}

export default class AllDebridService {
  private readonly baseUrl = 'https://api.alldebrid.com'

  constructor(private readonly fetcher: Fetcher = fetch) {}

  async getPin() {
    return this.request<AllDebridPin>('/v4.1/pin/get')
  }

  async checkPin(pin: string, check: string) {
    return this.request<AllDebridPinCheck>('/v4/pin/check', {
      method: 'POST',
      fields: { pin, check },
    })
  }

  async getUser(apiKey: string) {
    const data = await this.request<{ user: AllDebridUser }>('/v4/user', { apiKey })
    return data.user
  }

  async getHistory(apiKey: string) {
    const data = await this.request<{ links: AllDebridHistoryLink[] }>('/v4/user/history', {
      apiKey,
    })
    return data.links ?? []
  }

  async getSavedLinks(apiKey: string) {
    const data = await this.request<{ links: AllDebridHistoryLink[] }>('/v4/user/links', {
      apiKey,
    })
    return data.links ?? []
  }

  async getMagnets(apiKey: string, status?: 'active' | 'ready' | 'expired' | 'error') {
    const data = await this.request<{ magnets: AllDebridMagnet[] }>('/v4.1/magnet/status', {
      method: 'POST',
      apiKey,
      fields: status ? { status } : undefined,
    })
    return data.magnets ?? []
  }

  async getMagnet(apiKey: string, id: number) {
    const data = await this.request<{ magnets: AllDebridMagnet | AllDebridMagnet[] }>(
      '/v4.1/magnet/status',
      { method: 'POST', apiKey, fields: { id } }
    )
    return Array.isArray(data.magnets) ? data.magnets[0] : data.magnets
  }

  async getMagnetFiles(apiKey: string, id: number) {
    const data = await this.request<{
      magnets: Array<{
        id: number | string
        files?: AllDebridFileNode[]
        error?: { message: string }
      }>
    }>('/v4/magnet/files', {
      method: 'POST',
      apiKey,
      listFields: { id: [String(id)] },
    })
    const magnet = data.magnets?.[0]
    if (magnet?.error) {
      throw new AllDebridApiError('MAGNET_INVALID_ID', magnet.error.message)
    }
    return magnet?.files ?? []
  }

  async uploadMagnets(apiKey: string, magnets: string[]) {
    const data = await this.request<{ magnets: AllDebridMagnetUpload[] }>('/v4/magnet/upload', {
      method: 'POST',
      apiKey,
      listFields: { magnets },
    })
    return data.magnets ?? []
  }

  async uploadTorrent(apiKey: string, fileName: string, content: Uint8Array) {
    const body = new FormData()
    const bytes = content.buffer.slice(
      content.byteOffset,
      content.byteOffset + content.byteLength
    ) as ArrayBuffer
    body.append('files[]', new Blob([bytes], { type: 'application/x-bittorrent' }), fileName)
    const data = await this.request<{ files: AllDebridMagnetUpload[] }>('/v4/magnet/upload/file', {
      method: 'POST',
      apiKey,
      body,
    })
    return data.files ?? []
  }

  async deleteMagnet(apiKey: string, id: number) {
    return this.request<Record<string, unknown>>('/v4/magnet/delete', {
      method: 'POST',
      apiKey,
      fields: { id },
    })
  }

  async restartMagnet(apiKey: string, id: number) {
    return this.request<Record<string, unknown>>('/v4/magnet/restart', {
      method: 'POST',
      apiKey,
      fields: { id },
    })
  }

  async unlockLink(apiKey: string, link: string, password?: string) {
    return this.request<AllDebridUnlockedLink>('/v4/link/unlock', {
      method: 'POST',
      apiKey,
      fields: { link, ...(password ? { password } : {}) },
    })
  }

  async getStreamingLink(apiKey: string, id: string, stream: string) {
    return this.request<AllDebridUnlockedLink>('/v4/link/streaming', {
      method: 'POST',
      apiKey,
      fields: { id, stream },
    })
  }

  async getDelayedLink(apiKey: string, id: number) {
    return this.request<AllDebridDelayedLink>('/v4/link/delayed', {
      method: 'POST',
      apiKey,
      fields: { id },
    })
  }

  private async request<T>(
    path: string,
    options: {
      method?: 'GET' | 'POST'
      apiKey?: string
      fields?: Record<string, string | number>
      listFields?: Record<string, string[]>
      body?: FormData
    } = {}
  ): Promise<T> {
    const headers = new Headers({ Accept: 'application/json' })
    if (options.apiKey) {
      headers.set('Authorization', `Bearer ${options.apiKey}`)
    }

    let body: FormData | URLSearchParams | undefined = options.body
    if (!body && options.method === 'POST') {
      const form = new URLSearchParams()
      for (const [key, value] of Object.entries(options.fields ?? {})) {
        form.append(key, String(value))
      }
      for (const [key, values] of Object.entries(options.listFields ?? {})) {
        values.forEach((value) => form.append(`${key}[]`, value))
      }
      body = form
      headers.set('Content-Type', 'application/x-www-form-urlencoded;charset=UTF-8')
    }

    let response: Response
    try {
      response = await this.fetcher(`${this.baseUrl}${path}`, {
        method: options.method ?? 'GET',
        headers,
        body,
        signal: AbortSignal.timeout(20_000),
      })
    } catch (error) {
      if (error instanceof AllDebridApiError) throw error
      throw new AllDebridApiError(
        'NETWORK_ERROR',
        'Impossible de joindre AllDebrid. Vérifiez votre connexion puis réessayez.'
      )
    }

    let payload: ApiResponse<T>
    try {
      payload = (await response.json()) as ApiResponse<T>
    } catch {
      throw new AllDebridApiError(
        'INVALID_RESPONSE',
        'AllDebrid a retourné une réponse illisible.',
        response.status
      )
    }

    if (!response.ok || payload.status === 'error') {
      const error = payload.status === 'error' ? payload.error : undefined
      throw new AllDebridApiError(
        error?.code ?? `HTTP_${response.status}`,
        error?.message ?? 'La requête AllDebrid a échoué.',
        response.status
      )
    }

    return payload.data
  }
}
