import { type Data } from '@generated/data'
import { usePage } from '@inertiajs/react'
import { type ReactElement, useEffect } from 'react'
import { toast, Toaster } from 'sonner'
import { useWebMcp } from '~/hooks/use_web_mcp'

export default function Layout({ children }: { children: ReactElement<Data.SharedProps> }) {
  const { url, flash } = usePage()
  const authenticated = Boolean(children.props.user)
  useWebMcp(authenticated)

  useEffect(() => {
    toast.dismiss()
  }, [url])

  useEffect(() => {
    if (flash?.error) toast.error(flash.error)
    if (flash?.success) toast.success(flash.success)
  }, [flash?.error, flash?.success])

  return (
    <>
      <a href="#main-content" className="skip-link">
        Aller au contenu
      </a>
      {children}
      <Toaster position="top-center" richColors closeButton />
    </>
  )
}
