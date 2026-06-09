import { useEffect, useState } from 'react'
import { CTA_LABEL, CTA_MODE, CTA_URL } from './config'
import { getUtmParams, trackEvent } from './utils/tracking'
import './App.css'

type Screen = 'intro' | 'quiz' | 'result'

type ResultType = {
  id: string
  title: string
  tagline: string
  description: string
}

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=800&q=80&auto=format&fit=crop'

const QUESTIONS = [
  {
    text: 'How do you usually show affection?',
    options: [
      { label: 'Words and deep conversations', scores: { communicator: 2 } },
      { label: 'Planning surprises and dates', scores: { romantic: 2 } },
      { label: 'Being there when they need me', scores: { guardian: 2 } },
      { label: 'Giving them space to be themselves', scores: { independent: 2 } },
    ],
  },
  {
    text: 'When conflict happens, you tend to…',
    options: [
      { label: 'Talk it through right away', scores: { communicator: 2 } },
      { label: 'Take time, then reconnect warmly', scores: { romantic: 1, guardian: 1 } },
      { label: 'Stay calm and find a practical fix', scores: { guardian: 2 } },
      { label: 'Step back until emotions settle', scores: { independent: 2 } },
    ],
  },
  {
    text: 'Your ideal date night looks like…',
    options: [
      { label: 'Cozy dinner and honest conversation', scores: { communicator: 2, romantic: 1 } },
      { label: 'Something spontaneous and exciting', scores: { adventurous: 2 } },
      { label: 'A quiet night in, just the two of you', scores: { romantic: 2, guardian: 1 } },
      { label: 'An activity you can both enjoy independently', scores: { independent: 1, adventurous: 1 } },
    ],
  },
  {
    text: 'In a relationship, you value most…',
    options: [
      { label: 'Emotional honesty', scores: { communicator: 2 } },
      { label: 'Passion and chemistry', scores: { romantic: 2 } },
      { label: 'Trust and reliability', scores: { guardian: 2 } },
      { label: 'Freedom and mutual respect', scores: { independent: 2 } },
    ],
  },
  {
    text: 'How important is independence to you?',
    options: [
      { label: 'Not very — I love being close', scores: { romantic: 2, guardian: 1 } },
      { label: 'Somewhat — balance is key', scores: { communicator: 1, guardian: 1 } },
      { label: 'Very — I need my own world too', scores: { independent: 2 } },
      { label: 'Essential — I thrive on solo adventures', scores: { independent: 1, adventurous: 2 } },
    ],
  },
  {
    text: 'Friends would describe your love style as…',
    options: [
      { label: 'The one who always communicates', scores: { communicator: 2 } },
      { label: 'The hopeless romantic', scores: { romantic: 2 } },
      { label: 'The steady, loyal partner', scores: { guardian: 2 } },
      { label: 'The free spirit', scores: { adventurous: 2 } },
    ],
  },
  {
    text: 'What draws you to someone first?',
    options: [
      { label: 'How well we connect emotionally', scores: { communicator: 2 } },
      { label: 'The spark and chemistry', scores: { romantic: 2 } },
      { label: 'Their character and consistency', scores: { guardian: 2 } },
      { label: 'Shared adventures and energy', scores: { adventurous: 2 } },
    ],
  },
]

const RESULTS: Record<string, ResultType> = {
  communicator: {
    id: 'communicator',
    title: 'The Communicator',
    tagline: 'You love with words, depth, and honesty.',
    description:
      'You build relationships through open dialogue and emotional clarity. You need a partner who listens, shares, and isn\'t afraid of real conversation.',
  },
  romantic: {
    id: 'romantic',
    title: 'The Romantic',
    tagline: 'You love with passion, presence, and intention.',
    description:
      'You crave connection that feels alive — thoughtful gestures, quality time, and someone who makes you feel chosen every day.',
  },
  guardian: {
    id: 'guardian',
    title: 'The Guardian',
    tagline: 'You love with loyalty, care, and consistency.',
    description:
      'You show love by showing up. Trust and reliability matter most to you — you want a partner who is steady, sincere, and in it for real.',
  },
  independent: {
    id: 'independent',
    title: 'The Independent',
    tagline: 'You love with respect, space, and authenticity.',
    description:
      'You value freedom within commitment. The right match for you is someone secure enough to give you room to be fully yourself.',
  },
  adventurous: {
    id: 'adventurous',
    title: 'The Adventurer',
    tagline: 'You love with energy, curiosity, and shared experiences.',
    description:
      'You\'re drawn to partners who keep life interesting — new places, new ideas, and a relationship that feels like an adventure, not a routine.',
  },
}

