import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { seededRandom } from './seededRandom.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))

const REAL_BY_STATE = {
  AR: ['Benton', 'Bryant', 'Jacksonville', 'Little Rock', 'North Little Rock'],
  CO: ['Grand Junction', 'Palisade'],
  FL: ['Cape Coral', 'Fort Myers'],
  GA: ['Carrollton', 'Dahlonega', 'Dallas', 'Douglasville', 'Jenkinsburg', 'Locust Grove', 'Macon', 'McDonough', 'Newnan', 'Richmond Hill', 'Ringgold', 'Temple', 'Valdosta', 'Villa Rica', 'Waco'],
  IL: ['Aurora', 'Naperville', 'Peoria', 'Springfield'],
  IA: ['Des Moines', 'West Des Moines'],
  MI: ['Washington'],
  MO: ['Columbia', 'Jefferson City'],
  NH: ['Concord', 'Pembroke'],
  NC: ['Asheboro', 'Burlington', 'Cary', 'Clayton', 'Creedmoor', 'Durham', 'Forest City', 'Garner', 'Gibsonville', 'Goldsboro', 'Graham', 'Greenville', 'Haw River', 'Henderson', 'High Point', 'Kannapolis', 'Kings Mountain', 'Landis', 'Leland', 'Mebane', 'Monroe', 'Raleigh', 'Rocky Mount', 'Roxboro', 'Thomasville', 'Trinity', 'Wendell', 'Wilmington', 'Winston Salem', 'Winterville'],
  SC: ['Boiling Springs', 'Chester', 'Columbia', 'Little River', 'North Myrtle Beach', 'Spartanburg', 'West Columbia'],
  TN: ['Gray', 'Greeneville', 'Johnson City', 'Kingsport', 'Nolensville'],
  TX: ['Abilene', 'Arlington', 'Buffalo Gap', 'Burleson', 'Converse', 'Dallas', 'Dripping Springs', 'El Paso', 'Fort Worth', 'Georgetown', 'Grand Prairie', 'Greenville', 'Houston', 'Irving', 'Keller', 'Killeen', 'League City', 'Magnolia', 'McKinney', 'Montgomery', 'Nolanville', 'North Richland Hills', 'Princeton', 'Round Rock', 'Royse City', 'San Antonio', 'Santa Fe', 'Seguin', 'Spring Branch', 'Texas City', 'Tuscola', 'Waxahachie'],
  VA: ['Richmond'],
  WA: ['Burien', 'Seattle'],
  WI: ['Pewaukee', 'Waukesha'],
}

const SUB_BRANDS = ['Storage Depot', 'Big Guy Storage', 'Carolina Secure Storage']
const FLAGSHIP = '10 Federal Storage'

function pickBrand(state, rand) {
  // Michigan facility is Self Storage Max per the real website
  if (state === 'MI') return 'Self Storage Max'
  // Carolinas have a slight Carolina Secure Storage lean
  if ((state === 'NC' || state === 'SC') && rand() < 0.12) return 'Carolina Secure Storage'
  // Other sub-brands appear in ~6% of remaining facilities
  if (rand() < 0.06) return SUB_BRANDS[Math.floor(rand() * SUB_BRANDS.length)]
  return FLAGSHIP
}

function brandPrefix(brand) {
  switch (brand) {
    case 'Self Storage Max': return 'Self Storage Max'
    case 'Storage Depot': return 'Storage Depot'
    case 'Big Guy Storage': return 'Big Guy Storage'
    case 'Carolina Secure Storage': return 'Carolina Secure Storage'
    default: return '10 Federal Storage'
  }
}

const facilities = []
const rand = seededRandom(20260529)
let id = 0

for (const [state, cities] of Object.entries(REAL_BY_STATE)) {
  for (const city of cities) {
    const brand = pickBrand(state, rand)
    const units = 200 + Math.floor(rand() * 500)
    const occupancy = 70 + rand() * 25
    const pricePerUnit = 40 + rand() * 80
    const monthlyRevenue = units * pricePerUnit * (occupancy / 100)
    facilities.push({
      id: `fac-${++id}`,
      name: `${brandPrefix(brand)} - ${city}`,
      city,
      state,
      brand,
      units,
      occupancyPct: Math.round(occupancy * 10) / 10,
      monthlyRevenue: Math.round(monthlyRevenue),
      leadToRentalPct: Math.round((25 + rand() * 35) * 10) / 10,
      climateControlPct: Math.round(rand() * 80),
      status: 'operating',
    })
  }
}

// 16 mocked recent acquisitions to reach 130 total (114 real + 16 mocked)
const MOCKED_RECENT = [
  ['Atlanta', 'GA'], ['Athens', 'GA'], ['Savannah', 'GA'],
  ['Plano', 'TX'], ['Lubbock', 'TX'], ['Tyler', 'TX'],
  ['Asheville', 'NC'], ['Charlotte', 'NC'], ['Fayetteville', 'NC'],
  ['Lexington', 'KY'], ['Louisville', 'KY'],
  ['Birmingham', 'AL'], ['Mobile', 'AL'],
  ['Tampa', 'FL'], ['Jacksonville', 'FL'],
  ['Memphis', 'TN'],
]

for (const [city, state] of MOCKED_RECENT) {
  const units = 250 + Math.floor(rand() * 400)
  const occupancy = 60 + rand() * 20 // still in lease-up
  const pricePerUnit = 45 + rand() * 60
  const monthlyRevenue = units * pricePerUnit * (occupancy / 100)
  facilities.push({
    id: `fac-${++id}`,
    name: `10 Federal Storage - ${city}`,
    city,
    state,
    brand: FLAGSHIP,
    units,
    occupancyPct: Math.round(occupancy * 10) / 10,
    monthlyRevenue: Math.round(monthlyRevenue),
    leadToRentalPct: Math.round((20 + rand() * 25) * 10) / 10,
    climateControlPct: Math.round(rand() * 50),
    status: 'recent-acquisition',
  })
}

const outPath = join(__dirname, '..', 'src', 'data', 'facilities.json')
writeFileSync(outPath, JSON.stringify(facilities, null, 2))
console.log(`Wrote ${facilities.length} facilities to ${outPath}`)
