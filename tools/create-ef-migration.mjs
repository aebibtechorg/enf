import { spawnSync } from 'node:child_process'

const [migrationName, ...extraArgs] = process.argv.slice(2)

if (!migrationName) {
  console.error('Usage: pnpm db:migration:create <MigrationName> [additional dotnet-ef args]')
  process.exit(1)
}

const args = [
  'tool',
  'run',
  'dotnet-ef',
  'migrations',
  'add',
  migrationName,
  '--project',
  'apps/api/Api.csproj',
  '--startup-project',
  'apps/api/Api.csproj',
  '--output-dir',
  'Infrastructure/Database/Migrations',
  ...extraArgs,
]

const result = spawnSync('dotnet', args, {
  cwd: process.cwd(),
  stdio: 'inherit',
})

if (result.error) {
  console.error(result.error.message)
  process.exit(1)
}

process.exit(result.status ?? 1)