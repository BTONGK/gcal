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

  // In development, skip signature check if no secret is configured
  const isDev = process.env.NODE_ENV === 'development' && !process.env.TAPNET_SIGNING_SECRET
  if (!loc || (!isDev && (!sig || !verifyLocation(loc, sig)))) notFound()

  const location = LOCATIONS[loc]
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
