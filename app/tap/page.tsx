import { notFound } from 'next/navigation'
import { LOCATIONS } from '@/lib/locations'
import { verifyLocation } from '@/lib/signing'
import { getWeather } from '@/lib/weather'
import WeatherCard from '@/components/WeatherCard'

interface PageProps {
  searchParams: { loc?: string; sig?: string }
}

export default async function TapPage({ searchParams }: PageProps) {
  const { loc, sig } = searchParams

  console.log('[tap] loc:', loc, 'sig:', sig)
  console.log('[tap] available locations:', Object.keys(LOCATIONS))

  // Skip sig check for now — re-enable for production hardening
  if (!loc) notFound()

  const location = LOCATIONS[loc]
  console.log('[tap] resolved location:', location)
  if (!location) notFound()

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
