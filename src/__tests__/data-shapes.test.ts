import { describe, it, expect } from 'vitest'
import facilities from '../data/facilities.json'
import funds from '../data/funds.json'
import construction from '../data/construction.json'
import executives from '../data/executives.json'
import connectedSystems from '../data/connectedSystems.json'
import backlog from '../data/backlog.json'
import roadmap from '../data/roadmap.json'
import alerts from '../data/alerts.json'
import leads from '../data/leads.json'
import leadTemplates from '../data/leadTemplates.json'

import {
  FacilitySchema,
  FundSchema,
  ConstructionProjectSchema,
  ExecutiveSchema,
  ConnectedSystemsByTabSchema,
  BacklogItemSchema,
  RoadmapPillarSchema,
  AlertSchema,
  LeadSchema,
  LeadTemplateSchema,
} from '../lib/schemas'

function validateAll<T>(rows: unknown[], schema: { safeParse: (x: unknown) => { success: boolean; error?: { issues: unknown[] } } }, name: string) {
  rows.forEach((row, i) => {
    const result = schema.safeParse(row)
    if (!result.success) {
      throw new Error(`${name}[${i}] failed: ${JSON.stringify(result.error?.issues)}`)
    }
  })
}

describe('data shape contracts', () => {
  it('facilities.json matches FacilitySchema', () => {
    expect(Array.isArray(facilities)).toBe(true)
    expect(facilities.length).toBeGreaterThanOrEqual(100)
    validateAll(facilities, FacilitySchema, 'facility')
  })

  it('funds.json matches FundSchema', () => {
    expect(funds.length).toBe(3)
    validateAll(funds, FundSchema, 'fund')
  })

  it('construction.json matches ConstructionProjectSchema', () => {
    expect(construction.length).toBeGreaterThanOrEqual(7)
    validateAll(construction, ConstructionProjectSchema, 'construction')
  })

  it('executives.json matches ExecutiveSchema', () => {
    expect(executives.length).toBe(6)
    validateAll(executives, ExecutiveSchema, 'executive')
  })

  it('connectedSystems.json matches ConnectedSystemsByTabSchema', () => {
    const result = ConnectedSystemsByTabSchema.safeParse(connectedSystems)
    if (!result.success) throw new Error(JSON.stringify(result.error.issues))
  })

  it('backlog.json matches BacklogItemSchema', () => {
    expect(backlog.length).toBe(6)
    validateAll(backlog, BacklogItemSchema, 'backlog')
  })

  it('roadmap.json matches RoadmapPillarSchema', () => {
    expect(roadmap.length).toBe(8)
    validateAll(roadmap, RoadmapPillarSchema, 'roadmap')
  })

  it('alerts.json matches AlertSchema', () => {
    expect(alerts.length).toBeGreaterThanOrEqual(6)
    validateAll(alerts, AlertSchema, 'alert')
  })

  it('leads.json matches LeadSchema', () => {
    expect(leads.length).toBeGreaterThanOrEqual(8)
    validateAll(leads, LeadSchema, 'lead')
  })

  it('leadTemplates.json matches LeadTemplateSchema', () => {
    expect(leadTemplates.length).toBeGreaterThanOrEqual(8)
    validateAll(leadTemplates, LeadTemplateSchema, 'leadTemplate')
  })
})
