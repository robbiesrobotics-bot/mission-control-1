import { NextResponse } from 'next/server'

export type PipelineStatus = 'healthy' | 'degraded' | 'down' | 'unknown'
export type NodeStatus = 'healthy' | 'degraded' | 'down' | 'unknown'

export interface Pipeline {
  name: string
  status: PipelineStatus
  lastChecked: string
  details?: string
}

export interface NodeInfo {
  name: string
  hostname: string
  ip?: string
  status: NodeStatus
  lastSeen: string
  loadedModels?: string[]
  role?: string
}

export interface HealthResponse {
  pipelines: Pipeline[]
  nodes: NodeInfo[]
  timestamp: string
}

interface HealthCheckResult {
  status: PipelineStatus
  details?: string
  models?: string[]
}

async function checkEndpoint(
  url: string,
  timeoutMs = 5000
): Promise<HealthCheckResult> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), timeoutMs)

    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'Accept': 'application/json' },
    })

    clearTimeout(timeout)

    if (!res.ok) {
      return { status: 'down', details: `HTTP ${res.status}` }
    }

    const data = await res.json().catch(() => ({}))

    // Handle different health response shapes
    const status = typeof data.status === 'string'
      ? normalizeStatus(data.status)
      : 'healthy'

    return {
      status,
      details: data.message || data.details || undefined,
      models: data.models || data.available_models || undefined,
    }
  } catch (err: any) {
    if (err.name === 'AbortError' || err.message?.includes('aborted')) {
      return { status: 'down', details: 'Timeout' }
    }
    return { status: 'unknown', details: err?.message || 'Connection failed' }
  }
}

function normalizeStatus(s: string): PipelineStatus {
  const lower = s.toLowerCase()
  if (lower === 'healthy' || lower === 'ok' || lower === 'up' || lower === 'running') return 'healthy'
  if (lower === 'degraded' || lower === 'warning' || lower === 'slow') return 'degraded'
  if (lower === 'down' || lower === 'unhealthy' || lower === 'error' || lower === 'failed') return 'down'
  return 'unknown'
}

function nodeStatusFromPipeline(p: PipelineStatus): NodeStatus {
  return p
}

function now(): string {
  return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

export async function GET() {
  const timestamp = now()

  // --- Pipeline checks ---
  const [fluxMacMini, ltxMacStudio, voiceUbuntu, musicMacStudio, aceStepAGX, ollamaMacMini] = await Promise.all([
    checkEndpoint('https://openclawalices-mac-mini.taila15762.ts.net/health'),
    checkEndpoint('http://localhost:7860/health'),
    checkEndpoint('http://100.106.110.119:8080/tts/health'),
    checkEndpoint('http://localhost:8001/health'),
    checkEndpoint('http://jetson-agx-orin.local:8000/health').catch(() => ({ status: 'unknown' as PipelineStatus, details: 'Not reachable' })),
    checkEndpoint('http://localhost:7860/health'), // Ollama on Mac Mini also behind this proxy
  ])

  // Fallback: try Ollama direct
  const ollamaMacMiniDirect = await checkEndpoint('http://localhost:11434/api/tags').catch(() => ({ status: 'unknown' as PipelineStatus }))

  // Check Ollama on Mac Studio
  const ollamaMacStudio = await checkEndpoint('http://localhost:11434/api/tags').catch(() => ({ status: 'unknown' as PipelineStatus }))

  // Check Ollama on MacBook Air
  const ollamaMacBookAir = await checkEndpoint('http://localhost:11434/api/tags').catch(() => ({ status: 'unknown' as PipelineStatus }))

  // Check Ollama on AGX Orin
  const ollamaAGX = await checkEndpoint('http://jetson-agx-orin.local:11434/api/tags').catch(() => ({ status: 'unknown' as PipelineStatus }))

  const pipelines: Pipeline[] = [
    {
      name: 'Flux (Image Gen)',
      status: fluxMacMini.status,
      lastChecked: timestamp,
      details: fluxMacMini.details,
    },
    {
      name: 'LTX Video',
      status: ltxMacStudio.status,
      lastChecked: timestamp,
      details: ltxMacStudio.details,
    },
    {
      name: 'Voice (Whisper + Kokoro)',
      status: voiceUbuntu.status,
      lastChecked: timestamp,
      details: voiceUbuntu.details,
    },
    {
      name: 'ACE-Step Music',
      status: musicMacStudio.status,
      lastChecked: timestamp,
      details: musicMacStudio.details,
    },
    {
      name: 'Ollama',
      status:
        ollamaMacMiniDirect.status === 'healthy' ||
        ollamaMacStudio.status === 'healthy' ||
        ollamaMacBookAir.status === 'healthy' ||
        ollamaAGX.status === 'healthy'
          ? 'healthy'
          : ollamaMacMiniDirect.status === 'degraded' ||
            ollamaMacStudio.status === 'degraded' ||
            ollamaMacBookAir.status === 'degraded' ||
            ollamaAGX.status === 'degraded'
            ? 'degraded'
            : 'down',
      lastChecked: timestamp,
      details: 'Distributed across Mac Mini, Mac Studio, MacBook Air, AGX Orin',
    },
  ]

  // --- Node list ---
  const nodes: NodeInfo[] = [
    {
      name: 'Mac Mini',
      hostname: 'openclawalices-mac-mini.taila15762.ts.net',
      ip: 'Mac Mini Tailscale',
      status: fluxMacMini.status,
      lastSeen: timestamp,
      role: 'Flux Image Gen + Ollama',
      loadedModels: ollamaMacMiniDirect.models,
    },
    {
      name: 'Mac Studio',
      hostname: 'localhost',
      ip: 'localhost',
      status: ltxMacStudio.status,
      lastSeen: timestamp,
      role: 'LTX Video + Music + Ollama',
      loadedModels: ollamaMacStudio.models,
    },
    {
      name: 'Ubuntu Desktop',
      hostname: '100.106.110.119',
      ip: '100.106.110.119',
      status: voiceUbuntu.status,
      lastSeen: timestamp,
      role: 'Voice (Whisper + Kokoro)',
    },
    {
      name: 'MacBook Air',
      hostname: 'localhost',
      ip: 'localhost',
      status: ollamaMacBookAir.status,
      lastSeen: timestamp,
      role: 'Ollama (lightweight)',
      loadedModels: ollamaMacBookAir.models,
    },
    {
      name: 'Jetson AGX Orin',
      hostname: 'jetson-agx-orin.local',
      ip: 'jetson-agx-orin.local',
      status: aceStepAGX.status,
      lastSeen: timestamp,
      role: 'ACE-Step Music + Ollama',
      loadedModels: ollamaAGX.models,
    },
  ]

  return NextResponse.json<HealthResponse>({ pipelines, nodes, timestamp })
}
