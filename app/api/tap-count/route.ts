import { NextResponse } from 'next/server'

// In-memory store for development; replace with Upstash Redis for production
const tapCounts: Record<string, number> = {}
const tapTimestamps: Record<string, number> = {}

export async function POST(request: Request) {
  const { loc } = await request.json()
  if (!loc) return NextResponse.json({ error: 'Missing loc' }, { status: 400 })

  tapCounts[loc] = (tapCounts[loc] ?? 0) + 1
  tapTimestamps[loc] = Date.now()

  return NextResponse.json({ count: tapCounts[loc], lastTap: tapTimestamps[loc] })
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const loc = searchParams.get('loc')
  if (!loc) return NextResponse.json({ error: 'Missing loc' }, { status: 400 })

  return NextResponse.json({
    count: tapCounts[loc] ?? 0,
    lastTap: tapTimestamps[loc] ?? null,
  })
}
