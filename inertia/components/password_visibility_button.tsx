import { EyeIcon, EyeOffIcon } from '@animateicons/react/lucide'

interface PasswordVisibilityButtonProps {
  visible: boolean
  controls: string
  onToggle: () => void
}

export function PasswordVisibilityButton({
  visible,
  controls,
  onToggle,
}: PasswordVisibilityButtonProps) {
  return (
    <button
      type="button"
      className="password-visibility-button"
      aria-label={visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
      aria-controls={controls}
      aria-pressed={visible}
      onClick={onToggle}
    >
      {visible ? <EyeOffIcon aria-hidden="true" /> : <EyeIcon aria-hidden="true" />}
    </button>
  )
}
