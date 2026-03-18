export type WeatherData = {
  temperature: number
  feelsLike: number
  high: number
  low: number
  humidity: number
  windSpeed: number
  condition: string
  conditionCode: number
  icon: string
  bgGradient: string
}

// WMO weather code → human label + emoji
function interpretWeatherCode(code: number): { condition: string; icon: string; bgGradient: string } {
  if (code === 0)  return { condition: 'Clear Sky',         icon: '☀️',  bgGradient: 'from-sky-400 to-blue-600' }
  if (code <= 2)   return { condition: 'Partly Cloudy',     icon: '⛅',  bgGradient: 'from-slate-400 to-blue-500' }
  if (code <= 3)   return { condition: 'Overcast',          icon: '☁️',  bgGradient: 'from-slate-500 to-slate-700' }
  if (code <= 49)  return { condition: 'Foggy',             icon: '🌫️', bgGradient: 'from-slate-400 to-slate-600' }
  if (code <= 59)  return { condition: 'Drizzle',           icon: '🌦️', bgGradient: 'from-slate-500 to-blue-700' }
  if (code <= 69)  return { condition: 'Rainy',             icon: '🌧️', bgGradient: 'from-blue-600 to-slate-800' }
  if (code <= 79)  return { condition: 'Snow',              icon: '❄️',  bgGradient: 'from-blue-100 to-slate-400' }
  if (code <= 84)  return { condition: 'Rain Showers',      icon: '🌦️', bgGradient: 'from-blue-500 to-slate-700' }
  if (code <= 99)  return { condition: 'Thunderstorm',      icon: '⛈️',  bgGradient: 'from-slate-700 to-slate-900' }
  return { condition: 'Unknown', icon: '🌡️', bgGradient: 'from-slate-500 to-slate-700' }
}

export async function getWeather(lat: number, lon: number): Promise<WeatherData> {
  const url = new URL('https://api.open-meteo.com/v1/forecast')
  url.searchParams.set('latitude', String(lat))
  url.searchParams.set('longitude', String(lon))
  url.searchParams.set('current', [
    'temperature_2m',
    'apparent_temperature',
    'relative_humidity_2m',
    'weather_code',
    'wind_speed_10m',
  ].join(','))
  url.searchParams.set('daily', 'temperature_2m_max,temperature_2m_min')
  url.searchParams.set('temperature_unit', 'fahrenheit')
  url.searchParams.set('wind_speed_unit', 'mph')
  url.searchParams.set('timezone', 'America/Los_Angeles')
  url.searchParams.set('forecast_days', '1')

  const res = await fetch(url.toString(), { next: { revalidate: 300 } })
  if (!res.ok) throw new Error(`Weather API error: ${res.status}`)
  const data = await res.json()

  const current = data.current
  const daily = data.daily
  const code: number = current.weather_code
  const { condition, icon, bgGradient } = interpretWeatherCode(code)

  return {
    temperature: Math.round(current.temperature_2m),
    feelsLike: Math.round(current.apparent_temperature),
    high: Math.round(daily.temperature_2m_max[0]),
    low: Math.round(daily.temperature_2m_min[0]),
    humidity: Math.round(current.relative_humidity_2m),
    windSpeed: Math.round(current.wind_speed_10m),
    condition,
    conditionCode: code,
    icon,
    bgGradient,
  }
}
