import { google } from 'googleapis'
import { NextResponse } from 'next/server'
import { verifyLocation } from '@/lib/signing'

export const runtime = 'nodejs'

function getOAuthClient() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  )
  oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN })
  return oauth2Client
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const sig = searchParams.get('sig')

  const isDev = process.env.NODE_ENV === 'development'
  if (!isDev && (!sig || !verifyLocation('meet', sig))) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  if (!process.env.GOOGLE_REFRESH_TOKEN) {
    return NextResponse.json({ error: 'GOOGLE_REFRESH_TOKEN not set in environment' }, { status: 500 })
  }

  const auth = getOAuthClient()
  const calendar = google.calendar({ version: 'v3', auth })

  const debug = searchParams.get('debug') === '1'
  const now = new Date()
  const windowStart = new Date(now.getTime() - 5 * 60 * 1000)   // 5 min ago
  const windowEnd = new Date(now.getTime() + 30 * 60 * 1000)    // 30 min from now

  let res
  try {
    res = await calendar.events.list({
      calendarId: 'primary',
      timeMin: windowStart.toISOString(),
      timeMax: windowEnd.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: 'Google Calendar API error', detail: msg }, { status: 500 })
  }

  const events = res.data.items ?? []

  if (debug) {
    return NextResponse.json({
      now: now.toISOString(),
      windowStart: windowStart.toISOString(),
      windowEnd: windowEnd.toISOString(),
      totalEvents: events.length,
      events: events.map(e => ({
        title: e.summary,
        start: e.start?.dateTime ?? e.start?.date,
        hangoutLink: e.hangoutLink ?? null,
        conferenceData: e.conferenceData ?? null,
      })),
    })
  }

  // Find the first event with a Google Meet link
  for (const event of events) {
    const meetLink =
      event.hangoutLink ??
      event.conferenceData?.entryPoints?.find(ep => ep.entryPointType === 'video')?.uri

    if (meetLink) {
      const email = process.env.GOOGLE_ACCOUNT_EMAIL
      const finalLink = email ? `${meetLink}?authuser=${encodeURIComponent(email)}` : meetLink
      return NextResponse.json({
        found: true,
        meetLink: finalLink,
        title: event.summary ?? 'Meeting',
        start: event.start?.dateTime ?? event.start?.date,
      })
    }
  }

  return NextResponse.json({ found: false })
}
