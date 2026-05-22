import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'
import { Badge } from '@/components/ui/badge'

/**
 * Quiz Component - Display and submit quiz for lessons
 */
export function QuizComponent({ courseId, lessonId, lesson, onQuizComplete }) {
  const [quiz, setQuiz] = useState(null)
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchQuiz()
  }, [courseId, lessonId])

  const fetchQuiz = async () => {
    try {
      setLoading(true)
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/lessons/${courseId}/${lessonId}/quiz`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      )

      if (!response.ok) throw new Error('Failed to fetch quiz')

      const data = await response.json()
      setQuiz(data.data)
    } catch (error) {
      console.error('Fetch quiz error:', error)
      toast({
        title: 'Error',
        description: 'Failed to load quiz',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAnswerChange = (questionIndex, answerIndex) => {
    setAnswers((prev) => ({
      ...prev,
      [questionIndex]: answerIndex,
    }))
  }

  const handleSubmitQuiz = async () => {
    if (Object.keys(answers).length < quiz.totalQuestions) {
      toast({
        title: 'Incomplete',
        description: 'Please answer all questions before submitting',
        variant: 'destructive',
      })
      return
    }

    try {
      setSubmitting(true)
      const answerArray = Object.keys(answers)
        .sort((a, b) => parseInt(a) - parseInt(b))
        .map((key) => answers[key])

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/lessons/${courseId}/${lessonId}/quiz`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({ answers: answerArray, courseId, lessonId }),
        }
      )

      if (!response.ok) throw new Error('Failed to submit quiz')

      const data = await response.json()
      setResult(data.data)

      toast({
        title: data.data.passed ? 'Success!' : 'Try Again',
        description: data.data.passed
          ? `You scored ${data.data.score}% and earned ${data.data.xpAwarded} XP!`
          : `You scored ${data.data.score}%. You need 60% to pass.`,
        variant: data.data.passed ? 'default' : 'destructive',
      })

      if (data.data.passed && onQuizComplete) {
        onQuizComplete(data.data)
      }
    } catch (error) {
      console.error('Submit quiz error:', error)
      toast({
        title: 'Error',
        description: 'Failed to submit quiz',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Quiz</CardTitle>
          <CardDescription>Loading quiz...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (!quiz || quiz.questions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Quiz Available</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">This lesson does not have a quiz.</p>
        </CardContent>
      </Card>
    )
  }

  if (result) {
    return (
      <Card className="border-2">
        <CardHeader>
          <CardTitle className={result.passed ? 'text-green-600' : 'text-red-600'}>
            {result.passed ? '✓ Quiz Passed!' : '✗ Quiz Failed'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">Score: {result.score}%</p>
            <Progress value={result.score} className="h-2" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Correct Answers</p>
              <p className="text-2xl font-bold">{result.correctAnswers}/{result.totalQuestions}</p>
            </div>
            {result.xpAwarded > 0 && (
              <div>
                <p className="text-sm text-gray-600">XP Earned</p>
                <p className="text-2xl font-bold text-blue-600">+{result.xpAwarded}</p>
              </div>
            )}
          </div>

          {result.badgesEarned && result.badgesEarned.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Badges Earned:</p>
              <div className="flex flex-wrap gap-2">
                {result.badgesEarned.map((badge) => (
                  <Badge key={badge.id} className="text-base">
                    {badge.icon} {badge.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {result.leveledUp && (
            <Alert className="border-purple-200 bg-purple-50">
              <AlertDescription className="text-purple-900">
                🎉 Level Up! You reached Level {result.newLevel}
              </AlertDescription>
            </Alert>
          )}

          <Button
            onClick={() => {
              setResult(null)
              setAnswers({})
            }}
            className="w-full"
          >
            Retake Quiz
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lesson Quiz</CardTitle>
        <CardDescription>
          Answer all questions to complete this lesson. You need 60% to pass.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {quiz.questions.map((question, questionIndex) => (
          <div key={questionIndex} className="space-y-3">
            <div className="flex justify-between">
              <h4 className="font-medium">{question.question}</h4>
              <span className="text-xs text-gray-500">
                Question {questionIndex + 1}/{quiz.totalQuestions}
              </span>
            </div>

            <RadioGroup
              value={answers[questionIndex]?.toString() || ''}
              onValueChange={(value) => handleAnswerChange(questionIndex, parseInt(value))}
            >
              {question.options.map((option, optionIndex) => (
                <div key={optionIndex} className="flex items-center space-x-2">
                  <RadioGroupItem
                    value={optionIndex.toString()}
                    id={`q${questionIndex}-o${optionIndex}`}
                  />
                  <Label htmlFor={`q${questionIndex}-o${optionIndex}`} className="cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>

            {questionIndex < quiz.questions.length - 1 && <div className="border-t mt-4" />}
          </div>
        ))}

        <div className="flex gap-2">
          <Button
            onClick={handleSubmitQuiz}
            disabled={submitting}
            className="flex-1"
          >
            {submitting ? 'Submitting...' : 'Submit Quiz'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default QuizComponent
