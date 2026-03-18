'use client'

import { useEffect, useState } from 'react'

interface AiBriefingProps {
  loc: string
  sig?: string
}

export default function AiBriefing({ loc, sig }: AiBriefingProps) {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams({ loc })
    if (sig) params.set('sig', sig)

    let cancelled = false

    async function stream() {
      try {
        const res = await fetch(`/api/briefing?${params}`)
        if (!res.ok || !res.body) throw new Error('Failed')

        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        setLoading(false)

        while (true) {
          const { done, value } = await reader.read()
          if (done || cancelled) break
          setText(prev => prev + decoder.decode(value, { stream: true }))
        }
      } catch {
        if (!cancelled) setError(true)
        setLoading(false)
      }
    }

    stream()
    return () => { cancelled = true }
  }, [loc, sig])

  if (error) return null

  return (
    <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="flex items-center gap-1.5 mb-2">
        <span className="text-[10px] font-semibold tracking-widest text-white/30 uppercase">AI Briefing</span>
        {loading && (
          <span className="flex gap-0.5">
            {[0, 1, 2].map(i => (
              <span
                key={i}
                className="inline-block w-1 h-1 rounded-full bg-white/30 animate-pulse"
                style={{ animationDelay: `${i * 150}ms` }}
              />
            ))}
          </span>
        )}
      </div>
      <p className="text-[14px] text-white/70 leading-relaxed min-h-[20px]">
        {text}
        {!loading && text && (
          <span className="inline-block w-0.5 h-3.5 bg-white/40 ml-0.5 align-middle animate-pulse" />
        )}
      </p>
    </div>
  )
}
