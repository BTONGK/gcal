import { LOCATIONS } from '@/lib/locations'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: { loc?: string; sig?: string }
}

export default async function TapPage({ searchParams }: PageProps) {
  const loc = searchParams.loc
  const locationKeys = Object.keys(LOCATIONS)

  return (
    <div style={{ padding: 40, fontFamily: 'monospace', background: '#000', color: '#fff', minHeight: '100vh' }}>
      <p>loc param: {loc ?? 'undefined'}</p>
      <p>available keys: {locationKeys.join(', ')}</p>
      <p>match: {loc ? String(!!LOCATIONS[loc]) : 'no loc'}</p>
    </div>
  )
}
