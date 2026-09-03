import axios from 'axios'
import { useEffect } from 'react'
import { toast } from 'sonner'

function toolResult(value: unknown) {
  return value
}

export function useWebMcp(enabled: boolean) {
  useEffect(() => {
    if (!document.modelContext) return

    const controller = new AbortController()
    const modelContext = document.modelContext
    const publicTools: ModelContextTool[] = [
      {
        name: 'betterdebrid.open_public_view',
        title: 'Ouvrir une page BetterDebrid',
        description:
          'Ouvre une page publique BetterDebrid dans l’onglet courant sans lire ni modifier de données.',
        inputSchema: {
          type: 'object',
          properties: {
            view: {
              type: 'string',
              enum: ['home', 'login', 'signup', 'privacy', 'legal'],
              description: 'Page publique à ouvrir.',
            },
          },
          required: ['view'],
          additionalProperties: false,
        },
        annotations: { readOnlyHint: true, untrustedContentHint: false },
        async execute(input) {
          const routes: Record<string, string> = {
            home: '/',
            login: '/connexion',
            signup: '/inscription',
            privacy: '/confidentialite',
            legal: '/mentions-legales',
          }
          const view = String(input.view)
          const route = routes[view]
          if (!route) throw new Error('Page BetterDebrid inconnue.')
          window.location.assign(route)
          return toolResult({ opened: view })
        },
      },
    ]
    const authenticatedTools: ModelContextTool[] = [
      {
        name: 'betterdebrid.get_status',
        title: 'État BetterDebrid',
        description:
          'Retourne le statut du compte AllDebrid connecté et la liste courante des magnets. Lecture seule.',
        inputSchema: { type: 'object', properties: {}, additionalProperties: false },
        annotations: { readOnlyHint: true, untrustedContentHint: true },
        async execute(_input, { signal }) {
          const { data } = await axios.get('/api/webmcp/status', { signal })
          return toolResult(data)
        },
      },
      {
        name: 'betterdebrid.unlock_link',
        title: 'Débrider un lien',
        description:
          'Déverrouille un lien pris en charge avec le compte AllDebrid connecté. Peut consommer un quota hébergeur ; confirmed doit être vrai après accord de l’utilisateur.',
        inputSchema: {
          type: 'object',
          properties: {
            link: {
              type: 'string',
              format: 'uri',
              maxLength: 2048,
              description: 'URL HTTP ou HTTPS à déverrouiller.',
            },
            password: {
              type: 'string',
              maxLength: 256,
              description: 'Mot de passe optionnel du lien.',
            },
            confirmed: {
              type: 'boolean',
              description: 'Confirmation explicite de l’utilisateur pour consommer son quota.',
            },
          },
          required: ['link', 'confirmed'],
          additionalProperties: false,
        },
        annotations: { readOnlyHint: false, untrustedContentHint: true },
        async execute(input, { signal }) {
          if (input.confirmed !== true) {
            throw new Error('Une confirmation explicite est requise avant le déverrouillage.')
          }
          const { data } = await axios.post(
            '/api/webmcp/unlock',
            { link: input.link, password: input.password },
            { signal }
          )
          toast.success('Lien déverrouillé via WebMCP')
          return toolResult(data)
        },
      },
      {
        name: 'betterdebrid.add_magnet',
        title: 'Ajouter un magnet',
        description:
          'Ajoute un ou plusieurs magnets ou hashes au compte AllDebrid. confirmed doit être vrai après accord de l’utilisateur.',
        inputSchema: {
          type: 'object',
          properties: {
            magnets: {
              type: 'string',
              minLength: 20,
              maxLength: 120000,
              description: 'Un magnet ou hash par ligne, 30 au maximum.',
            },
            confirmed: {
              type: 'boolean',
              description: 'Confirmation explicite de l’utilisateur avant l’ajout.',
            },
          },
          required: ['magnets', 'confirmed'],
          additionalProperties: false,
        },
        annotations: { readOnlyHint: false, untrustedContentHint: true },
        async execute(input, { signal }) {
          if (input.confirmed !== true) {
            throw new Error('Une confirmation explicite est requise avant l’ajout.')
          }
          const { data } = await axios.post(
            '/api/webmcp/magnets',
            { magnets: input.magnets },
            { signal }
          )
          toast.success('Magnet ajouté via WebMCP')
          return toolResult(data)
        },
      },
      {
        name: 'betterdebrid.select_stream',
        title: 'Choisir une qualité vidéo',
        description:
          'Transforme un identifiant de génération et une qualité AllDebrid en lien direct ou différé. Peut consommer un quota ; confirmed doit être vrai.',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              minLength: 1,
              maxLength: 256,
              description: 'Identifiant reçu lors du déverrouillage.',
            },
            stream: {
              type: 'string',
              minLength: 1,
              maxLength: 256,
              description: 'Identifiant de qualité retourné par AllDebrid.',
            },
            confirmed: { type: 'boolean', description: 'Confirmation explicite de l’utilisateur.' },
          },
          required: ['id', 'stream', 'confirmed'],
          additionalProperties: false,
        },
        annotations: { readOnlyHint: false, untrustedContentHint: true },
        async execute(input, { signal }) {
          if (input.confirmed !== true) throw new Error('Une confirmation explicite est requise.')
          const { data } = await axios.post(
            '/api/webmcp/stream',
            { id: input.id, stream: input.stream },
            { signal }
          )
          return toolResult(data)
        },
      },
      {
        name: 'betterdebrid.check_delayed_link',
        title: 'Vérifier un lien différé',
        description: 'Vérifie si une génération AllDebrid différée est prête. Lecture seule.',
        inputSchema: {
          type: 'object',
          properties: {
            id: { type: 'integer', minimum: 1, description: 'Identifiant différé AllDebrid.' },
          },
          required: ['id'],
          additionalProperties: false,
        },
        annotations: { readOnlyHint: true, untrustedContentHint: true },
        async execute(input, { signal }) {
          const { data } = await axios.post('/api/webmcp/delayed', { id: input.id }, { signal })
          return toolResult(data)
        },
      },
      {
        name: 'betterdebrid.get_magnet_files',
        title: 'Fichiers d’un magnet',
        description:
          'Retourne l’arborescence et les liens disponibles pour un magnet AllDebrid prêt. Lecture seule.',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              minimum: 1,
              description: 'Identifiant numérique du magnet AllDebrid.',
            },
          },
          required: ['id'],
          additionalProperties: false,
        },
        annotations: { readOnlyHint: true, untrustedContentHint: true },
        async execute(input, { signal }) {
          const id = Number(input.id)
          const { data } = await axios.get(`/api/webmcp/magnets/${id}/files`, { signal })
          return toolResult(data)
        },
      },
      {
        name: 'betterdebrid.restart_magnet',
        title: 'Relancer un magnet',
        description:
          'Relance un magnet AllDebrid en erreur. confirmed doit être vrai après accord de l’utilisateur.',
        inputSchema: {
          type: 'object',
          properties: {
            id: { type: 'integer', minimum: 1, description: 'Identifiant du magnet à relancer.' },
            confirmed: { type: 'boolean', description: 'Confirmation explicite de l’utilisateur.' },
          },
          required: ['id', 'confirmed'],
          additionalProperties: false,
        },
        annotations: { readOnlyHint: false, untrustedContentHint: false },
        async execute(input, { signal }) {
          if (input.confirmed !== true) throw new Error('Une confirmation explicite est requise.')
          const { data } = await axios.post(
            '/api/webmcp/magnets/restart',
            { id: input.id },
            { signal }
          )
          toast.success('Magnet relancé via WebMCP')
          return toolResult(data)
        },
      },
      {
        name: 'betterdebrid.delete_magnet',
        title: 'Supprimer un magnet',
        description:
          'Supprime définitivement un magnet du compte AllDebrid. confirmed doit être vrai après accord explicite de l’utilisateur.',
        inputSchema: {
          type: 'object',
          properties: {
            id: { type: 'integer', minimum: 1, description: 'Identifiant du magnet à supprimer.' },
            confirmed: {
              type: 'boolean',
              description: 'Confirmation explicite de la suppression définitive.',
            },
          },
          required: ['id', 'confirmed'],
          additionalProperties: false,
        },
        annotations: { readOnlyHint: false, untrustedContentHint: false },
        async execute(input, { signal }) {
          if (input.confirmed !== true) throw new Error('Une confirmation explicite est requise.')
          const { data } = await axios.delete('/api/webmcp/magnets', {
            data: { id: input.id },
            signal,
          })
          toast.success('Magnet supprimé via WebMCP')
          return toolResult(data)
        },
      },
      {
        name: 'betterdebrid.start_alldebrid_connection',
        title: 'Démarrer la connexion AllDebrid',
        description:
          'Crée un code PIN officiel AllDebrid et retourne l’URL que l’utilisateur doit ouvrir. Ne collecte aucun mot de passe.',
        inputSchema: { type: 'object', properties: {}, additionalProperties: false },
        annotations: { readOnlyHint: false, untrustedContentHint: true },
        async execute(_input, { signal }) {
          const { data } = await axios.post('/api/webmcp/alldebrid/pin', {}, { signal })
          return toolResult(data)
        },
      },
      {
        name: 'betterdebrid.check_alldebrid_connection',
        title: 'Vérifier la connexion AllDebrid',
        description:
          'Vérifie un PIN AllDebrid que l’utilisateur a validé et enregistre la clé chiffrée si elle est disponible.',
        inputSchema: {
          type: 'object',
          properties: {
            pin: {
              type: 'string',
              minLength: 4,
              maxLength: 64,
              description: 'Code PIN affiché par BetterDebrid.',
            },
            check: {
              type: 'string',
              minLength: 8,
              maxLength: 512,
              description: 'Jeton de vérification retourné avec le PIN.',
            },
            confirmed: {
              type: 'boolean',
              description: 'Confirme que l’utilisateur a validé le PIN chez AllDebrid.',
            },
          },
          required: ['pin', 'check', 'confirmed'],
          additionalProperties: false,
        },
        annotations: { readOnlyHint: false, untrustedContentHint: true },
        async execute(input, { signal }) {
          if (input.confirmed !== true)
            throw new Error('La validation du PIN par l’utilisateur est requise.')
          const { data } = await axios.post(
            '/api/webmcp/alldebrid/connect',
            { pin: input.pin, check: input.check },
            { signal }
          )
          if (data.connected) toast.success('Compte AllDebrid connecté via WebMCP')
          return toolResult(data)
        },
      },
      {
        name: 'betterdebrid.disconnect_alldebrid',
        title: 'Déconnecter AllDebrid',
        description:
          'Supprime la clé AllDebrid chiffrée de BetterDebrid. confirmed doit être vrai après accord explicite de l’utilisateur.',
        inputSchema: {
          type: 'object',
          properties: {
            confirmed: {
              type: 'boolean',
              description: 'Confirmation explicite de la déconnexion.',
            },
          },
          required: ['confirmed'],
          additionalProperties: false,
        },
        annotations: { readOnlyHint: false, untrustedContentHint: false },
        async execute(input, { signal }) {
          if (input.confirmed !== true) throw new Error('Une confirmation explicite est requise.')
          const { data } = await axios.delete('/api/webmcp/alldebrid', { signal })
          toast.success('Compte AllDebrid déconnecté via WebMCP')
          return toolResult(data)
        },
      },
      {
        name: 'betterdebrid.open_view',
        title: 'Ouvrir une vue BetterDebrid',
        description:
          'Ouvre une vue de l’interface BetterDebrid dans l’onglet courant sans modifier les données.',
        inputSchema: {
          type: 'object',
          properties: {
            view: {
              type: 'string',
              enum: ['dashboard', 'unlock', 'magnets', 'history', 'settings'],
              description: 'Vue à ouvrir.',
            },
          },
          required: ['view'],
          additionalProperties: false,
        },
        annotations: { readOnlyHint: true, untrustedContentHint: false },
        async execute(input) {
          const routes: Record<string, string> = {
            dashboard: '/app',
            unlock: '/app/debrider',
            magnets: '/app/magnets',
            history: '/app/historique',
            settings: '/app/reglages',
          }
          const route = routes[String(input.view)]
          if (!route) throw new Error('Vue BetterDebrid inconnue.')
          window.location.assign(route)
          return toolResult({ opened: input.view })
        },
      },
    ]
    const tools = enabled ? [...publicTools, ...authenticatedTools] : publicTools

    Promise.allSettled(
      tools.map((tool) => modelContext.registerTool(tool, { signal: controller.signal }))
    ).then((results) => {
      const rejected = results.filter((result) => result.status === 'rejected')
      if (rejected.length && !controller.signal.aborted) {
        console.warn(`BetterDebrid: ${rejected.length} outil(s) WebMCP non enregistré(s).`)
      }
    })

    return () => controller.abort()
  }, [enabled])
}
