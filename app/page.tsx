import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6 text-center">
      <div className="text-5xl mb-4">📡</div>
      <h1 className="text-3xl font-bold mb-2">TapNet</h1>
      <p className="text-white/50 mb-8 max-w-xs">tap the world around you</p>

      {/* Dev links to test each location */}
      <div className="space-y-2 w-full max-w-xs">
        {[
          { loc: 'bart_powell_st',    label: 'Powell St. Station' },
          { loc: 'bart_16th_mission', label: '16th St. Mission' },
          { loc: 'ferry_building',    label: 'Ferry Building' },
          { loc: 'hayes_valley_coffee', label: 'Hayes Valley' },
          { loc: 'dolores_park',      label: 'Dolores Park' },
        ].map(({ loc, label }) => (
          <Link
            key={loc}
            href={`/tap?loc=${loc}`}
            className="block w-full py-3 px-4 rounded-2xl text-sm font-medium text-white/80 hover:text-white transition-colors"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            {label}
          </Link>
        ))}
      </div>

      <p className="text-white/20 text-xs mt-8">dev mode · no signature required</p>
    </main>
  )
}
