import { google } from 'googleapis'
import { NextResponse } from 'next/server'

function getOAuthClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  )
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')

  const error = searchParams.get('error')
  if (!code) {
    return new Response(
      `<html><body style="font-family:monospace;padding:2rem">
        <h2>❌ Google returned an error:</h2>
        <pre style="background:#fee;padding:1rem;border-radius:6px">${error ?? 'no code and no error — unexpected'}</pre>
        <p>All params: <code>${[...searchParams.entries()].map(([k,v]) => `${k}=${v}`).join(', ')}</code></p>
      </body></html>`,
      { status: 400, headers: { 'Content-Type': 'text/html' } }
    )
  }

  const oauth2Client = getOAuthClient()
  const { tokens } = await oauth2Client.getToken(code)

  return new Response(
    `<html><body style="font-family:monospace;padding:2rem">
      <h2>✅ Auth success — copy your refresh token:</h2>
      <pre style="background:#f4f4f4;padding:1rem;border-radius:6px;word-break:break-all">${tokens.refresh_token}</pre>
      <p>Add this to your <code>.env.local</code>:</p>
      <pre style="background:#f4f4f4;padding:1rem;border-radius:6px">GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}</pre>
      <p style="color:#888">You can now close this tab.</p>
    </body></html>`,
    { headers: { 'Content-Type': 'text/html' } }
  )
}
