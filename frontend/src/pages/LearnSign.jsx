import { useState } from 'react'

const signs = [
  { id: 1, sign: '🤟', name: 'I Love You', description: 'Extend thumb, index finger, and pinky. Keep middle and ring fingers down.', difficulty: 'Easy', category: 'Common' },
  { id: 2, sign: '✋', name: 'Hello / Stop', description: 'Hold your flat hand up with fingers together, palm facing outward.', difficulty: 'Easy', category: 'Common' },
  { id: 3, sign: '👍', name: 'Good / Yes', description: 'Make a fist and point your thumb upward toward the sky.', difficulty: 'Easy', category: 'Common' },
  { id: 4, sign: '👎', name: 'Bad / No', description: 'Make a fist and point your thumb downward toward the ground.', difficulty: 'Easy', category: 'Common' },
  { id: 5, sign: '🙏', name: 'Please / Thank You', description: 'Place your flat hand on your chin and move it forward and down.', difficulty: 'Easy', category: 'Polite' },
  { id: 6, sign: '☝️', name: 'Number One / Me', description: 'Extend only your index finger upward, all other fingers closed.', difficulty: 'Easy', category: 'Numbers' },
  { id: 7, sign: '✌️', name: 'Number Two / Peace', description: 'Extend index and middle fingers in a V shape, thumb holds other fingers.', difficulty: 'Easy', category: 'Numbers' },
  { id: 8, sign: '🤙', name: 'Call Me / Hang Loose', description: 'Extend thumb and pinky finger, keep other three fingers curled in.', difficulty: 'Medium', category: 'Common' },
  { id: 9, sign: '👋', name: 'Wave / Goodbye', description: 'Open palm facing out, wave side to side with a relaxed wrist motion.', difficulty: 'Easy', category: 'Common' },
  { id: 10, sign: '🤞', name: 'Hope / Luck', description: 'Cross your index and middle fingers and hold them up together.', difficulty: 'Medium', category: 'Expressions' },
  { id: 11, sign: '👌', name: 'OK / Perfect', description: 'Touch tip of thumb to tip of index finger forming a circle, other fingers extended.', difficulty: 'Easy', category: 'Common' },
  { id: 12, sign: '🤘', name: 'Rock On / Horns', description: 'Extend index and pinky fingers, curl thumb over middle and ring fingers.', difficulty: 'Medium', category: 'Expressions' },
]

const categories = ['All', 'Common', 'Polite', 'Numbers', 'Expressions']
const difficulties = ['All', 'Easy', 'Medium', 'Hard']

