import type { Location } from './locations'
import type { WeatherData } from './weather'
import { getBartDepartures, getNewsHeadlines } from './data-fetchers'

export async function buildLocationPrompt(location: Location, weather: WeatherData | null): Promise<string> {
  const now = new Date()
  const timeStr = now.toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit', hour12: true, timeZone: location.timezone,
  })
  const dayStr = now.toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', timeZone: location.timezone,
  })

  // Fetch transit + news in parallel
  const [transitData, ...newsBatches] = await Promise.all([
    location.transitStationCode
      ? getBartDepartures(location.transitStationCode)
      : Promise.resolve(null),
    ...location.newsFeedUrls.map(url => getNewsHeadlines(url, 2)),
  ])

  const headlines = (newsBatches as string[][]).flat().slice(0, 4)

  const weatherSection = weather
    ? `Current weather: ${weather.temperature}°F, ${weather.condition}. Feels like ${weather.feelsLike}°F. Wind ${weather.windSpeed} mph. Humidity ${weather.humidity}%.`
    : 'Weather data unavailable.'

  const transitSection = transitData
    ? `BART departures: ${transitData}`
    : ''

  const newsSection = headlines.length > 0
    ? `Recent local news: ${headlines.join(' | ')}`
    : ''

  return `You are TapNet, an AI that gives people a fast, useful briefing about where they are right now.

Location: ${location.displayName}, ${location.neighborhood}, ${location.city}
Time: ${timeStr} on ${dayStr}
About this spot: ${location.contextHint}
${weatherSection}
${transitSection}
${newsSection}

Write a friendly, useful 3-4 sentence briefing about right now at this location.
- Lead with the most immediately useful thing (transit status, notable weather, or local news)
- Include one hyperlocal detail specific to this neighborhood
- End with something to look forward to or be aware of today
- Speak like a knowledgeable local friend, not a robot
- Keep it under 100 words total`.trim()
}
