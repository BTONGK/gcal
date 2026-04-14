// Run with: npx tsx scripts/gen-meet-sticker.ts
import { generateStickerUrl } from '../lib/signing'

const url = generateStickerUrl('meet')
console.log('\nNFC sticker URL:')
console.log(url)
console.log('\nWrite this URL to your NFC tag.\n')
