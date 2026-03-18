import { notFound } from 'next/navigation'
import { LOCATIONS } from '@/lib/locations'
import { getWeather } from '@/lib/weather'
import WeatherCard from '@/components/WeatherCard'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: { loc?: string; sig?: string }
}

export default async function TapPage({ searchParams }: PageProps) {
  const loc = searchParams.loc
  const sig = searchParams.sig

  if (!loc || !LOCATIONS[loc]) notFound()

  const location = LOCATIONS[loc]

  let weather = null
  let weatherError = false
  try {
    weather = await getWeather(location.lat, location.lon)
  } catch {
    weatherError = true
  }

  return (
    <WeatherCard
      location={location}
      weather={weather}
      weatherError={weatherError}
      loc={loc}
      sig={sig}
    />
  )
}
