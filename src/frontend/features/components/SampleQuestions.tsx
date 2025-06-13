import { memo } from "react"
import { Button } from "@/components/ui/button"

interface SampleQuestionsProps {
  questions: string[]
  onQuestionSelect: (question: string) => void
}

const SampleQuestions = memo(function SampleQuestions({ 
  questions, 
  onQuestionSelect 
}: SampleQuestionsProps) {
  return (
    <div className="space-y-3 w-full max-w-2xl">
      {questions.map((question, index) => (
        <Button
          key={index}
          variant="ghost"
          className="w-full text-left justify-start text-muted-foreground hover:text-accent-foreground p-3 h-auto"
          onClick={() => onQuestionSelect(question)}
        >
          {question}
        </Button>
      ))}
    </div>
  )
})

export default SampleQuestions
