#!/usr/bin/env node
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawn, execFileSync } from 'node:child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const PID_DIR = path.join(ROOT, '.pids')
const LOG_DIR = path.join(ROOT, 'logs')
fs.mkdirSync(PID_DIR, { recursive: true })
fs.mkdirSync(LOG_DIR, { recursive: true })

const REGISTRY = path.join(os.homedir(), '.ai-forecasting-hackathon', 'ports.tsv')
const DOMAIN = process.env.TUNNEL_DOMAIN || 'ai-forecasting-hackathon.joernstoehler.com'
const TUNNEL_NAME = process.env.TUNNEL_NAME || 'forecasting'

function readFile(p) { try { return fs.readFileSync(p, 'utf8') } catch { return '' } }
function writeFile(p, data) { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, data) }

function parseArgs(argv) {
  // Support legacy flags: --actions, --services
  const out = { sub: null, actions: [], services: [] }
  const a = [...argv]
  if (a.length && !a[0].startsWith('-')) {
    out.sub = a.shift()
  }
  while (a.length) {
    const x = a.shift()
    if (x === '--actions') { while (a.length && !a[0].startsWith('--')) out.actions.push(a.shift()); continue }
    if (x === '--services') { while (a.length && !a[0].startsWith('--')) out.services.push(a.shift()); continue }
  }
  if (!out.sub) {
    // legacy path: actions determine sub; default status
    out.sub = 'status'
    if (out.actions.length === 1) out.sub = out.actions[0]
  }
  if (out.services.length === 0 && out.sub !== 'tunnel' && out.sub !== 'health') {
    out.services = ['docs', 'frontend', 'backend']
  }
  return out
}

function portInUse(port) {
  try {
    // Use ss if available
    execFileSync('bash', ['-lc', `ss -ltnH | awk -v p=":${port}" '$4 ~ p {found=1} END{exit !found}'`], { stdio: 'ignore' })
    return true
  } catch {
    return false
  }
}

function nextFree(start, reserved) {
  let p = start
  const set = new Set(reserved)
  while (true) {
    if (!set.has(String(p)) && !portInUse(p)) return String(p)
    p++
  }
}

function ensurePorts() {
  const abs = ROOT
  const lines = readFile(REGISTRY).split(/\r?\n/).filter(Boolean)
  let entry = lines.find(l => !l.startsWith('#') && l.split('\t')[0] === abs)
  let docs = process.env.DOCS_PORT || ''
  let fe = process.env.FRONTEND_PORT || ''
  let be = process.env.BACKEND_PORT || ''
  if (entry && !(docs || fe || be)) {
    const [, d, f, b] = entry.split('\t')
    docs = d; fe = f; be = b
  }
  const reserved = []
  for (const l of lines) {
    if (l.startsWith('#')) continue
    const parts = l.split('\t')
    if (parts.length >= 4) { reserved.push(parts[1], parts[2], parts[3]) }
  }
  if (!docs) docs = nextFree(8000, reserved)
  if (!fe) fe = nextFree(5173, reserved)
  if (!be) be = nextFree(8080, reserved)
  const exportEnv = { DOCS_PORT: docs, FRONTEND_PORT: fe, BACKEND_PORT: be }
  // persist
  let newLines = lines.filter(l => !(l.split('\t')[0] === abs))
  if (newLines.length === 0 || !newLines[0].startsWith('#')) newLines.unshift('# path\tdocs\tfrontend\tbackend')
  newLines.push([abs, docs, fe, be].join('\t'))
  writeFile(REGISTRY, newLines.join('\n') + '\n')
  return exportEnv
}

function isRunning(pidFile) {
  try { const pid = Number(readFile(pidFile).trim()); if (!pid) return false; process.kill(pid, 0); return true } catch { return false }
}

function logPath(name) { return path.join(LOG_DIR, `${name}.log`) }
function pidPath(name) { return path.join(PID_DIR, `${name}.pid`) }

