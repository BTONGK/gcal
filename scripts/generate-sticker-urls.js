#!/usr/bin/env node
// Generate signed NFC sticker URLs for all locations
// Usage: TAPNET_SIGNING_SECRET=xxx BASE_URL=https://tapnet-xyz.vercel.app node scripts/generate-sticker-urls.js

const { createHmac } = require('crypto')

const secret = process.env.TAPNET_SIGNING_SECRET
const baseUrl = process.env.BASE_URL || 'http://localhost:3000'

if (!secret) {
  console.error('Error: TAPNET_SIGNING_SECRET env var is required')
  console.error('Usage: TAPNET_SIGNING_SECRET=xxx BASE_URL=https://your-app.vercel.app node scripts/generate-sticker-urls.js')
  process.exit(1)
}

const locations = [
  'bart_powell_st',
  'bart_16th_mission',
  'ferry_building',
  'hayes_valley_coffee',
  'dolores_park',
]

console.log('\n🏷️  TapNet NFC Sticker URLs\n')
console.log(`Base URL: ${baseUrl}`)
console.log('─'.repeat(60))

locations.forEach(loc => {
  const sig = createHmac('sha256', secret)
    .update(loc)
    .digest('hex')
    .slice(0, 16)
  const url = `${baseUrl}/tap?loc=${loc}&sig=${sig}`
  console.log(`\n📍 ${loc}`)
  console.log(`   ${url}`)
})

console.log('\n─'.repeat(60))
console.log('\nWrite each URL to an NFC sticker using the NFC Tools app (iOS/Android).')
console.log('  1. Open NFC Tools → Write → Add Record → URL')
console.log('  2. Paste URL → Write → hold sticker to back of phone\n')
