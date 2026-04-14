'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

type MeetResult =
  | { found: true; meetLink: string; title: string; start: string }
  | { found: false }

export default function MeetPage() {
  const searchParams = useSearchParams()
  const sig = searchParams.get('sig')
  const [status, setStatus] = useState<'loading' | 'joining' | 'none' | 'error'>('loading')
  const [title, setTitle] = useState('')

  useEffect(() => {
    const url = sig ? `/api/meet?sig=${sig}` : '/api/meet'
    fetch(url)
      .then(r => r.json())
      .then((data: MeetResult) => {
        if (data.found) {
          setTitle(data.title)
          setStatus('joining')
          // Small delay so the user sees the "Joining..." message before the redirect
          setTimeout(() => {
            window.location.href = data.meetLink
          }, 800)
        } else {
          setStatus('none')
        }
      })
      .catch(() => setStatus('error'))
  }, [sig])

  return (
    <main className="min-h-screen bg-black flex flex-col items-center justify-center text-white gap-4 px-6">
      {status === 'loading' && (
        <>
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <p className="text-lg text-gray-400">Checking calendar…</p>
        </>
      )}

      {status === 'joining' && (
        <>
          <div className="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-2xl font-semibold">Joining</p>
          <p className="text-gray-400 text-center">{title}</p>
        </>
      )}

      {status === 'none' && (
        <>
          <p className="text-4xl">📅</p>
          <p className="text-xl font-semibold">No meeting right now</p>
          <p className="text-gray-500 text-sm text-center">
            No Google Meet found in the next 15 minutes.
          </p>
        </>
      )}

      {status === 'error' && (
        <>
          <p className="text-4xl">⚠️</p>
          <p className="text-xl font-semibold">Something went wrong</p>
          <p className="text-gray-500 text-sm">Check that the app is configured correctly.</p>
        </>
      )}
    </main>
  )
}
