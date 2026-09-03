import { Head } from '@inertiajs/react'
import { Link } from '@adonisjs/inertia/react'
import { ArrowRight, Bot, Check, KeyRound, Magnet, ShieldCheck, Sparkles, Zap } from 'lucide-react'
import { MarketingHeader } from '~/components/marketing_header'
import type { InertiaProps } from '~/types'

export default function Home({ user }: InertiaProps) {
  return (
    <div className="marketing-page">
      <Head title="Votre AllDebrid, en mieux">
        <meta
          name="description"
          content="Débridez vos liens, pilotez vos magnets et retrouvez vos fichiers AllDebrid dans une interface claire et sécurisée."
        />
      </Head>
      <MarketingHeader authenticated={Boolean(user)} />

      <main id="main-content" tabIndex={-1}>
        <section className="hero-section">
          <div className="hero-grid">
            <div className="hero-copy">
              <div className="hero-kicker">
                <span className="live-dot" aria-hidden="true" />
                Interface indépendante pour AllDebrid
              </div>
              <h1>
                Vos liens.
                <br />
                Vos magnets.
                <br />
                <em>Sans friction.</em>
              </h1>
              <p className="hero-lead">
                BetterDebrid rassemble l’essentiel de votre compte AllDebrid dans un espace rapide,
                lisible et pensé pour rester sous votre contrôle.
              </p>
              <div className="hero-actions">
                <Link
                  href={user ? '/app' : '/inscription'}
                  className="button button-accent button-large"
                >
                  {user ? 'Ouvrir mon espace' : 'Commencer gratuitement'}
                  <ArrowRight aria-hidden="true" />
                </Link>
                <a href="#fonctionnalites" className="text-link">
                  Découvrir l’interface
                </a>
              </div>
              <div className="hero-trust" aria-label="Points clés">
                <span>
                  <Check aria-hidden="true" /> Open source
                </span>
                <span>
                  <Check aria-hidden="true" /> Clé chiffrée
                </span>
                <span>
                  <Check aria-hidden="true" /> WebMCP natif
                </span>
              </div>
            </div>

            <div className="product-stage" aria-label="Aperçu de l’interface BetterDebrid">
              <div className="stage-label">Aperçu produit</div>
              <div className="preview-window">
                <div className="preview-rail">
                  <div className="preview-logo" />
                  {[0, 1, 2, 3].map((item) => (
                    <div key={item} className={item === 0 ? 'preview-nav active' : 'preview-nav'} />
                  ))}
                </div>
                <div className="preview-content">
                  <div className="preview-topline">
                    <span>Vue d’ensemble</span>
                    <span className="preview-status">Compte connecté</span>
                  </div>
                  <div className="preview-primary">
                    <div>
                      <span className="preview-eyebrow">ACCÈS RAPIDE</span>
                      <strong>Débrider un lien</strong>
                    </div>
                    <ArrowRight aria-hidden="true" />
                  </div>
                  <div className="preview-list">
                    <div className="preview-row">
                      <span className="file-glyph amber" />
                      <div>
                        <strong>archive-projet.zip</strong>
                        <span>Prêt · lien sécurisé</span>
                      </div>
                      <span className="status-pill">Prêt</span>
                    </div>
                    <div className="preview-row">
                      <span className="file-glyph ink" />
                      <div>
                        <strong>collection-media</strong>
                        <span>Téléchargement en cours</span>
                      </div>
                      <span className="progress-value">68%</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="stage-note">
                <Sparkles aria-hidden="true" />
                <span>Conçu pour le web humain et agentique</span>
              </div>
            </div>
          </div>
        </section>

        <section className="feature-section" id="fonctionnalites" aria-labelledby="features-title">
          <div className="section-heading">
            <p className="eyebrow">Tout au même endroit</p>
            <h2 id="features-title">Moins d’onglets. Plus de contrôle.</h2>
            <p>
              Les actions que vous utilisez vraiment, débarrassées du bruit et accessibles sur tous
              vos écrans.
            </p>
          </div>
          <div className="feature-layout">
            <article className="feature-lead-card">
              <div className="feature-icon">
                <Zap aria-hidden="true" />
              </div>
              <span className="feature-index">01</span>
              <h3>Déverrouillage direct</h3>
              <p>
                Collez une URL, gérez les liens différés et choisissez la qualité des contenus
                compatibles sans quitter BetterDebrid.
              </p>
              <div className="feature-code" aria-hidden="true">
                <span>https://host.example/file</span>
                <ArrowRight />
                <strong>Lien prêt</strong>
              </div>
            </article>
            <div className="feature-stack">
              <article className="feature-row-card">
                <div className="feature-icon small">
                  <Magnet aria-hidden="true" />
                </div>
                <div>
                  <span className="feature-index">02</span>
                  <h3>Magnets et torrents</h3>
                  <p>Ajout par lien ou fichier, progression, relance et arborescence complète.</p>
                </div>
              </article>
              <article className="feature-row-card">
                <div className="feature-icon small">
                  <Bot aria-hidden="true" />
                </div>
                <div>
                  <span className="feature-index">03</span>
                  <h3>Prêt pour WebMCP</h3>
                  <p>
                    Les outils natifs permettent aux agents compatibles d’agir avec le même contrôle
                    et les mêmes validations que vous.
                  </p>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section className="security-section" id="securite" aria-labelledby="security-title">
          <div className="security-copy">
            <p className="eyebrow">Sécurité sobre, par défaut</p>
            <h2 id="security-title">Votre clé n’a rien à faire dans le navigateur.</h2>
            <p>
              Le flux PIN officiel connecte AllDebrid sans partager votre mot de passe. La clé reçue
              est chiffrée côté serveur et n’est jamais exposée dans les pages React.
            </p>
            <Link href="/confidentialite" className="text-link light">
              Lire notre approche des données <ArrowRight aria-hidden="true" />
            </Link>
          </div>
          <div className="security-points">
            <div>
              <KeyRound aria-hidden="true" />
              <span>
                <strong>Connexion PIN</strong>
                Aucun mot de passe AllDebrid collecté
              </span>
            </div>
            <div>
              <ShieldCheck aria-hidden="true" />
              <span>
                <strong>Chiffrement AES-256-GCM</strong>
                Secret applicatif distinct de la base
              </span>
            </div>
          </div>
        </section>

        <section className="final-cta">
          <div>
            <p className="eyebrow">BetterDebrid</p>
            <h2>Votre espace de téléchargement, enfin à votre rythme.</h2>
          </div>
          <Link href={user ? '/app' : '/inscription'} className="button button-accent button-large">
            {user ? 'Accéder au tableau de bord' : 'Créer mon espace'}
            <ArrowRight aria-hidden="true" />
          </Link>
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
