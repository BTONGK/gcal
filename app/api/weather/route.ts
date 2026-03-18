import { NextResponse } from 'next/server'
import { LOCATIONS } from '@/lib/locations'
import { getWeather } from '@/lib/weather'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const loc = searchParams.get('loc')

  if (!loc) return NextResponse.json({ error: 'Missing loc' }, { status: 400 })

  const location = LOCATIONS[loc]
  if (!location) return NextResponse.json({ error: 'Unknown location' }, { status: 404 })

  try {
    const weather = await getWeather(location.lat, location.lon)
    return NextResponse.json(weather)
  } catch (err) {
    console.error('Weather fetch error:', err)
    return NextResponse.json({ error: 'Weather unavailable' }, { status: 500 })
  }
}
