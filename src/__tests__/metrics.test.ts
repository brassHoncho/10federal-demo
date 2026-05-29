import { describe, it, expect } from 'vitest'
import type { Facility, Fund, ConstructionProject } from '../lib/schemas'
import {
  networkOccupancy,
  networkRevenue,
  totalUnits,
  topNByOccupancy,
  bottomNByOccupancy,
  byBrand,
  byState,
  fundDeployedDollars,
  totalAUM,
  totalMezzOutstanding,
  constructionCapexSpent,
  constructionByStage,
} from '../lib/metrics'

const FAC = (overrides: Partial<Facility>): Facility => ({
  id: 'f1', name: 'Test', city: 'X', state: 'NC',
  brand: '10 Federal Storage',
  units: 100, occupancyPct: 80, monthlyRevenue: 10000,
  leadToRentalPct: 30, climateControlPct: 20, status: 'operating',
  ...overrides,
})

const FUND = (overrides: Partial<Fund>): Fund => ({
  id: 'fund1', name: 'Test Fund', vintage: '2020',
  raised: 10000000, deployedPct: 100, irr: 15, noi: 1000000,
  distributionsPaid: 0, mezzOutstanding: 0, status: 'closed', notes: '',
  ...overrides,
})

const PROJECT = (overrides: Partial<ConstructionProject>): ConstructionProject => ({
  id: 'p1', name: 'Test', city: 'X', state: 'NC',
  fundId: 'fund1', stage: 'construction',
  units: 500, capexBudget: 20000000, capexSpent: 10000000,
  occupancyPct: 0, expectedCO: '2026-01-01', notes: '',
  ...overrides,
})

describe('networkOccupancy', () => {
  it('weights by unit count', () => {
    const facs = [
      FAC({ units: 100, occupancyPct: 100 }),
      FAC({ units: 300, occupancyPct: 60 }),
    ]
    // (100 * 1.0 + 300 * 0.6) / 400 = (100 + 180) / 400 = 70%
    expect(networkOccupancy(facs)).toBe(70)
  })
  it('returns 0 for empty input', () => {
    expect(networkOccupancy([])).toBe(0)
  })
})

describe('networkRevenue + totalUnits', () => {
  it('sums correctly', () => {
    const facs = [FAC({ monthlyRevenue: 1000, units: 50 }), FAC({ monthlyRevenue: 2000, units: 100 })]
    expect(networkRevenue(facs)).toBe(3000)
    expect(totalUnits(facs)).toBe(150)
  })
})

describe('topN / bottomN by occupancy', () => {
  const facs = [
    FAC({ id: 'a', occupancyPct: 90 }),
    FAC({ id: 'b', occupancyPct: 50 }),
    FAC({ id: 'c', occupancyPct: 75 }),
  ]
  it('topN returns sorted desc', () => {
    expect(topNByOccupancy(facs, 2).map(f => f.id)).toEqual(['a', 'c'])
  })
  it('bottomN returns sorted asc', () => {
    expect(bottomNByOccupancy(facs, 2).map(f => f.id)).toEqual(['b', 'c'])
  })
})

describe('byBrand + byState', () => {
  const facs = [
    FAC({ brand: '10 Federal Storage', state: 'NC', units: 100, occupancyPct: 80, monthlyRevenue: 1000 }),
    FAC({ brand: '10 Federal Storage', state: 'NC', units: 200, occupancyPct: 60, monthlyRevenue: 2000 }),
    FAC({ brand: 'Storage Depot', state: 'TX', units: 150, occupancyPct: 90, monthlyRevenue: 1500 }),
  ]
  it('groups by brand', () => {
    const grouped = byBrand(facs)
    expect(grouped.find(g => g.brand === '10 Federal Storage')?.count).toBe(2)
    expect(grouped.find(g => g.brand === 'Storage Depot')?.count).toBe(1)
  })
  it('groups by state', () => {
    const grouped = byState(facs)
    expect(grouped.find(g => g.state === 'NC')?.units).toBe(300)
    expect(grouped.find(g => g.state === 'TX')?.units).toBe(150)
  })
})

describe('fund metrics', () => {
  it('fundDeployedDollars = raised * deployedPct/100', () => {
    expect(fundDeployedDollars(FUND({ raised: 10000000, deployedPct: 50 }))).toBe(5000000)
  })
  it('totalAUM sums raised', () => {
    expect(totalAUM([FUND({ raised: 1000 }), FUND({ raised: 2000 })])).toBe(3000)
  })
  it('totalMezzOutstanding sums mezz', () => {
    expect(totalMezzOutstanding([FUND({ mezzOutstanding: 500 }), FUND({ mezzOutstanding: 1500 })])).toBe(2000)
  })
})

describe('construction metrics', () => {
  it('constructionCapexSpent sums', () => {
    expect(constructionCapexSpent([PROJECT({ capexSpent: 100 }), PROJECT({ capexSpent: 200 })])).toBe(300)
  })
  it('constructionByStage groups all stages, even empty ones', () => {
    const projects = [PROJECT({ stage: 'construction' }), PROJECT({ stage: 'permitting' })]
    const grouped = constructionByStage(projects)
    expect(grouped.length).toBe(7) // all 7 stages
    expect(grouped.find(g => g.stage === 'construction')?.projects.length).toBe(1)
    expect(grouped.find(g => g.stage === 'site-selection')?.projects.length).toBe(0)
  })
})
