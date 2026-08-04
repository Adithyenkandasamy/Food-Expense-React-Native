const appJson = require('./app.base.json')

export default {
  expo: {
    ...appJson.expo,
    extra: {
      ...(appJson.expo?.extra || {}),
      posthogProjectToken: process.env.POSTHOG_PROJECT_TOKEN,
      posthogHost: process.env.POSTHOG_HOST,
      eas: {
        projectId: 'e1f28507-c065-4e81-8ae9-8b2602175934',
      },
    },
  },
}