function spawnDetached(name, cmd) {
  const logFd = fs.openSync(logPath(name), 'a')
  const child = spawn('/bin/bash', ['-lc', cmd], {
    cwd: ROOT,
    detached: true,
    stdio: ['ignore', logFd, logFd],
    env: { ...process.env },
  })
  writeFile(pidPath(name), String(child.pid))
  child.unref()
  try { fs.closeSync(logFd) } catch {}
}

async function stopService(name) {
  const p = pidPath(name)
  if (!isRunning(p)) return false
  const pid = Number(readFile(p).trim())
  try { process.kill(-pid, 'SIGTERM') } catch { try { process.kill(pid, 'SIGTERM') } catch {} }
  await new Promise(r => setTimeout(r, 200))
  try { process.kill(-pid, 'SIGKILL') } catch {}
  try { fs.rmSync(p) } catch {}
  return true
}

function startService(name, ports) {
  if (isRunning(pidPath(name))) return false
  if (name === 'docs') {
    try { execFileSync('bash', ['-lc', 'command -v mkdocs >/dev/null 2>&1']) } catch { throw new Error('mkdocs not installed. pip install mkdocs-material') }
    spawnDetached('docs', `env MKDOCS_DEV_SRV_ADDR=0.0.0.0 mkdocs serve -a 0.0.0.0:${ports.DOCS_PORT}`)
    return true
  }
  if (name === 'frontend') {
    spawnDetached('frontend', `env PORT=${ports.FRONTEND_PORT} npm run dev --workspace frontend -- --host 0.0.0.0 --port ${ports.FRONTEND_PORT} --strictPort`)
    return true
  }
  if (name === 'backend') {
    spawnDetached('backend', `env PORT=${ports.BACKEND_PORT} npm run dev --workspace backend`)
    return true
  }
  throw new Error('unknown service: ' + name)
}

function statusLine(name, ports) {
  const running = isRunning(pidPath(name)) ? 'yes' : 'no'
  const port = name === 'docs' ? ports.DOCS_PORT : name === 'frontend' ? ports.FRONTEND_PORT : ports.BACKEND_PORT
  return `${name} running=${running} port=${port}`
}

function cloudflared(args, opts = {}) {
  return execFileSync('cloudflared', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], ...opts })
}

function ensureTunnelConfig(ports) {
  const cfgDir = path.join(ROOT, 'tunnel')
  const cfgFile = path.join(cfgDir, 'config.yml')
  fs.mkdirSync(cfgDir, { recursive: true })
  let tid = ''
  try {
    const list = cloudflared(['tunnel', 'list'])
    const line = list.split(/\r?\n/).find(l => l.includes(` ${TUNNEL_NAME} `))
    if (line) tid = line.trim().split(/\s+/)[0]
  } catch {}
  if (!tid) {
    const out = cloudflared(['tunnel', 'create', TUNNEL_NAME])
    const m = out.match(/[0-9a-f-]{36}/)
    if (m) tid = m[0]
  }
  const cred = path.join(os.homedir(), '.cloudflared', `${tid}.json`)
  if (!fs.existsSync(cred)) throw new Error('cloudflared credentials missing. Run: cloudflared login')
  const yaml = `tunnel: ${TUNNEL_NAME}\ncredentials-file: ${cred}\n\ningress:\n  - hostname: ${DOMAIN}\n    path: /api/*\n    service: http://localhost:${ports.BACKEND_PORT}\n  - hostname: ${DOMAIN}\n    service: http://localhost:${ports.FRONTEND_PORT}\n  - service: http_status:404\n`
  writeFile(cfgFile, yaml)
  return { cfgFile }
}

function tunnelActive() {
  try {
    const list = cloudflared(['tunnel', 'list'])
    const line = list.split(/\r?\n/).find(l => l.includes(` ${TUNNEL_NAME} `))
    if (!line) return false
    return /\d+x/.test(line)
  } catch { return false }
}