function calcResult(answers: number[]): ResultType {
  const scores: Record<string, number> = {
    communicator: 0,
    romantic: 0,
    guardian: 0,
    independent: 0,
    adventurous: 0,
  }

  answers.forEach((answerIdx, qIdx) => {
    const option = QUESTIONS[qIdx].options[answerIdx]
    for (const [key, val] of Object.entries(option.scores)) {
      scores[key] += val
    }
  })

  const winner = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0]
  return RESULTS[winner]
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('intro')
  const [questionIdx, setQuestionIdx] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [result, setResult] = useState<ResultType | null>(null)

  useEffect(() => {
    const utm = getUtmParams()
    trackEvent('page_view', utm as Record<string, string>)
  }, [])

  function startQuiz() {
    trackEvent('quiz_start')
    setScreen('quiz')
    setQuestionIdx(0)
    setAnswers([])
    setResult(null)
  }

  function pickAnswer(optionIdx: number) {
    const next = [...answers, optionIdx]
    setAnswers(next)

    if (questionIdx < QUESTIONS.length - 1) {
      setQuestionIdx(questionIdx + 1)
    } else {
      const r = calcResult(next)
      setResult(r)
      setScreen('result')
      trackEvent('quiz_complete', { result: r.id })
    }
  }

  function handleCta() {
    const utm = getUtmParams()
    const params = new URLSearchParams({
      ...utm,
      result: result?.id ?? '',
      source: 'personality_test',
    })

    const separator = CTA_URL.includes('?') ? '&' : '?'
    const destination = `${CTA_URL}${separator}${params.toString()}`

    trackEvent('cta_click', {
      location: 'result',
      result: result?.id ?? '',
      destination: CTA_URL,
      mode: CTA_MODE,
    })

    window.location.href = destination
  }

  if (screen === 'intro') {
    return (
      <div className="page">
        <main className="intro">
          <h1 className="title">What's Your Relationship Personality?</h1>
          <img
            className="hero-img"
            src={HERO_IMAGE}
            alt="Couple enjoying a moment together"
            width={800}
            height={500}
            fetchPriority="high"
          />
          <button className="cta" onClick={startQuiz}>
            Take the Free Test →
          </button>
        </main>
      </div>
    )
  }

  if (screen === 'quiz') {
    const q = QUESTIONS[questionIdx]
    const progress = ((questionIdx + 1) / QUESTIONS.length) * 100

    return (
      <div className="page">
        <main className="quiz">
          <div className="progress">
            <div className="progress__bar" style={{ width: `${progress}%` }} />
          </div>
          <p className="quiz__count">
            {questionIdx + 1} / {QUESTIONS.length}
          </p>
          <h2 className="quiz__question">{q.text}</h2>
          <div className="quiz__options">
            {q.options.map((opt, i) => (
              <button key={i} className="option" onClick={() => pickAnswer(i)}>
                {opt.label}
              </button>
            ))}
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="page">
      <main className="result">
        <p className="result__label">Your type is</p>
        <h1 className="result__title">{result?.title}</h1>
        <p className="result__tagline">{result?.tagline}</p>
        <p className="result__desc">{result?.description}</p>
        <button className="cta" onClick={handleCta}>
          {CTA_LABEL[CTA_MODE]}
        </button>
      </main>
    </div>
  )
}
