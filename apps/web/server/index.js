import cors from 'cors'
import express from 'express'
import { getMigrations } from 'better-auth/db/migration'
import { toNodeHandler } from 'better-auth/node'
import { auth, database } from './auth.js'
import { betterAuthStudio } from 'better-auth-studio/express'
import studioConfig from './studio.config.js'

const port = Number(process.env.PORT ?? process.env.AUTH_PORT ?? 3005)
const autoMigrate = process.env.AUTH_AUTO_MIGRATE !== 'false'
const authHandler = toNodeHandler(auth)
const allowedOrigins = (process.env.AUTH_WEB_ORIGIN ?? 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

const app = express()
let startupState = 'starting'
let startupError = null

// app.use(cors({
//   origin(origin, callback) {
//     if (!origin || allowedOrigins.includes(origin)) {
//       callback(null, true)
//       return
//     }

//     callback(new Error(`Origin ${origin} is not allowed by Better Auth CORS settings.`))
//   },
//   credentials: true,
// }))

app.use(cors({
  origin: true,
  credentials: true,
}))

app.get('/healthz', (_request, response) => {
  response.status(startupState === 'failed' ? 503 : 200).json({
    ok: startupState !== 'failed',
    state: startupState,
    error: startupError,
  })
})

app.get('/readyz', (_request, response) => {
  response.status(startupState === 'ready' ? 200 : 503).json({
    ok: startupState === 'ready',
    state: startupState,
    error: startupError,
  })
})

function requireReady(_request, response, next) {
  if (startupState !== 'ready') {
    response.status(503).json({
      message: startupState === 'failed'
        ? 'Better Auth startup failed.'
        : 'Better Auth is still starting.',
      state: startupState,
      error: startupError,
    })
    return
  }

  next()
}

app.all('/api/auth', requireReady, authHandler)
app.all('/api/auth/*', requireReady, authHandler)

// Mount JSON parsing after the auth handler to avoid hanging Better Auth requests.
app.use(express.json())

app.use('/api/studio', requireReady, betterAuthStudio(studioConfig))

async function bootstrap() {
  try {
    if (autoMigrate) {
      const { toBeAdded, toBeCreated, runMigrations } = await getMigrations(auth.options)

      if (toBeCreated.length > 0 || toBeAdded.length > 0) {
        console.log(`Applying Better Auth migrations (${toBeCreated.length} tables, ${toBeAdded.length} columns)`)
        await runMigrations()
      }
    }

    const existingKeys = await database.query('SELECT COUNT(*)::int AS count FROM "jwks" WHERE "publicKey" LIKE $1', ['%"kty":"OKP"%'])
    if ((existingKeys.rows[0]?.count ?? 0) > 0) {
      console.log('Replacing incompatible Better Auth JWKS keys with RS256 keys.')
      await database.query('DELETE FROM "jwks" WHERE "publicKey" LIKE $1', ['%"kty":"OKP"%'])
    }

    // Seed initial admin user if specified
    const adminEmail = (process.env.BETTER_AUTH_ADMIN_EMAILS ?? 'admin@aebibtech.com').split(',')[0].trim()
    const adminPassword = process.env.BETTER_AUTH_ADMIN_PASSWORD ?? 'password1234'

    const { rows: userRows } = await database.query('SELECT id FROM "user" WHERE email = $1', [adminEmail])
    if (userRows.length === 0) {
      console.log(`Seeding initial admin user: ${adminEmail}`)
      try {
        await auth.api.createUser({
          body: {
            email: adminEmail,
            password: adminPassword,
            name: 'Admin User',
            role: 'admin',
          },
        })
      } catch (error) {
        console.error('Failed to seed admin user:', error)
      }
    }

    startupState = 'ready'
    console.log('Better Auth startup is ready.')
  } catch (error) {
    startupState = 'failed'
    startupError = error instanceof Error ? error.message : 'Unknown Better Auth startup error.'
    console.error('Better Auth startup failed.', error)
  }
}

app.listen(port, () => {
  console.log(`Better Auth listening on http://localhost:${port}`)
})

await bootstrap()