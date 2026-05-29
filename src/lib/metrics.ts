import type { Facility, Fund, ConstructionProject } from './schemas.js'

/**
 * Network-weighted occupancy across all facilities — weighted by unit count.
 */
export function networkOccupancy(facilities: Facility[]): number {
  if (facilities.length === 0) return 0
  let totalUnits = 0
  let occupiedUnits = 0
  for (const f of facilities) {
    totalUnits += f.units
    occupiedUnits += f.units * (f.occupancyPct / 100)
  }
  return totalUnits === 0 ? 0 : (occupiedUnits / totalUnits) * 100
}

/**
 * Sum of monthly revenue across all facilities.
 */
export function networkRevenue(facilities: Facility[]): number {
  return facilities.reduce((sum, f) => sum + f.monthlyRevenue, 0)
}

/**
 * Total units across the network.
 */
export function totalUnits(facilities: Facility[]): number {
  return facilities.reduce((sum, f) => sum + f.units, 0)
}

/**
 * Top N facilities by occupancy percentage (descending).
 */
export function topNByOccupancy(facilities: Facility[], n: number): Facility[] {
  return [...facilities].sort((a, b) => b.occupancyPct - a.occupancyPct).slice(0, n)
}

/**
 * Bottom N facilities by occupancy percentage (ascending).
 */
export function bottomNByOccupancy(facilities: Facility[], n: number): Facility[] {
  return [...facilities].sort((a, b) => a.occupancyPct - b.occupancyPct).slice(0, n)
}

/**
 * Group + aggregate by brand. Returns brand → { count, units, revenue, occupancy }.
 */
export function byBrand(facilities: Facility[]) {
  const map = new Map<string, { count: number; units: number; revenue: number; occupiedUnits: number }>()
  for (const f of facilities) {
    const existing = map.get(f.brand) ?? { count: 0, units: 0, revenue: 0, occupiedUnits: 0 }
    existing.count += 1
    existing.units += f.units
    existing.revenue += f.monthlyRevenue
    existing.occupiedUnits += f.units * (f.occupancyPct / 100)
    map.set(f.brand, existing)
  }
  return Array.from(map.entries()).map(([brand, v]) => ({
    brand,
    count: v.count,
    units: v.units,
    revenue: v.revenue,
    occupancyPct: v.units === 0 ? 0 : (v.occupiedUnits / v.units) * 100,
  }))
}

/**
 * Group + aggregate by state. Returns state → { count, units, revenue }.
 */
export function byState(facilities: Facility[]) {
  const map = new Map<string, { count: number; units: number; revenue: number; occupiedUnits: number }>()
  for (const f of facilities) {
    const existing = map.get(f.state) ?? { count: 0, units: 0, revenue: 0, occupiedUnits: 0 }
    existing.count += 1
    existing.units += f.units
    existing.revenue += f.monthlyRevenue
    existing.occupiedUnits += f.units * (f.occupancyPct / 100)
    map.set(f.state, existing)
  }
  return Array.from(map.entries()).map(([state, v]) => ({
    state,
    count: v.count,
    units: v.units,
    revenue: v.revenue,
    occupancyPct: v.units === 0 ? 0 : (v.occupiedUnits / v.units) * 100,
  }))
}

/**
 * Dollars deployed (raised × deployedPct/100).
 */
export function fundDeployedDollars(fund: Fund): number {
  return fund.raised * (fund.deployedPct / 100)
}

/**
 * Total AUM across all funds.
 */
export function totalAUM(funds: Fund[]): number {
  return funds.reduce((sum, f) => sum + f.raised, 0)
}

/**
 * Total mezzanine equity outstanding across all funds.
 */
export function totalMezzOutstanding(funds: Fund[]): number {
  return funds.reduce((sum, f) => sum + f.mezzOutstanding, 0)
}

/**
 * Total capex spent across construction projects.
 */
export function constructionCapexSpent(projects: ConstructionProject[]): number {
  return projects.reduce((sum, p) => sum + p.capexSpent, 0)
}

/**
 * Total capex committed (budget) across construction projects.
 */
export function constructionCapexCommitted(projects: ConstructionProject[]): number {
  return projects.reduce((sum, p) => sum + p.capexBudget, 0)
}

/**
 * Group construction projects by stage (for kanban).
 */
export function constructionByStage(projects: ConstructionProject[]) {
  const stages = ['site-selection','entitlement','permitting','construction','punch-list','certificate-of-occupancy','lease-up'] as const
  return stages.map(stage => ({
    stage,
    projects: projects.filter(p => p.stage === stage),
  }))
}

/**
 * Average cost per square foot, assuming ~75 sqft per unit (industry average).
 */
export function avgCostPerSqFt(projects: ConstructionProject[]): number {
  const totalBudget = constructionCapexCommitted(projects)
  const totalUnits = projects.reduce((sum, p) => sum + p.units, 0)
  if (totalUnits === 0) return 0
  const totalSqFt = totalUnits * 75
  return totalBudget / totalSqFt
}
