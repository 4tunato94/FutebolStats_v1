import { Home, Users, Zap, History, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface IOSTabBarProps {
  activeTab: string
  onTabChange: (tab: string) => void
  className?: string
}

const tabs = [
  { id: 'setup', label: 'Início', icon: Home },
  { id: 'teams', label: 'Times', icon: Users },
  { id: 'actions', label: 'Ações', icon: Zap },
  { id: 'history', label: 'Histórico', icon: History },
]

export function IOSTabBar({ activeTab, onTabChange, className }: IOSTabBarProps) {
  return (
    <div className={cn(
      "bg-background/95 backdrop-blur-md border-t border-border/50 px-3 py-3 pb-safe",
      className
    )}>
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          
          return (
            <Button
              key={tab.id}
              variant="ghost"
              size="lg"
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex flex-col items-center space-y-1 h-auto py-4 px-6 rounded-xl transition-all touch-target no-select min-h-[60px]",
                isActive 
                  ? "text-primary bg-primary/15 shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn(
                "h-6 w-6 transition-all",
                isActive && "scale-110 text-primary"
              )} />
              <span className="text-sm font-medium ios-text-fixed">{tab.label}</span>
            </Button>
          )
        })}
      </div>
    </div>
  )
}