import { Head } from '@inertiajs/react'
import { Link } from '@adonisjs/inertia/react'
import {
  Activity,
  ArrowDown,
  ArrowRight,
  Bot,
  Check,
  Clock3,
  KeyRound,
  Link2,
  LockKeyhole,
  Magnet,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react'
import { MarketingHeader } from '~/components/marketing_header'
import type { InertiaProps } from '~/types'

export default function Home({ user }: InertiaProps) {
  const appHref = user ? '/app' : '/inscription'

  return (
    <div className="marketing-page">
      <Head title="Votre AllDebrid, en mieux">
        <meta
          name="description"
          content="Débridez vos liens, pilotez vos magnets et retrouvez vos fichiers AllDebrid dans une interface claire, sécurisée et compatible WebMCP."
        />
      </Head>
      <MarketingHeader authenticated={Boolean(user)} />

      <main id="main-content" tabIndex={-1}>
        <section className="hero-section" aria-labelledby="hero-title">
          <div className="hero-orbit hero-orbit-one" aria-hidden="true" />
          <div className="hero-orbit hero-orbit-two" aria-hidden="true" />

          <div className="hero-grid">
            <div className="hero-copy">
              <div className="hero-kicker">
                <span className="live-dot" aria-hidden="true" />
                L’interface augmentée pour AllDebrid
              </div>
              <h1 id="hero-title">
                Tout AllDebrid.
                <br />
                <em>Zéro détour.</em>
              </h1>
              <p className="hero-lead">
                Débridez, suivez, récupérez. BetterDebrid transforme votre compte AllDebrid en un
                espace de pilotage rapide, élégant et prêt pour le web agentique.
              </p>
              <div className="hero-actions">
                <Link href={appHref} className="button button-accent button-large hero-primary-cta">
                  <span>{user ? 'Ouvrir mon espace' : 'Créer mon espace'}</span>
                  <ArrowRight aria-hidden="true" />
                </Link>
                <a href="#experience" className="hero-secondary-link">
                  <span className="hero-secondary-icon">
                    <ArrowDown aria-hidden="true" />
                  </span>
                  Explorer le produit
                </a>
              </div>

              <div className="hero-proof" aria-label="Caractéristiques principales">
                <div>
                  <strong>Open source</strong>
                  <span>Code public et auditable</span>
                </div>
                <div>
                  <strong>AES-256-GCM</strong>
                  <span>Clé chiffrée côté serveur</span>
                </div>
                <div>
                  <strong>WebMCP natif</strong>
                  <span>13 outils publiés</span>
                </div>
              </div>
            </div>

            <div className="hero-visual" aria-label="Démonstration de l’interface BetterDebrid">
              <div className="hero-visual-caption" aria-hidden="true">
                <span>01</span>
                <span>Aperçu produit</span>
              </div>

              <div className="product-stage">
                <div className="stage-browser-bar" aria-hidden="true">
                  <div className="browser-dots">
                    <span />
                    <span />
                    <span />
                  </div>
                  <span className="browser-address">better.azks.fr/app</span>
                  <LockKeyhole />
                </div>

                <div className="preview-window">
                  <div className="preview-rail" aria-hidden="true">
                    <div className="preview-logo">
                      <span />
                      <span />
                    </div>
                    <div className="preview-nav active">
                      <Zap />
                    </div>
                    <div className="preview-nav">
                      <Magnet />
                    </div>
                    <div className="preview-nav">
                      <Activity />
                    </div>
                    <div className="preview-nav">
                      <ShieldCheck />
                    </div>
                  </div>

                  <div className="preview-content">
                    <div className="preview-topline">
                      <div>
                        <span className="preview-eyebrow">VUE D’ENSEMBLE</span>
                        <strong>Bonjour, votre espace est prêt.</strong>
                      </div>
                      <span className="preview-status">
                        <span className="status-dot" aria-hidden="true" />
                        AllDebrid connecté
                      </span>
                    </div>

                    <div className="preview-command">
                      <div>
                        <Link2 aria-hidden="true" />
                        <span>https://exemple.com/fichier</span>
                      </div>
                      <span className="preview-command-button">
                        Débrider <ArrowRight aria-hidden="true" />
                      </span>
                    </div>

                    <div className="preview-summary">
                      <div>
                        <span>Magnets actifs</span>
                        <strong>2</strong>
                      </div>
                      <div>
                        <span>Liens récents</span>
                        <strong>4</strong>
                      </div>
                      <div className="preview-summary-highlight">
                        <span>Sécurité</span>
                        <strong>Clé chiffrée</strong>
                      </div>
                    </div>

                    <div className="preview-list">
                      <div className="preview-list-heading">
                        <span>Activité récente</span>
                        <span>État</span>
                      </div>
                      <div className="preview-row">
                        <span className="file-glyph amber">
                          <Magnet aria-hidden="true" />
                        </span>
                        <div>
                          <strong>Collection média</strong>
                          <span>Téléchargement en cours</span>
                          <span className="preview-progress" aria-hidden="true">
                            <span />
                          </span>
                        </div>
                        <span className="progress-value">68%</span>
                      </div>
                      <div className="preview-row">
                        <span className="file-glyph ink">
                          <Check aria-hidden="true" />
                        </span>
                        <div>
                          <strong>Archive projet</strong>
                          <span>Lien sécurisé généré</span>
                        </div>
                        <span className="status-pill">Prêt</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="stage-float stage-float-security">
                <span className="stage-float-icon">
                  <ShieldCheck aria-hidden="true" />
                </span>
                <span>
                  <small>Votre clé API</small>
                  <strong>Protégée côté serveur</strong>
                </span>
              </div>
              <div className="stage-float stage-float-mcp">
                <Sparkles aria-hidden="true" />
                <span>
                  <strong>WebMCP ready</strong>
                  <small>Humains et agents, même contrôle</small>
                </span>
              </div>
            </div>
          </div>

          <div className="capability-strip" aria-label="Fonctionnalités disponibles">
            <span>Déverrouillage direct</span>
            <span aria-hidden="true">◆</span>
            <span>Magnets & torrents</span>
            <span aria-hidden="true">◆</span>
            <span>Multistream</span>
            <span aria-hidden="true">◆</span>
            <span>Historique</span>
            <span aria-hidden="true">◆</span>
            <span>Compatible WebMCP</span>
          </div>
        </section>

        <section className="experience-section" id="experience" aria-labelledby="experience-title">
          <div className="experience-intro">
            <div className="section-marker" aria-hidden="true">
              02 / L’expérience
            </div>
            <div className="section-heading">
              <p className="eyebrow">Le geste simple, enfin</p>
              <h2 id="experience-title">
                Du lien brut au fichier prêt, <em>sans perdre le fil.</em>
              </h2>
            </div>
            <p className="experience-lead">
              Une interface pensée autour du chemin réel : lancer une action, comprendre son état et
              retrouver le résultat — sans naviguer entre plusieurs outils.
            </p>
          </div>

          <div className="journey-grid">
            <article className="journey-card journey-card-link">
              <div className="journey-topline">
                <span>01</span>
                <Link2 aria-hidden="true" />
              </div>
              <div className="journey-card-copy">
                <h3>Collez.</h3>
                <p>Un lien, un magnet ou un fichier torrent. BetterDebrid reconnaît le flux.</p>
              </div>
              <div className="journey-input" aria-hidden="true">
                <span>https://...</span>
                <ArrowRight />
              </div>
            </article>

            <article className="journey-card journey-card-progress">
              <div className="journey-topline">
                <span>02</span>
                <Activity aria-hidden="true" />
              </div>
              <div className="journey-card-copy">
                <h3>Suivez.</h3>
                <p>Progression, statut et arborescence restent visibles dans un même contexte.</p>
              </div>
              <div className="journey-rings" aria-hidden="true">
                <span className="journey-ring-outer" />
                <span className="journey-ring-inner" />
                <strong>68%</strong>
              </div>
            </article>

            <article className="journey-card journey-card-result">
              <div className="journey-topline">
                <span>03</span>
                <Zap aria-hidden="true" />
              </div>
              <div className="journey-card-copy">
                <h3>Récupérez.</h3>
                <p>Le lien sécurisé apparaît là où vous l’attendez, prêt à être utilisé.</p>
              </div>
              <div className="journey-result" aria-hidden="true">
                <span className="journey-result-check">
                  <Check />
                </span>
                <span>
                  <small>Fichier disponible</small>
                  <strong>Ouvrir le lien</strong>
                </span>
                <ArrowRight />
              </div>
            </article>
          </div>
        </section>

        <section className="feature-section" id="fonctionnalites" aria-labelledby="features-title">
          <div className="feature-section-head">
            <div className="section-marker" aria-hidden="true">
              03 / Capacités
            </div>
            <div className="section-heading">
              <p className="eyebrow light">Un vrai poste de commande</p>
              <h2 id="features-title">Les actions utiles. Rien autour.</h2>
            </div>
          </div>

          <div className="feature-layout">
            <article className="feature-lead-card">
              <div className="feature-card-topline">
                <span className="feature-icon">
                  <Zap aria-hidden="true" />
                </span>
                <span className="feature-index">01 / Liens</span>
              </div>
              <div>
                <h3>Déverrouillage direct, différé et multistream.</h3>
                <p>
                  Gérez chaque scénario depuis une seule surface, puis choisissez la bonne qualité
                  lorsque plusieurs flux sont proposés.
                </p>
              </div>
              <div className="feature-code" aria-hidden="true">
                <span>URL source</span>
                <span className="feature-code-line" />
                <strong>
                  <Check /> Lien prêt
                </strong>
              </div>
            </article>

            <div className="feature-stack">
              <article className="feature-row-card">
                <div className="feature-card-topline">
                  <span className="feature-icon small">
                    <Magnet aria-hidden="true" />
                  </span>
                  <span className="feature-index">02 / Magnets</span>
                </div>
                <div>
                  <h3>Tout le cycle torrent.</h3>
                  <p>Ajout, progression, fichiers, relance et suppression depuis la même vue.</p>
                </div>
                <div className="mini-magnet-list" aria-hidden="true">
                  <span>
                    <i /> En cours <strong>68%</strong>
                  </span>
                  <span>
                    <i /> Terminé <Check />
                  </span>
                </div>
              </article>

              <article className="feature-row-card feature-agent-card">
                <div className="feature-card-topline">
                  <span className="feature-icon small inverse">
                    <Bot aria-hidden="true" />
                  </span>
                  <span className="feature-index">03 / WebMCP</span>
                </div>
                <div>
                  <h3>Prêt pour le web agentique.</h3>
                  <p>
                    Les agents compatibles découvrent des outils structurés, avec confirmation
                    explicite pour chaque action sensible.
                  </p>
                </div>
                <div className="agent-tool-pill" aria-hidden="true">
                  <span className="live-dot" />
                  betterdebrid.unlock_link
                </div>
              </article>
            </div>
          </div>
        </section>

        <section className="security-section" id="securite" aria-labelledby="security-title">
          <div className="security-visual" aria-hidden="true">
            <span className="security-orbit security-orbit-one" />
            <span className="security-orbit security-orbit-two" />
            <span className="security-core">
              <LockKeyhole />
            </span>
            <span className="security-tag security-tag-pin">Flux PIN officiel</span>
            <span className="security-tag security-tag-key">Clé chiffrée</span>
          </div>

          <div className="security-copy">
            <p className="eyebrow">La sécurité, sans théâtre</p>
            <h2 id="security-title">Votre clé reste hors de portée du navigateur.</h2>
            <p>
              Le flux PIN officiel connecte AllDebrid sans collecter votre mot de passe. La clé
              reçue est chiffrée côté serveur et n’est jamais injectée dans les pages React.
            </p>
            <div className="security-points">
              <div>
                <KeyRound aria-hidden="true" />
                <span>
                  <strong>Connexion par code PIN</strong>
                  Aucun mot de passe AllDebrid stocké
                </span>
              </div>
              <div>
                <ShieldCheck aria-hidden="true" />
                <span>
                  <strong>Chiffrement AES-256-GCM</strong>
                  Secret applicatif distinct de PostgreSQL
                </span>
              </div>
            </div>
            <Link href="/confidentialite" className="text-link">
              Voir notre approche des données <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </section>

        <section className="final-cta">
          <div className="final-cta-copy">
            <p className="eyebrow light">BetterDebrid est prêt</p>
            <h2>Remettez vos téléchargements au centre.</h2>
            <p>
              Une interface open source au-dessus de votre compte AllDebrid, sans abonnement
              BetterDebrid.
            </p>
          </div>
          <Link href={appHref} className="button button-accent button-large">
            {user ? 'Accéder au tableau de bord' : 'Créer mon espace'}
            <ArrowRight aria-hidden="true" />
          </Link>
          <div className="final-cta-note">
            <Clock3 aria-hidden="true" />
            <span>Connexion AllDebrid guidée par code PIN</span>
          </div>
        </section>
      </main>

      <footer className="marketing-footer">
        <div>
          <strong>BetterDebrid</strong>
          <span>Projet indépendant, non affilié à AllDebrid.</span>
        </div>
        <nav aria-label="Navigation de pied de page">
          <Link href="/confidentialite">Confidentialité</Link>
          <Link href="/mentions-legales">Mentions légales</Link>
          <a href="https://docs.alldebrid.com/" target="_blank" rel="noreferrer">
            API AllDebrid
          </a>
        </nav>
      </footer>
    </div>
  )
}
