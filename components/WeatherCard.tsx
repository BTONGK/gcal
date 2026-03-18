'use client'

import { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import type { Location } from '@/lib/locations'
import type { WeatherData } from '@/lib/weather'
import AiBriefing from './AiBriefing'

// Curated SF background images by location (Unsplash photo IDs)
const SF_BACKGROUNDS: Record<string, string> = {
  bart_powell_st:      'photo-1449034446853-66c86144b0ad', // SF skyline night
  bart_16th_mission:   'photo-1518791841217-8f162f1912da', // Mission murals / colorful
  ferry_building:      'photo-1534430480872-3498386e7856', // SF bay waterfront
  hayes_valley_coffee: 'photo-1501594907352-04cda38ebc29', // SF street scene
  dolores_park:        'photo-1496442226666-8d4d0e62e6e9', // Dolores Park skyline view
  default:             'photo-1501594907352-04cda38ebc29', // Generic SF
}

function getBackgroundUrl(locId: string): string {
  const photoId = SF_BACKGROUNDS[locId] ?? SF_BACKGROUNDS.default
  return `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=1080&q=80`
}

type SavedCard = {
  id: string
  locationName: string
  neighborhood: string
  temperature: number
  condition: string
  icon: string
  savedAt: number
  backgroundUrl: string
}

interface WeatherCardProps {
  location: Location
  weather: WeatherData | null
  weatherError: boolean
  loc: string
  sig?: string
}

export default function WeatherCard({ location, weather, weatherError, loc, sig }: WeatherCardProps) {
  const [tapCount, setTapCount] = useState<number | null>(null)
  const [saved, setSaved] = useState(false)
  const [showSavedToast, setShowSavedToast] = useState(false)
  const [showCollections, setShowCollections] = useState(false)
  const [collections, setCollections] = useState<SavedCard[]>([])
  const [imageLoaded, setImageLoaded] = useState(false)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const bgUrl = getBackgroundUrl(loc)

  // Record tap + fetch count on mount
  useEffect(() => {
    async function recordTap() {
      try {
        await fetch('/api/tap-count', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ loc }),
        })
        const res = await fetch(`/api/tap-count?loc=${loc}`)
        const data = await res.json()
        setTapCount(data.count)
      } catch {
        // non-critical
      }
    }
    recordTap()
  }, [loc])

  // Load collections from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('tapnet_collections')
    if (stored) {
      const cards: SavedCard[] = JSON.parse(stored)
      setCollections(cards)
      const alreadySaved = cards.some(c => c.id === `${loc}_today`)
      setSaved(alreadySaved)
    }
  }, [loc])

  function handleSave() {
    if (saved || !weather) return

    const card: SavedCard = {
      id: `${loc}_today`,
      locationName: location.displayName,
      neighborhood: location.neighborhood,
      temperature: weather.temperature,
      condition: weather.condition,
      icon: weather.icon,
      savedAt: Date.now(),
      backgroundUrl: bgUrl,
    }

    const existing = JSON.parse(localStorage.getItem('tapnet_collections') ?? '[]') as SavedCard[]
    const updated = [card, ...existing.filter(c => c.id !== card.id)]
    localStorage.setItem('tapnet_collections', JSON.stringify(updated))
    setCollections(updated)
    setSaved(true)

    // Show toast
    setShowSavedToast(true)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setShowSavedToast(false), 2500)
  }

  function handleShare() {
    const text = weather
      ? `${weather.icon} ${weather.temperature}°F in ${location.displayName} right now. ${weather.condition}, high of ${weather.high}°. #TapNet`
      : `Checking the scene at ${location.displayName}, ${location.city}. #TapNet`
    if (navigator.share) {
      navigator.share({ text, url: window.location.href }).catch(() => {})
    } else {
      navigator.clipboard.writeText(text)
    }
  }

  function formatSavedAt(ts: number) {
    const diff = Date.now() - ts
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return new Date(ts).toLocaleDateString()
  }

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      {/* Background image */}
      <div className={`absolute inset-0 transition-opacity duration-700 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}>
        <Image
          src={bgUrl}
          alt={location.displayName}
          fill
          className="object-cover"
          priority
          onLoad={() => setImageLoaded(true)}
        />
      </div>

      {/* Dark gradient overlay — heavier at bottom for text legibility */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/80" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen max-w-md mx-auto px-5 py-10">

        {/* Top bar */}
        <div className="flex items-center justify-between mb-auto animate-fade-in">
          <div>
            <div className="text-[11px] font-semibold tracking-widest text-white/50 uppercase">You&apos;re at</div>
            <h1 className="text-lg font-bold text-white leading-tight">{location.displayName}</h1>
            <div className="text-[13px] text-white/60">{location.tagline}</div>
          </div>

          {/* Collections button */}
          <button
            onClick={() => setShowCollections(true)}
            className="flex flex-col items-center gap-0.5 text-white/70 hover:text-white transition-colors"
          >
            <span className="text-xl">🗂️</span>
            <span className="text-[10px] font-medium">Collection</span>
            {collections.length > 0 && (
              <span className="text-[10px] text-white/50">{collections.length}</span>
            )}
          </button>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Weather card */}
        <div
          className="animate-fade-up rounded-3xl overflow-hidden"
          style={{
            background: 'rgba(0,0,0,0.55)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.12)',
          }}
        >
          {weatherError || !weather ? (
            <div className="px-6 py-8 text-center text-white/50">
              <div className="text-4xl mb-2">🌡️</div>
              <div>Weather unavailable</div>
            </div>
          ) : (
            <div className="px-6 py-6">
              {/* Main temp + icon */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="text-7xl font-thin text-white leading-none">
                    {weather.temperature}°
                  </div>
                  <div className="text-white/70 text-base mt-1">{weather.condition}</div>
                  <div className="text-white/50 text-sm mt-0.5">
                    Feels like {weather.feelsLike}°
                  </div>
                </div>
                <div className="text-6xl">{weather.icon}</div>
              </div>

              {/* Hi/Lo bar */}
              <div className="flex gap-4 mb-5">
                <span className="text-sm text-white/60">H: <span className="text-white font-medium">{weather.high}°</span></span>
                <span className="text-sm text-white/60">L: <span className="text-white font-medium">{weather.low}°</span></span>
                <span className="text-sm text-white/60">💧 <span className="text-white font-medium">{weather.humidity}%</span></span>
                <span className="text-sm text-white/60">💨 <span className="text-white font-medium">{weather.windSpeed} mph</span></span>
              </div>

              {/* Divider */}
              <div className="h-px bg-white/10 mb-4" />

              {/* Tap count */}
              {tapCount !== null && (
                <div className="text-[12px] text-white/40 mb-4">
                  ✦ {tapCount.toLocaleString()} {tapCount === 1 ? 'tap' : 'taps'} at this spot
                </div>
              )}

              {/* AI Briefing */}
              <AiBriefing loc={loc} sig={sig} />

              {/* Action buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  disabled={saved}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold transition-all ${
                    saved
                      ? 'bg-white/10 text-white/40 cursor-default'
                      : 'bg-white text-black hover:bg-white/90 active:scale-95'
                  }`}
                >
                  {saved ? '✓ Saved' : '♡ Save'}
                </button>
                <button
                  onClick={handleShare}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold bg-white/15 text-white hover:bg-white/25 active:scale-95 transition-all"
                  style={{ border: '1px solid rgba(255,255,255,0.2)' }}
                >
                  ↗ Share
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-[11px] text-white/25 mt-5 tracking-wider">
          TAPNET · tap the world around you
        </div>
      </div>

      {/* Saved toast */}
      <div
        className={`fixed bottom-8 left-1/2 -translate-x-1/2 px-5 py-2.5 rounded-full text-sm font-semibold text-white transition-all duration-300 z-50 ${
          showSavedToast ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
        style={{
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.15)',
        }}
      >
        ✓ Added to your collection
      </div>

      {/* Collections drawer */}
      {showCollections && (
        <div className="fixed inset-0 z-50 flex items-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setShowCollections(false)}
          />
          {/* Sheet */}
          <div
            className="relative w-full max-w-md mx-auto rounded-t-3xl overflow-hidden animate-fade-up"
            style={{
              background: 'rgba(18,18,20,0.95)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(255,255,255,0.1)',
              maxHeight: '70vh',
            }}
          >
            <div className="px-6 pt-5 pb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">My Collection</h2>
              <button
                onClick={() => setShowCollections(false)}
                className="text-white/50 hover:text-white text-2xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="overflow-y-auto pb-8" style={{ maxHeight: 'calc(70vh - 80px)' }}>
              {collections.length === 0 ? (
                <div className="text-center text-white/30 py-12 px-6">
                  <div className="text-4xl mb-3">🗂️</div>
                  <div>No saved cards yet</div>
                  <div className="text-sm mt-1">Tap the Save button to collect a weather card</div>
                </div>
              ) : (
                <div className="px-4 space-y-3">
                  {collections.map(card => (
                    <div
                      key={card.id}
                      className="relative rounded-2xl overflow-hidden h-28 flex items-end"
                      style={{ border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                      {/* Mini background */}
                      <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url(${card.backgroundUrl})` }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                      <div className="relative z-10 px-4 pb-3 w-full flex items-end justify-between">
                        <div>
                          <div className="text-white font-semibold text-sm leading-tight">{card.locationName}</div>
                          <div className="text-white/50 text-xs">{card.neighborhood}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-white text-xl font-thin">{card.temperature}°</div>
                          <div className="text-white/50 text-xs">{card.icon} {card.condition}</div>
                          <div className="text-white/30 text-[10px]">{formatSavedAt(card.savedAt)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
