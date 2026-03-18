// BART real-time departures via 511 SF Bay API
export async function getBartDepartures(stationCode: string): Promise<string> {
  const apiKey = process.env.BART_511_API_KEY
  if (!apiKey) return 'Transit data unavailable (no API key)'

  const url = `http://api.511.org/transit/StopMonitoring?api_key=${apiKey}&agency=BA&stopCode=${stationCode}&format=json`
  try {
    const res = await fetch(url, { next: { revalidate: 30 } })
    const data = await res.json()
    const visits = data.ServiceDelivery?.StopMonitoringDelivery?.MonitoredStopVisit ?? []
    const departures = visits.slice(0, 4).map((v: Record<string, unknown>) => {
      const journey = v.MonitoredVehicleJourney as Record<string, unknown>
      const call = journey.MonitoredCall as Record<string, unknown>
      const line = journey.LineRef as string
      const dest = journey.DestinationName as string
      const expected = call?.ExpectedDepartureTime as string
      const mins = expected
        ? Math.round((new Date(expected).getTime() - Date.now()) / 60000)
        : '?'
      return `${line} to ${dest}: ${mins} min`
    })
    return departures.length > 0 ? departures.join(' | ') : 'No departures found'
  } catch {
    return 'Transit data unavailable'
  }
}

// Parse RSS feed and return recent headlines
export async function getNewsHeadlines(feedUrl: string, maxItems = 3): Promise<string[]> {
  try {
    const res = await fetch(feedUrl, { next: { revalidate: 300 } })
    const text = await res.text()
    const titles = [...text.matchAll(/<title><!\[CDATA\[(.+?)\]\]><\/title>|<title>(.+?)<\/title>/g)]
      .map(m => m[1] || m[2])
      .filter(t => t && !t.includes('http'))
      .slice(1, maxItems + 1) // skip channel title
    return titles
  } catch {
    return []
  }
}