export default function LearnSign() {
  const [selectedSign, setSelectedSign] = useState(null)
  const [activeCategory, setActiveCategory] = useState('All')
  const [activeDifficulty, setActiveDifficulty] = useState('All')
  const [practiced, setPracticed] = useState([])
  const [searchText, setSearchText] = useState('')
  const [showQuiz, setShowQuiz] = useState(false)
  const [quizSign, setQuizSign] = useState(null)
  const [quizOptions, setQuizOptions] = useState([])
  const [quizResult, setQuizResult] = useState(null)
  const [score, setScore] = useState({ correct: 0, total: 0 })

  const filtered = signs.filter(s => {
    const matchCat = activeCategory === 'All' || s.category === activeCategory
    const matchDiff = activeDifficulty === 'All' || s.difficulty === activeDifficulty
    const matchSearch = s.name.toLowerCase().includes(searchText.toLowerCase())
    return matchCat && matchDiff && matchSearch
  })

  const markPracticed = (id) => {
    if (!practiced.includes(id)) setPracticed(prev => [...prev, id])
  }

  const startQuiz = () => {
    const random = signs[Math.floor(Math.random() * signs.length)]
    const others = signs.filter(s => s.id !== random.id)
      .sort(() => Math.random() - 0.5).slice(0, 3)
    const options = [...others, random].sort(() => Math.random() - 0.5)
    setQuizSign(random)
    setQuizOptions(options)
    setQuizResult(null)
    setShowQuiz(true)
  }

  const answerQuiz = (answer) => {
    const correct = answer === quizSign.name
    setQuizResult(correct ? 'correct' : 'wrong')
    setScore(prev => ({
      correct: prev.correct + (correct ? 1 : 0),
      total: prev.total + 1
    }))
  }

  const difficultyColor = { Easy: '#34d399', Medium: '#fbbf24', Hard: '#f87171' }

  return (
    <div style={{ color: '#e2d9f3', fontFamily: "'Segoe UI', system-ui, sans-serif" }}>

      {/* Header */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '6px' }}>Learn Sign Language</h1>
          <p style={{ color: '#7c6d9c', fontSize: '0.88rem' }}>
            Practice {signs.length} signs • {practiced.length} completed
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {/* Score */}
          {score.total > 0 && (
            <div style={{
              padding: '8px 16px',
              background: 'rgba(52,211,153,0.1)',
              border: '1px solid rgba(52,211,153,0.25)',
              borderRadius: '10px', fontSize: '0.82rem',
              color: '#34d399', fontWeight: 600
            }}>
              Quiz: {score.correct}/{score.total} ✓
            </div>
          )}
          <button onClick={startQuiz} style={{
            padding: '9px 20px',
            background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
            border: 'none', borderRadius: '10px', color: 'white',
            cursor: 'pointer', fontWeight: 700, fontSize: '0.88rem',
            boxShadow: '0 0 20px rgba(124,58,237,0.4)'
          }}>
            🧠 Take Quiz
          </button>
        </div>
      </div>

      {/* Quiz Modal */}
      {showQuiz && quizSign && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #0f0a1e, #0d1117)',
            border: '1px solid rgba(139,92,246,0.3)',
            borderRadius: '24px', padding: '40px',
            maxWidth: '440px', width: '90%', textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.75rem', color: '#7c6d9c', letterSpacing: '1px', marginBottom: '16px' }}>
              WHAT SIGN IS THIS?
            </div>
            <div style={{ fontSize: '6rem', marginBottom: '24px', filter: 'drop-shadow(0 0 20px rgba(167,139,250,0.5))' }}>
              {quizSign.sign}
            </div>

            {quizResult ? (
              <div>
                <div style={{
                  fontSize: '1.5rem', fontWeight: 800, marginBottom: '8px',
                  color: quizResult === 'correct' ? '#34d399' : '#f87171'
                }}>
                  {quizResult === 'correct' ? '✓ Correct!' : '✗ Wrong!'}
                </div>
                {quizResult === 'wrong' && (
                  <div style={{ color: '#7c6d9c', fontSize: '0.88rem', marginBottom: '20px' }}>
                    The correct answer was: <strong style={{ color: '#a78bfa' }}>{quizSign.name}</strong>
                  </div>
                )}
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
                  <button onClick={startQuiz} style={{
                    padding: '10px 24px',
                    background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
                    border: 'none', borderRadius: '10px', color: 'white',
                    cursor: 'pointer', fontWeight: 700, fontSize: '0.88rem'
                  }}>Next Question →</button>
                  <button onClick={() => setShowQuiz(false)} style={{
                    padding: '10px 24px',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(139,92,246,0.2)',
                    borderRadius: '10px', color: '#9d8ec0',
                    cursor: 'pointer', fontWeight: 600, fontSize: '0.88rem'
                  }}>Close</button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {quizOptions.map((opt, i) => (
                  <button key={i} onClick={() => answerQuiz(opt.name)} style={{
                    padding: '12px 16px',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(139,92,246,0.2)',
                    borderRadius: '12px', color: '#e2d9f3',
                    cursor: 'pointer', fontWeight: 600, fontSize: '0.88rem',
                    transition: 'all 0.15s'
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(124,58,237,0.2)'; e.currentTarget.style.borderColor = 'rgba(167,139,250,0.5)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(139,92,246,0.2)' }}
                  >
                    {opt.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Progress bar */}
      <div style={{
        padding: '16px 20px', marginBottom: '20px',
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(139,92,246,0.12)',
        borderRadius: '14px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.82rem', color: '#9d8ec0', fontWeight: 600 }}>Learning Progress</span>
          <span style={{ fontSize: '0.82rem', color: '#a78bfa', fontWeight: 700 }}>
            {practiced.length}/{signs.length} signs
          </span>
        </div>
        <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: '3px',
            width: `${(practiced.length / signs.length) * 100}%`,
            background: 'linear-gradient(135deg, #7c3aed, #38bdf8)',
            transition: 'width 0.5s ease',
            boxShadow: '0 0 10px rgba(124,58,237,0.5)'
          }} />
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Search */}
        <input
          type="text"
          placeholder="🔍 Search signs..."
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          style={{
            padding: '9px 16px', flex: 1, minWidth: '180px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(139,92,246,0.2)',
            borderRadius: '10px', color: '#e2d9f3',
            fontSize: '0.88rem', outline: 'none'
          }}
          onFocus={e => e.target.style.borderColor = 'rgba(139,92,246,0.6)'}
          onBlur={e => e.target.style.borderColor = 'rgba(139,92,246,0.2)'}
        />

        {/* Category filters */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)} style={{
              padding: '8px 14px',
              background: activeCategory === cat ? 'rgba(124,58,237,0.25)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${activeCategory === cat ? 'rgba(167,139,250,0.5)' : 'rgba(139,92,246,0.15)'}`,
              borderRadius: '8px',
              color: activeCategory === cat ? '#c4b5fd' : '#7c6d9c',
              cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600
            }}>{cat}</button>
          ))}
        </div>

        {/* Difficulty filters */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {difficulties.map(diff => (
            <button key={diff} onClick={() => setActiveDifficulty(diff)} style={{
              padding: '8px 14px',
              background: activeDifficulty === diff ? 'rgba(52,211,153,0.15)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${activeDifficulty === diff ? 'rgba(52,211,153,0.4)' : 'rgba(139,92,246,0.15)'}`,
              borderRadius: '8px',
              color: activeDifficulty === diff ? '#34d399' : '#7c6d9c',
              cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600
            }}>{diff}</button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedSign ? '1fr 340px' : '1fr', gap: '20px' }}>

        {/* Signs grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
          gap: '14px', alignContent: 'start'
        }}>
          {filtered.map(sign => (
            <div key={sign.id} onClick={() => setSelectedSign(sign)} style={{
              padding: '20px 16px', textAlign: 'center',
              background: selectedSign?.id === sign.id
                ? 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(37,99,235,0.15))'
                : practiced.includes(sign.id)
                  ? 'rgba(52,211,153,0.06)'
                  : 'rgba(255,255,255,0.02)',
              border: `1px solid ${selectedSign?.id === sign.id
                ? 'rgba(167,139,250,0.5)'
                : practiced.includes(sign.id)
                  ? 'rgba(52,211,153,0.25)'
                  : 'rgba(139,92,246,0.12)'}`,
              borderRadius: '16px', cursor: 'pointer',
              transition: 'all 0.2s', position: 'relative'
            }}
              onMouseEnter={e => { if (selectedSign?.id !== sign.id) e.currentTarget.style.borderColor = 'rgba(139,92,246,0.35)' }}
              onMouseLeave={e => { if (selectedSign?.id !== sign.id) e.currentTarget.style.borderColor = practiced.includes(sign.id) ? 'rgba(52,211,153,0.25)' : 'rgba(139,92,246,0.12)' }}
            >
              {practiced.includes(sign.id) && (
                <div style={{
                  position: 'absolute', top: '8px', right: '8px',
                  width: '18px', height: '18px', borderRadius: '50%',
                  background: '#34d399', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700, color: '#0d1117'
                }}>✓</div>
              )}
              <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>{sign.sign}</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#e2d9f3', marginBottom: '6px' }}>{sign.name}</div>
              <div style={{
                display: 'inline-block', padding: '2px 8px',
                background: `rgba(${sign.difficulty === 'Easy' ? '52,211,153' : sign.difficulty === 'Medium' ? '251,191,36' : '248,113,113'},0.12)`,
                border: `1px solid ${difficultyColor[sign.difficulty]}40`,
                borderRadius: '6px', fontSize: '0.7rem', fontWeight: 600,
                color: difficultyColor[sign.difficulty]
              }}>
                {sign.difficulty}
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: '#4a3f6b' }}>
              No signs found matching your filters
            </div>
          )}
        </div>

        {/* Detail panel */}
        {selectedSign && (
          <div style={{
            padding: '28px',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(139,92,246,0.2)',
            borderRadius: '20px', height: 'fit-content',
            position: 'sticky', top: '0'
          }}>
            <button onClick={() => setSelectedSign(null)} style={{
              float: 'right', background: 'none', border: 'none',
              color: '#4a3f6b', cursor: 'pointer', fontSize: '1.2rem'
            }}>✕</button>

            <div style={{ fontSize: '5rem', textAlign: 'center', marginBottom: '16px', filter: 'drop-shadow(0 0 20px rgba(167,139,250,0.4))' }}>
              {selectedSign.sign}
            </div>

            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '8px', textAlign: 'center' }}>
              {selectedSign.name}
            </h2>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '20px' }}>
              <span style={{
                padding: '3px 12px',
                background: `rgba(${selectedSign.difficulty === 'Easy' ? '52,211,153' : '251,191,36'},0.12)`,
                border: `1px solid ${difficultyColor[selectedSign.difficulty]}40`,
                borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600,
                color: difficultyColor[selectedSign.difficulty]
              }}>{selectedSign.difficulty}</span>
              <span style={{
                padding: '3px 12px',
                background: 'rgba(167,139,250,0.1)',
                border: '1px solid rgba(167,139,250,0.25)',
                borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600, color: '#a78bfa'
              }}>{selectedSign.category}</span>
            </div>

            <div style={{
              padding: '16px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(139,92,246,0.12)',
              borderRadius: '12px', marginBottom: '20px'
            }}>
              <div style={{ fontSize: '0.72rem', color: '#7c6d9c', letterSpacing: '1px', marginBottom: '8px' }}>HOW TO SIGN</div>
              <p style={{ color: '#c4b5fd', fontSize: '0.88rem', lineHeight: 1.7 }}>
                {selectedSign.description}
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button onClick={() => markPracticed(selectedSign.id)} style={{
                width: '100%', padding: '12px',
                background: practiced.includes(selectedSign.id)
                  ? 'rgba(52,211,153,0.15)'
                  : 'linear-gradient(135deg, #7c3aed, #2563eb)',
                border: practiced.includes(selectedSign.id) ? '1px solid rgba(52,211,153,0.3)' : 'none',
                borderRadius: '12px',
                color: practiced.includes(selectedSign.id) ? '#34d399' : 'white',
                cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem',
                boxShadow: practiced.includes(selectedSign.id) ? 'none' : '0 0 20px rgba(124,58,237,0.4)'
              }}>
                {practiced.includes(selectedSign.id) ? '✓ Practiced!' : 'Mark as Practiced'}
              </button>
              <button onClick={startQuiz} style={{
                width: '100%', padding: '12px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(139,92,246,0.2)',
                borderRadius: '12px', color: '#9d8ec0',
                cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem'
              }}>
                🧠 Test This Sign
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}