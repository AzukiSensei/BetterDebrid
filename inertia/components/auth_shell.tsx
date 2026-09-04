import { Link } from '@adonisjs/inertia/react'
import {
  ArrowLeftIcon as ArrowLeft,
  CheckIcon as Check,
  ShieldCheckIcon as ShieldCheck,
} from '@animateicons/react/lucide'
import type { ReactNode } from 'react'
import { BrandMark } from './brand_mark'

export function AuthShell({ children, mode }: { children: ReactNode; mode: 'login' | 'signup' }) {
  return (
    <div className="auth-page">
      <aside className="auth-story">
        <BrandMark />
        <div className="auth-story-copy">
          <p className="eyebrow light">Votre espace personnel</p>
          <h2>Une interface nette entre vous et vos téléchargements.</h2>
          <ul>
            <li>
              <Check aria-hidden="true" /> Clé AllDebrid chiffrée côté serveur
            </li>
            <li>
              <Check aria-hidden="true" /> Aucun mot de passe AllDebrid collecté
            </li>
            <li>
              <Check aria-hidden="true" /> Interface responsive et WebMCP
            </li>
          </ul>
        </div>
        <div className="auth-security">
          <ShieldCheck aria-hidden="true" />
          <span>Session sécurisée · Protection CSRF</span>
        </div>
      </aside>
      <main id="main-content" className="auth-main" tabIndex={-1}>
        <div className="auth-topline">
          <Link href="/" className="back-link">
            <ArrowLeft aria-hidden="true" /> Retour à l’accueil
          </Link>
          <span>
            {mode === 'login' ? 'Nouveau ici ?' : 'Déjà inscrit ?'}{' '}
            <Link href={mode === 'login' ? '/inscription' : '/connexion'}>
              {mode === 'login' ? 'Créer un compte' : 'Se connecter'}
            </Link>
          </span>
        </div>
        <div className="auth-content">{children}</div>
      </main>
    </div>
  )
}
