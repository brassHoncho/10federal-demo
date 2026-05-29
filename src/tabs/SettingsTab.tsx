import SectionHeader from '../components/shared/SectionHeader'

export default function SettingsTab() {
  return (
    <div className="flex flex-col gap-6">
      <SectionHeader title="Settings" subtitle="Lightweight placeholder — same pattern as the Aesthetic Enterprises demo." />

      <div className="rounded-xl border border-10f-border bg-white p-6 text-sm text-10f-text-muted">
        <p>
          In a real deployment this would house: integration credentials (SiteLink, Juniper Square, QuickBooks
          Online), user role assignments, alert thresholds, brand-portfolio routing rules, and the
          per-facility configuration overrides.
        </p>
        <p className="mt-3">
          The pattern works the same way it does on the{' '}
          <a href="https://aesthetic.sterlingmull.com" className="text-10f-red hover:underline" target="_blank" rel="noreferrer">
            Aesthetic Enterprises demo
          </a>{' '}
          — Settings is a placeholder until the real role-based access conversation lands.
        </p>
      </div>
    </div>
  )
}
