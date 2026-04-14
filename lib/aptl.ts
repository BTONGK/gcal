/**
 * APTL adapter for tapnet.
 * Replaces direct Claude calls with APTL API calls.
 *
 * Flow: local sig verify → APTL tap/verify (server-to-server) → APTL briefing stream
 */
import { createHmac } from 'crypto'

const APTL_BASE = process.env.APTL_BASE_URL ?? 'http://localhost:3001'
const APTL_API_KEY = process.env.APTL_API_KEY ?? ''

// Mapping from tapnet loc IDs → APTL tag IDs (populated by register-tapnet-tags script)
// Falls back to direct Claude call if APTL_TAG_MAP is not set
function getTagMap(): Record<string, string> {
  try {
    return JSON.parse(process.env.APTL_TAG_MAP ?? '{}')
  } catch {
    return {}
  }
}

/**
 * Stream a briefing for a tapnet location via APTL.
 * Returns a ReadableStream of text chunks (same format as the existing briefing route).
 *
 * If APTL is not configured, returns null (caller should fall back to direct Claude).
 */
export async function streamAptlBriefing(loc: string): Promise<ReadableStream<Uint8Array> | null> {
  if (!APTL_API_KEY) return null

  const tagMap = getTagMap()
  const tagId = tagMap[loc]
  if (!tagId) return null

  // Compute a fresh server-side 32-char HMAC — we already verified the URL sig locally.
  // This is a server-to-server trusted call, so we generate the sig fresh.
  const secret = process.env.TAPNET_SIGNING_SECRET
  if (!secret) return null

  const sig = createHmac('sha256', secret).update(loc).digest('hex').slice(0, 32)

  // Step 1: verify tap, create session
  const verifyRes = await fetch(`${APTL_BASE}/v1/taps/verify`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${APTL_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ tag_id: tagId, signature: sig }),
  })

  if (!verifyRes.ok) {
    console.error('[aptl] tap verify failed:', await verifyRes.text())
    return null
  }

  const { session_id, session_token } = await verifyRes.json()

  // Step 2: stream briefing
  const briefingRes = await fetch(`${APTL_BASE}/v1/sessions/${session_id}/briefing`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session_token}`,
      'Content-Type': 'application/json',
    },
    body: '{}',
  })

  if (!briefingRes.ok || !briefingRes.body) {
    console.error('[aptl] briefing failed:', briefingRes.status)
    return null
  }

  // Transform SSE stream (event: text\ndata: {"text":"..."}) → plain text stream
  const encoder = new TextEncoder()
  const decoder = new TextDecoder()

  const transformed = new TransformStream<Uint8Array, Uint8Array>({
    transform(chunk, controller) {
      const text = decoder.decode(chunk, { stream: true })
      // Parse SSE lines and extract text deltas
      for (const line of text.split('\n')) {
        if (line.startsWith('data: ')) {
          try {
            const json = JSON.parse(line.slice(6))
            if (json.text) controller.enqueue(encoder.encode(json.text))
          } catch { /* skip malformed */ }
        }
      }
    },
  })

  briefingRes.body.pipeTo(transformed.writable).catch(() => {})
  return transformed.readable
}

/**
 * Get tap count for a location from APTL analytics.
 * Falls back to 0 if APTL not configured.
 */
export async function getAptlTapCount(loc: string): Promise<number> {
  if (!APTL_API_KEY) return 0

  const tagMap = getTagMap()
  const tagId = tagMap[loc]
  if (!tagId) return 0

  try {
    const res = await fetch(`${APTL_BASE}/v1/tags/${tagId}/analytics`, {
      headers: { 'Authorization': `Bearer ${APTL_API_KEY}` },
      next: { revalidate: 30 },
    })
    if (!res.ok) return 0
    const data = await res.json()
    return data.total_taps ?? 0
  } catch {
    return 0
  }
}
