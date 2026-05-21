import { auth } from './auth.js'

/** @type {import('better-auth-studio').StudioConfig} */
export default {
  auth,
  basePath: '/api/studio',
  access: {
    // During local development, you can sign in with any account that matches this list.
    // In production, you should set the BETTER_AUTH_ADMIN_EMAILS environment variable.
    roles: ['admin'],
    allowEmails: (process.env.BETTER_AUTH_ADMIN_EMAILS ?? 'admin@aebibtech.com').split(',').map(e => e.trim()),
  }
}
