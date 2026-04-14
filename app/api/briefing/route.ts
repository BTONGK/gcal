import Anthropic from '@anthropic-ai/sdk'
import { LOCATIONS } from '@/lib/locations'
import { verifyLocation } from '@/lib/signing'
import { getWeather } from '@/lib/weather'
import { buildLocationPrompt } from '@/lib/prompt-builder'
import { streamAptlBriefing } from '@/lib/aptl'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const loc = searchParams.get('loc')
  const sig = searchParams.get('sig')

  const isDev = process.env.NODE_ENV === 'development' && !process.env.TAPNET_SIGNING_SECRET
  if (!loc || (!isDev && (!sig || !verifyLocation(loc, sig)))) {
    return new Response('Invalid request', { status: 400 })
  }

  const location = LOCATIONS[loc]
  if (!location) return new Response('Unknown location', { status: 404 })

  // Try APTL first — falls back to direct Claude if not configured
  const aptlStream = await streamAptlBriefing(loc)
  if (aptlStream) {
    return new Response(aptlStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Powered-By': 'APTL',
      },
    })
  }

  // Fallback: direct Claude call (original behaviour)
  let weather = null
  try {
    weather = await getWeather(location.lat, location.lon)
  } catch { /* proceed without weather */ }

  const prompt = await buildLocationPrompt(location, weather)
  const client = new Anthropic()
  const stream = client.messages.stream({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 200,
    messages: [{ role: 'user', content: prompt }],
  })

  const encoder = new TextEncoder()
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
            controller.enqueue(encoder.encode(chunk.delta.text))
          }
        }
      } finally {
        controller.close()
      }
    },
  })

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  })
}
