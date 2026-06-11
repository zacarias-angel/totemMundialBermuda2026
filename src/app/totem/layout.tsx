import { TotemLayout } from '@/components/totem/TotemLayout'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="totem-stage">
      <div className="totem-frame">
        <TotemLayout>{children}</TotemLayout>
      </div>
    </div>
  )
}