async function main() {
  const { sub, services } = parseArgs(process.argv.slice(2))
  const ports = ensurePorts()

  if (sub === 'status') {
    for (const s of services) console.log(statusLine(s, ports))
    return
  }
  if (sub === 'start') {
    for (const s of services) { startService(s, ports); console.log(`Started ${s}`) }
    for (const s of services) console.log(statusLine(s, ports))
    return
  }
  if (sub === 'stop') {
    for (const s of services) { const did = await stopService(s); if (did) console.log(`Stopped ${s}`); else console.log(`${s} not running`) }
    for (const s of services) console.log(statusLine(s, ports))
    return
  }
  if (sub === 'tunnel') {
    const action = (process.argv.includes('--actions') ? process.argv[process.argv.indexOf('--actions') + 1] : 'status')
    if (action === 'status') {
      const running = isRunning(pidPath('tunnel')) ? 'yes' : 'no'
      const active = tunnelActive() ? 'yes' : 'no'
      console.log(`tunnel running=${running} active=${active} domain=${DOMAIN} fe_port=${ports.FRONTEND_PORT} be_port=${ports.BACKEND_PORT}`)
      return
    }
    if (action === 'stop') {
      await stopService('tunnel')
      console.log('Stopped tunnel')
      return
    }
    if (action === 'start' || action === 'restart') {
      await stopService('tunnel')
      const { cfgFile } = ensureTunnelConfig(ports)
      spawnDetached('tunnel', `cloudflared tunnel --no-autoupdate --config ${cfgFile} run ${TUNNEL_NAME}`)
      try { cloudflared(['tunnel', 'route', 'dns', TUNNEL_NAME, DOMAIN], { timeout: 15000 }) } catch {}
      console.log(`Started tunnel to https://${DOMAIN}`)
      console.log(`- Frontend: https://${DOMAIN}`)
      console.log(`- Backend:  https://${DOMAIN}/api`)
      return
    }
  }
  if (sub === 'health') {
    console.log(`ports DOCS=${ports.DOCS_PORT} FE=${ports.FRONTEND_PORT} BE=${ports.BACKEND_PORT}`)
    console.log('status:'); for (const s of ['docs','frontend','backend']) console.log(statusLine(s, ports))
    const running = isRunning(pidPath('tunnel')) ? 'yes' : 'no'
    const active = tunnelActive() ? 'yes' : 'no'
    console.log('tunnel:'); console.log(`tunnel running=${running} active=${active} domain=${DOMAIN} fe_port=${ports.FRONTEND_PORT} be_port=${ports.BACKEND_PORT}`)
    // Quick probes via curl for simplicity
    const beOk = (()=>{ try { execFileSync('curl', ['-sS','--max-time','5','--connect-timeout','2',`http://127.0.0.1:${ports.BACKEND_PORT}/api/health`], { stdio: ['ignore','ignore','ignore'] }); return 1 } catch { return 0 } })()
    let feCode = 0
    try { const out = execFileSync('bash',['-lc', `curl -sS -I --max-time 5 --connect-timeout 2 http://127.0.0.1:${ports.FRONTEND_PORT}/ | awk 'NR==1{print $2}'`], { encoding:'utf8' }); feCode = Number((out||'0').trim()) } catch {}
    let domFe = 0, domBe = 0
    try { const out = execFileSync('bash',['-lc', `curl -sS -o /dev/null -w '%{http_code}' --max-time 6 --connect-timeout 3 https://${DOMAIN}`], { encoding:'utf8' }); domFe = Number((out||'0').trim()) } catch {}
    try { execFileSync('curl',['-sS','--max-time','6','--connect-timeout','3',`https://${DOMAIN}/api/health`], { stdio: ['ignore','ignore','ignore'] }); domBe = 1 } catch { domBe = 0 }
    console.log(`local FE=${feCode===200?1:0}(${feCode||0}) BE=${beOk} domain FE_code=${domFe||0} BE=${domBe}`)
    return
  }
  console.error('Unknown command. Use start|stop|status|tunnel|health')
  process.exit(2)
}

main().catch(e => { console.error(String(e.message||e)); process.exit(1) })

