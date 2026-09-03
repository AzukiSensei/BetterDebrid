import { middleware } from '#start/kernel'
import { controllers } from '#generated/controllers'
import router from '@adonisjs/core/services/router'

router.on('/').renderInertia('home', {}).as('home')
router.get('/confidentialite', [controllers.Legal, 'privacy']).as('legal.privacy')
router.get('/mentions-legales', [controllers.Legal, 'notice']).as('legal.notice')
router.get('/health', ({ response }) => response.ok({ status: 'ok', service: 'betterdebrid' }))

router
  .group(() => {
    router.get('/inscription', [controllers.NewAccount, 'create']).as('new_account.create')
    router.post('/inscription', [controllers.NewAccount, 'store']).as('new_account.store')
    router.get('/connexion', [controllers.Session, 'create']).as('session.create')
    router.post('/connexion', [controllers.Session, 'store']).as('session.store')
  })
  .use(middleware.guest())

router
  .group(() => {
    router.post('/deconnexion', [controllers.Session, 'destroy']).as('session.destroy')

    router.get('/app', [controllers.Dashboard, 'index']).as('dashboard')

    router.get('/app/debrider', [controllers.Unrestrict, 'index']).as('unrestrict.index')
    router.post('/app/debrider', [controllers.Unrestrict, 'store']).as('unrestrict.store')
    router.post('/app/debrider/stream', [controllers.Unrestrict, 'stream']).as('unrestrict.stream')
    router
      .post('/app/debrider/differe', [controllers.Unrestrict, 'delayed'])
      .as('unrestrict.delayed')

    router.get('/app/magnets', [controllers.Magnets, 'index']).as('magnets.index')
    router.post('/app/magnets', [controllers.Magnets, 'store']).as('magnets.store')
    router
      .post('/app/magnets/fichier', [controllers.Magnets, 'uploadFile'])
      .as('magnets.upload_file')
    router.get('/app/magnets/:id', [controllers.Magnets, 'show']).as('magnets.show')
    router.delete('/app/magnets', [controllers.Magnets, 'destroy']).as('magnets.destroy')
    router.post('/app/magnets/relancer', [controllers.Magnets, 'restart']).as('magnets.restart')

    router.get('/app/historique', [controllers.History, 'index']).as('history')
    router.get('/app/reglages', [controllers.Settings, 'index']).as('settings')
    router
      .post('/app/reglages/alldebrid/pin', [controllers.AllDebridConnections, 'create'])
      .as('alldebrid.pin.create')
    router
      .post('/app/reglages/alldebrid/connecter', [controllers.AllDebridConnections, 'store'])
      .as('alldebrid.connect')
    router
      .delete('/app/reglages/alldebrid', [controllers.AllDebridConnections, 'destroy'])
      .as('alldebrid.disconnect')

    router.get('/api/webmcp/status', [controllers.WebMcp, 'status']).as('webmcp.status')
    router.post('/api/webmcp/unlock', [controllers.WebMcp, 'unlock']).as('webmcp.unlock')
    router.post('/api/webmcp/stream', [controllers.WebMcp, 'stream']).as('webmcp.stream')
    router.post('/api/webmcp/delayed', [controllers.WebMcp, 'delayed']).as('webmcp.delayed')
    router
      .post('/api/webmcp/magnets', [controllers.WebMcp, 'addMagnet'])
      .as('webmcp.magnets.create')
    router
      .get('/api/webmcp/magnets/:id/files', [controllers.WebMcp, 'files'])
      .as('webmcp.magnets.files')
    router
      .post('/api/webmcp/magnets/restart', [controllers.WebMcp, 'restartMagnet'])
      .as('webmcp.magnets.restart')
    router
      .delete('/api/webmcp/magnets', [controllers.WebMcp, 'deleteMagnet'])
      .as('webmcp.magnets.delete')
    router.post('/api/webmcp/alldebrid/pin', [controllers.WebMcp, 'startPin']).as('webmcp.pin')
    router
      .post('/api/webmcp/alldebrid/connect', [controllers.WebMcp, 'connectPin'])
      .as('webmcp.connect')
    router
      .delete('/api/webmcp/alldebrid', [controllers.WebMcp, 'disconnect'])
      .as('webmcp.disconnect')
  })
  .use(middleware.auth())
