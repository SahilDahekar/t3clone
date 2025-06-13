import { Button } from "@/components/ui/button"
import { Sparkles, BookOpen, Code, GraduationCap } from "lucide-react"
import { memo } from "react"

const quickActions = [
  {
    icon: Sparkles,
    label: "Create",
    description: "Generate content",
  },
  {
    icon: BookOpen,
    label: "Explore",
    description: "Discover topics",
  },
  {
    icon: Code,
    label: "Code",
    description: "Write programs",
  },
  {
    icon: GraduationCap,
    label: "Learn",
    description: "Get explanations",
  },
]

const QuickActions = memo(function QuickActions() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 w-full max-w-2xl">
      {quickActions.map((action) => (
        <Button
          key={action.label}
          variant="outline"
          className="h-auto p-4 flex flex-col items-center gap-2"
        >
          <action.icon className="h-5 w-5" />
          <span className="text-sm font-medium">{action.label}</span>
        </Button>
      ))}
    </div>
  )
})

export default QuickActions
