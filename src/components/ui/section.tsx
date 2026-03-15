import { cn } from "@/lib/utils"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

interface SectionProps {
  children: React.ReactNode
  className?: string
}

export function Section({ children, className }: SectionProps) {
  return (
    <section className={cn("py-12 md:py-16", className)}>
      {children}
    </section>
  )
}

interface SectionHeaderProps {
  title: string
  description?: string
  action?: {
    label: string
    href: string
  }
  className?: string
}

export function SectionHeader({ title, description, action, className }: SectionHeaderProps) {
  return (
    <div className={cn("mb-8 flex items-end justify-between", className)}>
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      {action && (
        <Link
          href={action.href}
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          {action.label}
          <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  )
}

interface SectionTitleProps {
  children: React.ReactNode
  className?: string
}

export function SectionTitle({ children, className }: SectionTitleProps) {
  return (
    <h2 className={cn("text-xs tracking-[0.2em] uppercase text-muted-foreground font-medium mb-6", className)}>
      {children}
    </h2>
  )
}
