import { betterAuth } from 'better-auth'
import { jwt } from 'better-auth/plugins/jwt'
import { admin } from 'better-auth/plugins/admin'
import { twoFactor } from 'better-auth/plugins/two-factor'
import { Pool } from 'pg'
import { dash } from '@better-auth/infra'

const baseURL = (process.env.BETTER_AUTH_URL ?? 'http://localhost:3005').replace(/\/+$/, '') + '/api/auth'
const trustedOrigins = (process.env.AUTH_WEB_ORIGIN ?? 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

const connectionString = process.env.AUTH_DATABASE_URL
  ?? process.env.ConnectionStrings__appdb
  ?? process.env.DATABASE_URL
  ?? 'postgres://postgres:postgres@localhost:5432/appdb'

const secret = process.env.BETTER_AUTH_SECRET ?? 'replace-this-local-dev-secret-with-32-plus-characters'
const betterAuthApiKey = process.env.BETTER_AUTH_API_KEY ?? ''

function parseConnectionString(value) {
  if (value.includes('://')) {
    return { connectionString: value }
  }

  const parts = value
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)

  const entries = Object.fromEntries(
    parts.map((part) => {
      const separatorIndex = part.indexOf('=')
      if (separatorIndex === -1) {
        return [part.toLowerCase(), '']
      }

      const key = part.slice(0, separatorIndex).trim().toLowerCase()
      const parsedValue = part.slice(separatorIndex + 1).trim()
      return [key, parsedValue]
    }),
  )

  return {
    host: entries.host,
    port: entries.port ? Number(entries.port) : undefined,
    database: entries.database,
    user: entries.username ?? entries.user ?? entries['user id'],
    password: entries.password,
    ssl: entries['ssl mode'] && entries['ssl mode'].toLowerCase() !== 'disable'
      ? { rejectUnauthorized: false }
      : undefined,
  }
}

export const database = new Pool(parseConnectionString(connectionString))

export const auth = betterAuth({
  appName: 'Republic of the Philippines ENF',
  baseURL,
  trustedOrigins,
  secret,
  database,
  user: {
    additionalFields: {
      role: {
        type: 'string',
        defaultValue: 'user', // Default to 'user', which will be changed to 'enp' or 'ena'
      },
      commissionNumber: {
        type: 'string',
        required: false,
      },
      commissionExpiry: {
        type: 'string',
        required: false,
      },
      rollNumber: {
        type: 'string',
        required: false,
      },
      ibpNumber: {
        type: 'string',
        required: false,
      },
      regularPlaceOfBusiness: {
        type: 'string',
        required: false,
      },
      ekycStatus: {
        type: 'string',
        defaultValue: 'none',
      },
      isOnboarded: {
        type: 'boolean',
        defaultValue: false,
        required: false,
      },
      watchedInstructionalVideo: {
        type: 'boolean',
        defaultValue: false,
        required: false,
      },
    },
  },
  plugins: [
    jwt({
      jwks: {
        keyPairConfig: {
          alg: 'RS256',
          modulusLength: 2048,
        },
      },
    }),
    admin(),
    dash(),
    twoFactor({
      issuer: 'Republic of the Philippines ENF',
    }),
  ],
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    minPasswordLength: 8,
    sendResetPassword: async ({ user, url, token }, request) => {
      console.log(`[AUTH] Password reset requested for ${user.email}`);
      console.log(`[AUTH] Reset URL: ${url}`);
      console.log(`[AUTH] Token: ${token}`);
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  telemetry: {
    enabled: false,
  },
  apiKey: betterAuthApiKey,
})