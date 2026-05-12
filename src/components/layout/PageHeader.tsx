interface PageHeaderProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
  back?: React.ReactNode
}

export default function PageHeader({ title, subtitle, action, back }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-8 animate-fadeIn">
      <div>
        {back && <div className="mb-2">{back}</div>}
        <h1 className="font-heading text-3xl text-brand-navy">{title}</h1>
        {subtitle && <p className="text-slate-400 text-sm mt-1">{subtitle}</p>}
      </div>
      {action && <div className="flex items-center gap-3 mt-1">{action}</div>}
    </div>
  )
}
