import { z } from 'zod'

export const BRANDS = [
  '10 Federal Storage',
  'Storage Depot',
  'Big Guy Storage',
  'Carolina Secure Storage',
  'Self Storage Max',
] as const

export const FacilitySchema = z.object({
  id: z.string(),
  name: z.string(),
  city: z.string(),
  state: z.string().length(2),
  brand: z.enum(BRANDS),
  units: z.number().int().positive(),
  occupancyPct: z.number().min(0).max(100),
  monthlyRevenue: z.number().nonnegative(),
  leadToRentalPct: z.number().min(0).max(100),
  climateControlPct: z.number().min(0).max(100),
  status: z.enum(['operating', 'lease-up', 'recent-acquisition']),
})
export type Facility = z.infer<typeof FacilitySchema>

export const FundSchema = z.object({
  id: z.string(),
  name: z.string(),
  vintage: z.string(),
  raised: z.number().nonnegative(),
  deployedPct: z.number().min(0).max(100),
  irr: z.number(),
  noi: z.number().nonnegative(),
  distributionsPaid: z.number().nonnegative(),
  mezzOutstanding: z.number().nonnegative(),
  status: z.enum(['active', 'closed', 'fundraising']),
  notes: z.string(),
})
export type Fund = z.infer<typeof FundSchema>

export const ConstructionStageSchema = z.enum([
  'site-selection',
  'entitlement',
  'permitting',
  'construction',
  'punch-list',
  'certificate-of-occupancy',
  'lease-up',
])

export const ConstructionProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  city: z.string(),
  state: z.string().length(2),
  fundId: z.string(),
  stage: ConstructionStageSchema,
  units: z.number().int().positive(),
  capexBudget: z.number().nonnegative(),
  capexSpent: z.number().nonnegative(),
  occupancyPct: z.number().min(0).max(100),
  expectedCO: z.string(),
  actualCO: z.string().optional(),
  notes: z.string(),
})
export type ConstructionProject = z.infer<typeof ConstructionProjectSchema>

export const ExecutiveSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: z.string(),
  ownsTabs: z.array(z.string()),
  bio: z.string(),
})
export type Executive = z.infer<typeof ExecutiveSchema>

export const ConnectedSystemSchema = z.object({
  name: z.string(),
  category: z.string(),
  lastSyncMinutesAgo: z.number().nonnegative(),
  status: z.enum(['ok', 'warn', 'error']),
  metric: z.string().optional(),
})
export type ConnectedSystem = z.infer<typeof ConnectedSystemSchema>

export const ConnectedSystemsByTabSchema = z.record(
  z.string(),
  z.array(ConnectedSystemSchema),
)
export type ConnectedSystemsByTab = z.infer<typeof ConnectedSystemsByTabSchema>

export const BacklogItemSchema = z.object({
  id: z.string(),
  number: z.number().int().positive(),
  title: z.string(),
  description: z.string(),
  estimate: z.string(),
  businessOutcome: z.string(),
  evidence: z.string(),
})
export type BacklogItem = z.infer<typeof BacklogItemSchema>

export const RoadmapStepSchema = z.object({
  day: z.string(),
  description: z.string(),
})

export const RoadmapPillarSchema = z.object({
  phase: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  pillarNumber: z.number().int().positive(),
  title: z.string(),
  summary: z.string(),
  steps: z.array(RoadmapStepSchema),
})
export type RoadmapPillar = z.infer<typeof RoadmapPillarSchema>

export const AlertSchema = z.object({
  id: z.string(),
  severity: z.enum(['info', 'warn', 'critical']),
  message: z.string(),
  timestampMinutesAgo: z.number().nonnegative(),
  tab: z.string(),
  askPrompt: z.string(),
})
export type Alert = z.infer<typeof AlertSchema>

export const LeadSchema = z.object({
  id: z.string(),
  inquiry: z.string(),
  channel: z.enum(['Paid Ads', 'Organic', 'Referrals', 'Walk-In']),
  facilityId: z.string(),
  minutesAgo: z.number().nonnegative(),
  propensity: z.enum(['high', 'medium', 'low']),
  routing: z.string(),
})
export type Lead = z.infer<typeof LeadSchema>

export const LeadTemplateSchema = z.object({
  id: z.string(),
  inquiry: z.string(),
  category: z.string(),
  routedToFlagshipPct: z.number().min(0).max(100),
  lastSeenMinutesAgo: z.number().nonnegative(),
})
export type LeadTemplate = z.infer<typeof LeadTemplateSchema>
