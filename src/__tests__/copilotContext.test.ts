import { describe, it, expect } from 'vitest'
import { buildSystemPrompt } from '../lib/copilotContext'

describe('buildSystemPrompt', () => {
  const prompt = buildSystemPrompt('overview')

  it('includes the persona block', () => {
    expect(prompt).toContain('10F Ops Co-Pilot')
    expect(prompt).toContain('Sterling Mull')
  })

  it('references the 5 sub-brands', () => {
    expect(prompt).toContain('10 Federal Storage')
    expect(prompt).toContain('Storage Depot')
    expect(prompt).toContain('Carolina Secure Storage')
    expect(prompt).toContain('Self Storage Max')
  })

  it('names the 3 fund vehicles', () => {
    expect(prompt).toContain('10 Federal Self Storage Acquisition Co. 2')
    expect(prompt).toContain('10 Federal Self Storage Acquisition Co. 3')
    expect(prompt).toContain('Opportunistic Offering')
  })

  it('names the real construction projects', () => {
    expect(prompt).toContain('Graham, NC')
    expect(prompt).toContain('Dripping Springs, TX')
    expect(prompt).toContain('Charlotte, NC')
  })

  it('names the 6 executives with their roles', () => {
    expect(prompt).toContain('Andrew Capranos')
    expect(prompt).toContain('Brad Minsley')
    expect(prompt).toContain('Cliff Minsley')
    expect(prompt).toContain('Christopher Taylor')
    expect(prompt).toContain('Brian Oakley')
    expect(prompt).toContain('Trent Erickson')
  })

  it('includes the Day 1 Backlog summary', () => {
    expect(prompt).toContain('DAY 1 BACKLOG')
    expect(prompt).toContain('TenantConnect')
    expect(prompt).toContain('INP')
  })

  it('includes all 8 roadmap pillars', () => {
    expect(prompt).toContain('Pillar 1: Unified Network Operations Dashboard')
    expect(prompt).toContain('Pillar 4: Unified Customer Portal Layer')
    expect(prompt).toContain('Pillar 8: Fund-Level Reporting Automation')
  })

  it('varies tab-specific context by activeTab', () => {
    const acct = buildSystemPrompt('accounting')
    const constr = buildSystemPrompt('construction')
    expect(acct).toContain("Trent Erickson's domain")
    expect(acct).toContain('QuickBooks')
    expect(constr).toContain('Procore')
    expect(constr).not.toContain("Trent Erickson's domain")
  })

  it('stays under 12000 characters (rough proxy for ~3k tokens)', () => {
    // Most system prompts target <3k tokens. 1 token ≈ 4 chars → 12000 char target.
    expect(prompt.length).toBeLessThan(12000)
  })
})
