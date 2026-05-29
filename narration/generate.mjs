#!/usr/bin/env node
/**
 * Generate the audio walkthrough using ElevenLabs.
 *
 * Usage:
 *   ELEVENLABS_API_KEY=sk_... node narration/generate.mjs
 *
 * Or with a custom voice:
 *   ELEVENLABS_API_KEY=sk_... ELEVENLABS_VOICE_ID=ZF6FPAbjXT4488VcRRnw node narration/generate.mjs
 *
 * Output: public/walkthrough.mp3
 *
 * Default voice (Adam, calm operator-style narration):
 *   pNInz6obpgDQGcFmaJgB
 *
 * Other voices worth trying:
 *   ZF6FPAbjXT4488VcRRnw — Amelia (warm, professional)
 *   AZnzlk1XvdvUeBnXmlld — Domi (confident analyst)
 *   EXAVITQu4vr4xnSDxMaL — Sarah (clear, articulate)
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const API_KEY = process.env.ELEVENLABS_API_KEY
if (!API_KEY) {
  console.error('ERROR: ELEVENLABS_API_KEY is required.')
  console.error('Get one at https://elevenlabs.io/app/settings/api-keys')
  process.exit(1)
}

const VOICE_ID = process.env.ELEVENLABS_VOICE_ID ?? 'pNInz6obpgDQGcFmaJgB'
const MODEL_ID = process.env.ELEVENLABS_MODEL_ID ?? 'eleven_turbo_v2_5'

const SCRIPT_PATH = join(__dirname, 'walkthrough.txt')
const OUTPUT_PATH = join(__dirname, '..', 'public', 'walkthrough.mp3')

const text = readFileSync(SCRIPT_PATH, 'utf8').trim()
console.log(`Generating ${text.length} characters of speech...`)
console.log(`Voice: ${VOICE_ID}`)
console.log(`Model: ${MODEL_ID}`)

const url = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`

const response = await fetch(url, {
  method: 'POST',
  headers: {
    'xi-api-key': API_KEY,
    'Content-Type': 'application/json',
    Accept: 'audio/mpeg',
  },
  body: JSON.stringify({
    text,
    model_id: MODEL_ID,
    voice_settings: {
      stability: 0.45,
      similarity_boost: 0.75,
      style: 0.15,
      use_speaker_boost: true,
    },
  }),
})

if (!response.ok) {
  const errBody = await response.text()
  console.error(`ElevenLabs error ${response.status}: ${errBody}`)
  process.exit(1)
}

const buffer = Buffer.from(await response.arrayBuffer())

if (!existsSync(dirname(OUTPUT_PATH))) {
  mkdirSync(dirname(OUTPUT_PATH), { recursive: true })
}

writeFileSync(OUTPUT_PATH, buffer)

const sizeKb = (buffer.length / 1024).toFixed(1)
console.log(`✓ Wrote ${OUTPUT_PATH} (${sizeKb} KB)`)
console.log(`  Deploy with: vercel --prod --yes`)
