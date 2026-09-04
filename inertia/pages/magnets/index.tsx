import { Head } from '@inertiajs/react'
import { Form, Link } from '@adonisjs/inertia/react'
import {
  ArrowRightIcon as ArrowRight,
  Disc3Icon as Magnet,
  LoaderCircleIcon as LoaderCircle,
  PlusIcon as Plus,
  RefreshCwIcon as RefreshCw,
  RefreshCwIcon as RotateCcw,
  Trash2Icon as Trash2,
  TriangleAlertIcon as TriangleAlert,
  UploadIcon as FileUp,
} from '@animateicons/react/lucide'
import { AppShell } from '~/components/app_shell'
import { ConnectionRequired } from '~/components/connection_required'
import { formatBytes, formatDate, magnetProgress } from '~/utils/format'
import type { InertiaProps } from '~/types'

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
}

interface MagnetsProps extends InertiaProps {
  connected: boolean
  magnets: MagnetData[]
  apiError: string | null
}

export default function MagnetsIndex({ user, connected, magnets, apiError }: MagnetsProps) {
  return (
    <AppShell
      user={user!}
      eyebrow="Bibliothèque"
      title="Magnets"
      action={
        <Link href="/app/magnets" className="button button-secondary">
          <RefreshCw aria-hidden="true" /> Actualiser
        </Link>
      }
    >
      <Head title="Magnets" />
      {!connected ? (
        <ConnectionRequired />
      ) : (
        <div className="magnets-stack">
          <section className="add-magnet-grid" aria-labelledby="add-magnet-title">
            <div className="add-magnet-intro">
              <span className="tool-number">01</span>
              <div>
                <h2 id="add-magnet-title">Ajouter à la file</h2>
                <p>Collez jusqu’à 30 magnets ou hashes, un par ligne.</p>
              </div>
            </div>
            <Form
              route="magnets.store"
              className="magnet-form"
              toolname="betterdebrid.add_magnet_form"
              tooldescription="Prépare l’ajout de magnets au compte AllDebrid. La soumission doit être confirmée par l’utilisateur."
            >
              {({ errors, processing }) => (
                <>
                  <div className="field-group">
                    <label htmlFor="magnets">Magnets ou hashes</label>
                    <textarea
                      id="magnets"
                      name="magnets"
                      required
                      maxLength={12000}
                      rows={4}
                      placeholder={'magnet:?xt=urn:btih:…\n0123456789abcdef…'}
                      aria-invalid={Boolean(errors.magnets)}
                      aria-describedby={errors.magnets ? 'magnets-error' : 'magnets-hint'}
                      toolparamdescription="Un URI magnet ou hash BitTorrent par ligne, 30 éléments au maximum."
                    />
                    {errors.magnets ? (
                      <p className="field-error" id="magnets-error">
                        {errors.magnets}
                      </p>
                    ) : (
                      <p className="field-hint" id="magnets-hint">
                        Les doublons sont gérés directement par AllDebrid.
                      </p>
                    )}
                  </div>
                  <button type="submit" className="button button-accent" disabled={processing}>
                    {processing ? (
                      <LoaderCircle className="spin" aria-hidden="true" />
                    ) : (
                      <Plus aria-hidden="true" />
                    )}
                    Ajouter
                  </button>
                </>
              )}
            </Form>
            <div className="file-divider">
              <span>ou</span>
            </div>
            <Form
              route="magnets.upload_file"
              className="torrent-form"
              encType="multipart/form-data"
              toolname="betterdebrid.upload_torrent_form"
              tooldescription="Prépare l’envoi d’un fichier torrent vers AllDebrid. La soumission doit être confirmée par l’utilisateur."
            >
              {({ processing }) => (
                <>
                  <label htmlFor="torrent" className="file-picker">
                    <FileUp aria-hidden="true" />
                    <span>
                      <strong>Choisir un fichier .torrent</strong>
                      <small>10 Mo maximum</small>
                    </span>
                  </label>
                  <input
                    type="file"
                    id="torrent"
                    name="torrent"
                    accept=".torrent,application/x-bittorrent"
                    required
                    className="visually-hidden-file"
                    toolparamdescription="Fichier BitTorrent à envoyer, 10 Mo maximum."
                  />
                  <button type="submit" className="button button-secondary" disabled={processing}>
                    {processing ? (
                      <LoaderCircle className="spin" aria-hidden="true" />
                    ) : (
                      <FileUp aria-hidden="true" />
                    )}
                    Envoyer le fichier
                  </button>
                </>
              )}
            </Form>
          </section>

          {apiError && (
            <div className="inline-alert error" role="alert">
              <TriangleAlert aria-hidden="true" />
              <div>
                <strong>Impossible de charger la file</strong>
                <span>{apiError}</span>
              </div>
            </div>
          )}

          <section className="panel magnet-library" aria-labelledby="magnet-library-title">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Compte AllDebrid</p>
                <h2 id="magnet-library-title">Votre file</h2>
              </div>
              <span className="count-label">
                {magnets.length} élément{magnets.length > 1 ? 's' : ''}
              </span>
            </div>
            {magnets.length ? (
              <div className="magnet-table-wrap">
                <table className="magnet-table">
                  <thead>
                    <tr>
                      <th>Fichier</th>
                      <th>Progression</th>
                      <th>Taille</th>
                      <th>Ajouté</th>
                      <th>
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {magnets.map((magnet) => {
                      const progress =
                        magnet.statusCode === 4
                          ? 100
                          : magnetProgress(magnet.size, magnet.downloaded)
                      const failed = magnet.statusCode >= 5
                      return (
                        <tr key={magnet.id}>
                          <td>
                            <Link href={`/app/magnets/${magnet.id}`} className="file-cell">
                              <span className="item-icon">
                                <Magnet aria-hidden="true" />
                              </span>
                              <span>
                                <strong title={magnet.filename}>{magnet.filename}</strong>
                                <small>#{magnet.id}</small>
                              </span>
                            </Link>
                          </td>
                          <td>
                            <div className="table-progress">
                              <span
                                className={`status-badge ${failed ? 'failed' : magnet.statusCode === 4 ? 'ready' : 'working'}`}
                              >
                                {failed
                                  ? 'Erreur'
                                  : magnet.statusCode === 4
                                    ? 'Prêt'
                                    : magnet.status}
                              </span>
                              {!failed && magnet.statusCode !== 4 && <span>{progress}%</span>}
                            </div>
                          </td>
                          <td>{formatBytes(magnet.size)}</td>
                          <td>{formatDate(magnet.uploadDate)}</td>
                          <td>
                            <div className="row-actions">
                              <Link
                                href={`/app/magnets/${magnet.id}`}
                                className="icon-button"
                                aria-label={`Ouvrir ${magnet.filename}`}
                              >
                                <ArrowRight aria-hidden="true" />
                              </Link>
                              {failed && (
                                <Form
                                  route="magnets.restart"
                                  toolname={`betterdebrid.restart_magnet_${magnet.id}`}
                                  tooldescription={`Prépare la relance du magnet ${magnet.id}. Confirmation utilisateur requise.`}
                                >
                                  <input type="hidden" name="id" value={magnet.id} />
                                  <button
                                    className="icon-button"
                                    type="submit"
                                    aria-label={`Relancer ${magnet.filename}`}
                                  >
                                    <RotateCcw aria-hidden="true" />
                                  </button>
                                </Form>
                              )}
                              <Form
                                route="magnets.destroy"
                                toolname={`betterdebrid.delete_magnet_${magnet.id}`}
                                tooldescription={`Prépare la suppression définitive du magnet ${magnet.id}. Confirmation utilisateur requise.`}
                                onSubmit={(event) => {
                                  if (
                                    !window.confirm(
                                      `Supprimer « ${magnet.filename} » de votre compte AllDebrid ?`
                                    )
                                  )
                                    event.preventDefault()
                                }}
                              >
                                <input type="hidden" name="id" value={magnet.id} />
                                <button
                                  className="icon-button danger"
                                  type="submit"
                                  aria-label={`Supprimer ${magnet.filename}`}
                                >
                                  <Trash2 aria-hidden="true" />
                                </button>
                              </Form>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="panel-empty roomy">
                <Magnet aria-hidden="true" />
                <h3>La file est vide</h3>
                <p>Ajoutez un magnet ou un fichier torrent avec le formulaire ci-dessus.</p>
              </div>
            )}
          </section>
        </div>
      )}
    </AppShell>
  )
}
