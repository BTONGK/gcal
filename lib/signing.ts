import { createHmac } from 'crypto'

export function signLocation(loc: string): string {
  return createHmac('sha256', process.env.TAPNET_SIGNING_SECRET!)
    .update(loc)
    .digest('hex')
    .slice(0, 16)
}

export function verifyLocation(loc: string, sig: string): boolean {
  return signLocation(loc) === sig
}

export function generateStickerUrl(loc: string, baseUrl = 'https://tapnet.app'): string {
  const sig = signLocation(loc)
  return `${baseUrl}/tap?loc=${loc}&sig=${sig}`
}
