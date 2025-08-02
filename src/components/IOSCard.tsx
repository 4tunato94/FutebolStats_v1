import { ReactNode } from 'react'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface IOSCardProps {
  children: ReactNode
  title?: string
  subtitle?: string
  icon?: ReactNode
  onPress?: () => void
  showChevron?: boolean
  className?: string
}

export function IOSCard({ 
  children, 
  title, 
  subtitle, 
  icon, 
  onPress, 
  showChevron = false,
  className 
}: IOSCardProps) {
  const isClickable = !!onPress

  return (
    <div 
      className={cn(
        "bg-card rounded-3xl border border-border/50 overflow-hidden shadow-lg",
        isClickable && "active:scale-[0.98] transition-transform cursor-pointer",
        className
      )}
      onClick={onPress}
    >
      {(title || subtitle) && (
        <div className="px-6 py-5 border-b border-border/50 flex items-center justify-between min-h-[70px]">
          <div className="flex items-center space-x-3">
            {icon && (
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                {icon}
              </div>
            )}
            <div className="flex-1 min-w-0">
              {title && <h3 className="font-bold text-lg ios-text-fixed">{title}</h3>}
              {subtitle && <p className="text-base text-muted-foreground ios-text-wrap">{subtitle}</p>}
            </div>
          </div>
          {showChevron && (
            <ChevronRight className="h-6 w-6 text-muted-foreground flex-shrink-0" />
          )}
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  )
}