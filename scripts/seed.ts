/**
 * Thin wrapper — real seed lives at prisma/seed.ts (configured via package.json prisma.seed).
 */
import { spawnSync } from 'child_process'

const result = spawnSync('npx', ['tsx', 'prisma/seed.ts'], {
  stdio: 'inherit',
  cwd: process.cwd(),
  shell: true,
})

process.exit(result.status ?? 1)
