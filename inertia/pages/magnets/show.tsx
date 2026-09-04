import { Head } from '@inertiajs/react'
import { Form, Link } from '@adonisjs/inertia/react'
import {
  ArrowLeftIcon as ArrowLeft,
  Disc3Icon as Magnet,
  DownloadIcon as Download,
  FileIcon as File,
  FolderIcon as Folder,
  HeadphonesIcon,
  RefreshCwIcon as RotateCcw,
  Trash2Icon as Trash2,
  TriangleAlertIcon as TriangleAlert,
  VideoIcon,
} from '@animateicons/react/lucide'
import { AppShell } from '~/components/app_shell'
import { formatBytes, formatDate, magnetProgress } from '~/utils/format'
import type { InertiaProps } from '~/types'

type FileNode = {
  n: string
  s?: number
  l?: string
  e?: FileNode[]
  mediaToken?: string
  mediaKind?: 'video' | 'audio'
}

type MagnetData = {
  id: number
  filename: string
  size: number
  status: string
  statusCode: number
  downloaded?: number
  downloadSpeed?: number
  seeders?: number
  uploadDate: number
  completionDate?: number
}

interface MagnetShowProps extends InertiaProps {
  magnet: MagnetData | null
  files: FileNode[]
  apiError: string | null
}

export default function MagnetShow({ user, magnet, files, apiError }: MagnetShowProps) {
  const progress = magnet
    ? magnet.statusCode === 4
      ? 100
      : magnetProgress(magnet.size, magnet.downloaded)
    : 0
  const failed = Boolean(magnet && magnet.statusCode >= 5)

  return (
    <AppShell
      user={user!}
      eyebrow="Détail du magnet"
      title={magnet?.filename || 'Magnet indisponible'}
      action={
        <Link href="/app/magnets" className="button button-secondary">
          <ArrowLeft aria-hidden="true" /> Retour à la file
        </Link>
      }
    >
      <Head title={magnet?.filename || 'Magnet'} />
      {apiError || !magnet ? (
        <div className="inline-alert error" role="alert">
          <TriangleAlert aria-hidden="true" />
          <div>
            <strong>Impossible d’ouvrir ce magnet</strong>
            <span>{apiError || 'Ce magnet est introuvable.'}</span>
          </div>
        </div>
      ) : (
        <div className="magnet-detail-stack">
          <section className="magnet-summary" aria-labelledby="magnet-summary-title">
            <div className="magnet-summary-main">
              <span className="large-item-icon">
                <Magnet aria-hidden="true" />
              </span>
              <div>
                <p className="eyebrow">Magnet #{magnet.id}</p>
                <h2 id="magnet-summary-title">{magnet.filename}</h2>
                <div className="summary-meta">
                  <span>{formatBytes(magnet.size)}</span>
                  <span>Ajouté le {formatDate(magnet.uploadDate)}</span>
                  {magnet.seeders !== undefined && (
                    <span>
                      {magnet.seeders} source{magnet.seeders > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="magnet-summary-status">
              <span
                className={`status-badge ${failed ? 'failed' : magnet.statusCode === 4 ? 'ready' : 'working'}`}
              >
                {magnet.status}
              </span>
              {!failed && (
                <div className="summary-progress">
                  <div>
                    <span>Progression</span>
                    <strong>{progress}%</strong>
                  </div>
                  <span className="progress-track large" aria-label={`Progression ${progress} %`}>
                    <span style={{ width: `${progress}%` }} />
                  </span>
                </div>
              )}
            </div>
            <div className="summary-actions">
              {failed && (
                <Form
                  route="magnets.restart"
                  toolname={`betterdebrid.restart_magnet_${magnet.id}`}
                  tooldescription={`Prépare la relance du magnet ${magnet.id}. Confirmation utilisateur requise.`}
                >
                  <input type="hidden" name="id" value={magnet.id} />
                  <button className="button button-secondary" type="submit">
                    <RotateCcw aria-hidden="true" /> Relancer
                  </button>
                </Form>
              )}
              <Form
                route="magnets.destroy"
                toolname={`betterdebrid.delete_magnet_${magnet.id}`}
                tooldescription={`Prépare la suppression définitive du magnet ${magnet.id}. Confirmation utilisateur requise.`}
                onSubmit={(event) => {
                  if (
                    !window.confirm(`Supprimer « ${magnet.filename} » de votre compte AllDebrid ?`)
                  )
                    event.preventDefault()
                }}
              >
                <input type="hidden" name="id" value={magnet.id} />
                <button className="button button-danger-ghost" type="submit">
                  <Trash2 aria-hidden="true" /> Supprimer
                </button>
              </Form>
            </div>
          </section>

          <section className="panel file-browser" aria-labelledby="files-title">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Arborescence</p>
                <h2 id="files-title">Fichiers disponibles</h2>
              </div>
              <span className="count-label">
                {countFiles(files)} fichier{countFiles(files) > 1 ? 's' : ''}
              </span>
            </div>
            {files.length ? (
              <ul className="file-tree">
                {files.map((node, index) => (
                  <FileTreeNode node={node} key={`${node.n}-${index}`} depth={0} />
                ))}
              </ul>
            ) : (
              <div className="panel-empty roomy">
                <Folder aria-hidden="true" />
                <h3>
                  {magnet.statusCode === 4 ? 'Aucun fichier retourné' : 'Fichiers en préparation'}
                </h3>
                <p>
                  {magnet.statusCode === 4
                    ? 'AllDebrid n’a pas renvoyé d’arborescence pour ce magnet.'
                    : 'Revenez lorsque le magnet sera prêt.'}
                </p>
              </div>
            )}
          </section>
        </div>
      )}
    </AppShell>
  )
}

function FileTreeNode({ node, depth }: { node: FileNode; depth: number }) {
  if (node.e) {
    return (
      <li className="file-folder">
        <div className="file-row" style={{ '--file-depth': depth } as React.CSSProperties}>
          <Folder aria-hidden="true" />
          <strong>{node.n}</strong>
          <span>
            {countFiles(node.e)} élément{countFiles(node.e) > 1 ? 's' : ''}
          </span>
        </div>
        <ul>
          {node.e.map((child, index) => (
            <FileTreeNode node={child} depth={depth + 1} key={`${child.n}-${index}`} />
          ))}
        </ul>
      </li>
    )
  }

  return (
    <li>
      <div className="file-row" style={{ '--file-depth': depth } as React.CSSProperties}>
        <File aria-hidden="true" />
        <span className="file-name">{node.n}</span>
        <span>{formatBytes(node.s)}</span>
        {node.l ? (
          <span className="file-actions">
            {node.mediaToken && (
              <Link
                href={`/app/lecteur?token=${encodeURIComponent(node.mediaToken)}`}
                className="icon-button player-button"
                aria-label={`Lire ${node.n}`}
              >
                {node.mediaKind === 'audio' ? (
                  <HeadphonesIcon aria-hidden="true" />
                ) : (
                  <VideoIcon aria-hidden="true" />
                )}
              </Link>
            )}
            <a
              href={node.l}
              className="icon-button"
              target="_blank"
              rel="noreferrer"
              aria-label={`Télécharger ${node.n}`}
            >
              <Download aria-hidden="true" />
            </a>
          </span>
        ) : (
          <span className="icon-placeholder" />
        )}
      </div>
    </li>
  )
}

function countFiles(nodes: FileNode[]): number {
  return nodes.reduce((count, node) => count + (node.e ? countFiles(node.e) : 1), 0)
}
