import { configApp } from '@adonisjs/eslint-config'
import { react } from '@adonisjs/eslint-config/react'

const [reactBase, ...reactRest] = react

export default configApp(
  {
    ...reactBase,
    rules: {
      ...reactBase.rules,
      'react/no-unknown-property': [
        'error',
        {
          ignore: ['toolname', 'tooldescription', 'toolautosubmit', 'toolparamdescription'],
        },
      ],
    },
  },
  ...reactRest
)
