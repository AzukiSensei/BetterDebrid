# BetterDebrid

Une interface premium, open source et responsive pour piloter un compte AllDebrid. BetterDebrid est construit avec AdonisJS 7, React 19, Inertia 3 et PostgreSQL.

> Projet indépendant, non affilié à AllDebrid. Utilisez-le uniquement pour des contenus auxquels vous êtes autorisé à accéder.

## Fonctionnalités

- compte local sécurisé par session, CSRF et mot de passe haché ;
- connexion AllDebrid par le flux PIN officiel, sans collecte du mot de passe AllDebrid ;
- clé d’API chiffrée en AES-256-GCM avant stockage ;
- déverrouillage des liens directs, différés et multi-qualités ;
- ajout de magnets, hashes et fichiers `.torrent` ;
- suivi de progression, relance, suppression et arborescence des fichiers ;
- historiques AllDebrid et journal local minimal ;
- interface accessible, mobile et compatible avec `prefers-reduced-motion` ;
- Dockerfile de production, migrations automatiques et healthcheck ;
- WebMCP déclaratif et impératif.

## WebMCP

Quand le navigateur expose `document.modelContext`, BetterDebrid enregistre des outils structurés pour consulter le compte, déverrouiller un lien, ajouter ou gérer un magnet, suivre un lien différé, sélectionner une qualité et effectuer la connexion PIN. Les outils de lecture utilisent `readOnlyHint`. Les réponses issues d’AllDebrid sont marquées comme contenu non fiable et les mutations demandent un champ `confirmed: true`.

Les formulaires visibles exposent aussi les attributs expérimentaux `toolname`, `tooldescription` et `toolparamdescription`. Sans WebMCP, ils restent des formulaires HTML/Inertia standards.

Le site doit être servi en HTTPS : WebMCP est limité aux contextes sécurisés. L’en-tête `Permissions-Policy: tools=(self)` restreint l’exposition à la même origine.

## Prérequis

- Node.js 24+
- npm 11+
- PostgreSQL 17+ (les versions maintenues récentes fonctionnent également)

## Développement local

```bash
cp .env.example .env
docker compose -f compose.local.yml up -d
npm ci
node ace generate:key
node ace migration:run
npm run dev
```

L’application écoute par défaut sur <http://localhost:3333>.

## Variables d’environnement

| Variable         | Exemple                  | Description                                                |
| ---------------- | ------------------------ | ---------------------------------------------------------- |
| `NODE_ENV`       | `production`             | Environnement AdonisJS                                     |
| `HOST`           | `0.0.0.0`                | Interface d’écoute                                         |
| `PORT`           | `3333`                   | Port HTTP interne                                          |
| `LOG_LEVEL`      | `info`                   | Niveau de logs                                             |
| `APP_KEY`        | secret de 32 caractères  | Chiffrement applicatif, à conserver entre les déploiements |
| `APP_URL`        | `https://better.azks.fr` | URL publique canonique                                     |
| `SESSION_DRIVER` | `cookie`                 | Stockage de session                                        |
| `DATABASE_URL`   | `postgresql://…`         | Connexion PostgreSQL                                       |

Ne changez jamais `APP_KEY` sans plan de rotation : les clés AllDebrid déjà stockées ne pourraient plus être déchiffrées.

## Vérification

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

La CI GitHub exécute ces quatre contrôles avec une base PostgreSQL éphémère.

## Déploiement Dokploy

1. Créez une base PostgreSQL dans le projet Dokploy.
2. Créez une application depuis ce dépôt et sélectionnez le build Dockerfile.
3. Renseignez les variables d’environnement ci-dessus en utilisant l’URL interne de PostgreSQL.
4. Exposez le port `3333` et ajoutez le domaine `better.azks.fr` avec HTTPS Let’s Encrypt.
5. Déployez. Le conteneur exécute les migrations avant de démarrer le serveur.
6. Configurez le healthcheck sur `/health`.

## Architecture

```text
app/
  controllers/       Contrôleurs Inertia et endpoints WebMCP
  models/             Utilisateurs, connexion chiffrée, journal
  services/           Client API AllDebrid et logique partagée
database/migrations/  Schéma PostgreSQL
inertia/
  components/         Coquilles, navigation et éléments réutilisables
  hooks/              Enregistrement des outils WebMCP
  pages/              Pages React
```

## Licence

[MIT](LICENSE)
