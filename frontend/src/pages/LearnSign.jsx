import { useState } from 'react'

const signs = [
  { id: 1,  sign: '🤟', name: 'I Love You',       description: 'Extend thumb, index finger, and pinky. Keep middle and ring fingers down.',         difficulty: 'Easy',   category: 'Common'      },
  { id: 2,  sign: '✋', name: 'Stop',              description: 'Hold your flat hand up with fingers together, palm facing outward.',                  difficulty: 'Easy',   category: 'Common'      },
  { id: 3,  sign: '👍', name: 'Good',              description: 'Make a fist and point your thumb upward toward the sky.',                            difficulty: 'Easy',   category: 'Common'      },
  { id: 4,  sign: '👎', name: 'Bad',               description: 'Make a fist and point your thumb downward toward the ground.',                       difficulty: 'Easy',   category: 'Common'      },
  { id: 5,  sign: '🙏', name: 'Please',            description: 'Place your flat hand on your chest and move it in a slow circular motion.',          difficulty: 'Easy',   category: 'Polite'      },
  { id: 6,  sign: '🆘', name: 'Help',              description: 'Make a tight fist with thumb on side, lift fist upward from waist.',                 difficulty: 'Easy',   category: 'Emergency'   },
  { id: 7,  sign: '✌️', name: 'No',               description: 'Extend index and middle fingers, wave them side to side. Keep wrist still.',         difficulty: 'Easy',   category: 'Common'      },
  { id: 8,  sign: '✊', name: 'Yes',               description: 'Make a firm fist and nod it up and down like a head nodding yes.',                   difficulty: 'Easy',   category: 'Common'      },
  { id: 9,  sign: '🤙', name: 'Excuse Me',         description: 'Extend fingers flat, brush them across the opposite open palm 2-3 times.',           difficulty: 'Medium', category: 'Polite'      },
  { id: 10, sign: '🚑', name: 'Call Ambulance',    description: 'Point finger up then mimic holding a phone near your ear.',                          difficulty: 'Medium', category: 'Emergency'   },
  { id: 11, sign: '👮', name: 'Call Police',       description: 'Point finger up then tap your chest (badge area) twice.',                            difficulty: 'Medium', category: 'Emergency'   },
  { id: 12, sign: '👨‍⚕️', name: 'I Need Doctor',  description: 'Point to yourself then tap your inner wrist (pulse point).',                         difficulty: 'Medium', category: 'Emergency'   },
]

const categories   = ['All', 'Common', 'Polite', 'Emergency']
const difficulties = ['All', 'Easy', 'Medium', 'Hard']

const diffColor = { Easy: '#10b981', Medium: '#f59e0b', Hard: '#ef4444' }
const catColor  = { Common: '#0066ff', Polite: '#8b5cf6', Emergency: '#ef4444' }

export default function LearnSign() {
  const [selected,        setSelected]        = useState(null)
  const [activeCategory,  setActiveCategory]  = useState('All')
  const [activeDiff,      setActiveDiff]      = useState('All')
  const [search,          setSearch]          = useState('')
  const [practiced,       setPracticed]       = useState([])
  const [showQuiz,        setShowQuiz]        = useState(false)
  const [quizSign,        setQuizSign]        = useState(null)
  const [quizOptions,     setQuizOptions]     = useState([])
  const [quizResult,      setQuizResult]      = useState(null)
  const [score,           setScore]           = useState({ correct: 0, total: 0 })
  const [quizMode,        setQuizMode]        = useState('emoji')  // emoji | name
  const [streak,          setStreak]          = useState(0)
  const [bestStreak,      setBestStreak]      = useState(0)
  const [answered,        setAnswered]        = useState(null)

  const filtered = signs.filter(s => {
    const matchCat  = activeCategory === 'All' || s.category  === activeCategory
    const matchDiff = activeDiff     === 'All' || s.difficulty === activeDiff
    const matchSrch = s.name.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchDiff && matchSrch
  })

  const markPracticed = (id) => {
    if (!practiced.includes(id)) setPracticed(p => [...p, id])
  }

  const startQuiz = () => {
    const pool   = signs
    const random = pool[Math.floor(Math.random() * pool.length)]
    const others = pool.filter(s => s.id !== random.id)
      .sort(() => Math.random() - 0.5).slice(0, 3)
    const options = [...others, random].sort(() => Math.random() - 0.5)
    setQuizSign(random)
    setQuizOptions(options)
    setQuizResult(null)
    setAnswered(null)
    setQuizMode(Math.random() > 0.5 ? 'emoji' : 'name')
    setShowQuiz(true)
  }

  const answerQuiz = (answer) => {
    if (answered !== null) return
    const correct = answer === quizSign.name
    setAnswered(answer)
    setQuizResult(correct ? 'correct' : 'wrong')
    const newStreak = correct ? streak + 1 : 0
    setStreak(newStreak)
    if (newStreak > bestStreak) setBestStreak(newStreak)
    setScore(prev => ({
      correct: prev.correct + (correct ? 1 : 0),
      total:   prev.total + 1
    }))
    if (correct) markPracticed(quizSign.id)
  }

  const pct = signs.length > 0 ? Math.round((practiced.length / signs.length) * 100) : 0

  return (
    <div style={{
      fontFamily: "'DM Sans','Segoe UI',system-ui,sans-serif",
      color: '#0a1628',
    }}>

      {/* ── Header ─────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0a1628', letterSpacing: '-0.5px', marginBottom: '4px' }}>
            Learn Sign Language
          </h1>
          <p style={{ color: '#64748b', fontSize: '13px' }}>
            Practice {signs.length} signs · {practiced.length} completed · {pct}% done
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          {score.total > 0 && (
            <div style={{
              display: 'flex', gap: '16px', padding: '8px 16px',
              background: '#ffffff', border: '1px solid #e8edf2', borderRadius: '10px',
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#10b981' }}>{score.correct}/{score.total}</div>
                <div style={{ fontSize: '10px', color: '#94a3b8' }}>Quiz Score</div>
              </div>
              <div style={{ width: '1px', background: '#f0f4f8' }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#f59e0b' }}>🔥 {streak}</div>
                <div style={{ fontSize: '10px', color: '#94a3b8' }}>Streak</div>
              </div>
              <div style={{ width: '1px', background: '#f0f4f8' }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#0066ff' }}>{bestStreak}</div>
                <div style={{ fontSize: '10px', color: '#94a3b8' }}>Best</div>
              </div>
            </div>
          )}
          <button onClick={startQuiz} style={{
            padding: '9px 20px',
            background: '#0066ff', border: 'none',
            borderRadius: '10px', color: 'white',
            cursor: 'pointer', fontWeight: 700, fontSize: '13px',
            transition: 'background 0.15s',
          }}
            onMouseEnter={e => e.currentTarget.style.background = '#0052cc'}
            onMouseLeave={e => e.currentTarget.style.background = '#0066ff'}
          >
            🧠 Take Quiz
          </button>
        </div>
      </div>

      {/* ── Progress ───────────────────────────────────────────── */}
      <div style={{
        background: '#ffffff', border: '1px solid #e8edf2',
        borderRadius: '14px', padding: '18px 20px', marginBottom: '20px',
        display: 'flex', alignItems: 'center', gap: '20px',
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>Learning Progress</span>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#0066ff' }}>{practiced.length}/{signs.length} signs</span>
          </div>
          <div style={{ height: '8px', background: '#f0f4f8', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: '4px',
              width: `${pct}%`,
              background: pct === 100 ? '#10b981' : 'linear-gradient(90deg, #0066ff, #00d4ff)',
              transition: 'width 0.5s ease',
            }} />
          </div>
        </div>
        <div style={{
          padding: '8px 16px', borderRadius: '10px',
          background: pct === 100 ? 'rgba(16,185,129,0.08)' : 'rgba(0,102,255,0.06)',
          border: `1px solid ${pct === 100 ? 'rgba(16,185,129,0.2)' : 'rgba(0,102,255,0.15)'}`,
          fontSize: '20px', fontWeight: 900,
          color: pct === 100 ? '#10b981' : '#0066ff',
        }}>{pct}%</div>
      </div>

      {/* ── Filters ────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="text" placeholder="Search signs..."
          value={search} onChange={e => setSearch(e.target.value)}
          style={{
            padding: '9px 16px', minWidth: '200px',
            background: '#ffffff', border: '1.5px solid #e2e8f0',
            borderRadius: '10px', color: '#0a1628',
            fontSize: '13px', outline: 'none',
            fontFamily: "'DM Sans','Segoe UI',system-ui",
          }}
          onFocus={e => e.target.style.borderColor = '#0066ff'}
          onBlur={e => e.target.style.borderColor = '#e2e8f0'}
        />
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)} style={{
              padding: '7px 14px',
              background: activeCategory === cat ? 'rgba(0,102,255,0.08)' : '#ffffff',
              border: `1.5px solid ${activeCategory === cat ? '#0066ff' : '#e2e8f0'}`,
              borderRadius: '8px',
              color: activeCategory === cat ? '#0066ff' : '#64748b',
              cursor: 'pointer', fontSize: '12px', fontWeight: 600, transition: 'all 0.15s',
            }}>{cat}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          {difficulties.map(diff => (
            <button key={diff} onClick={() => setActiveDiff(diff)} style={{
              padding: '7px 14px',
              background: activeDiff === diff ? `${diffColor[diff] || '#0066ff'}10` : '#ffffff',
              border: `1.5px solid ${activeDiff === diff ? diffColor[diff] || '#0066ff' : '#e2e8f0'}`,
              borderRadius: '8px',
              color: activeDiff === diff ? diffColor[diff] || '#0066ff' : '#64748b',
              cursor: 'pointer', fontSize: '12px', fontWeight: 600, transition: 'all 0.15s',
            }}>{diff}</button>
          ))}
        </div>
      </div>

      {/* ── Grid + Detail ─────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 320px' : '1fr', gap: '20px' }}>

        {/* Signs grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
          gap: '12px', alignContent: 'start',
        }}>
          {filtered.map(sign => (
            <div key={sign.id}
              onClick={() => setSelected(selected?.id === sign.id ? null : sign)}
              style={{
                padding: '20px 14px', textAlign: 'center',
                background: selected?.id === sign.id ? 'rgba(0,102,255,0.06)' : '#ffffff',
                border: `1.5px solid ${
                  selected?.id === sign.id ? '#0066ff'
                  : practiced.includes(sign.id) ? 'rgba(16,185,129,0.4)'
                  : '#e8edf2'
                }`,
                borderRadius: '14px', cursor: 'pointer',
                transition: 'all 0.15s', position: 'relative',
              }}
              onMouseEnter={e => { if (selected?.id !== sign.id) { e.currentTarget.style.borderColor = '#0066ff'; e.currentTarget.style.transform = 'translateY(-2px)' } }}
              onMouseLeave={e => { if (selected?.id !== sign.id) { e.currentTarget.style.borderColor = practiced.includes(sign.id) ? 'rgba(16,185,129,0.4)' : '#e8edf2'; e.currentTarget.style.transform = 'translateY(0)' } }}
            >
              {/* Practiced badge */}
              {practiced.includes(sign.id) && (
                <div style={{
                  position: 'absolute', top: '8px', right: '8px',
                  width: '18px', height: '18px', borderRadius: '50%',
                  background: '#10b981',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '10px', color: 'white', fontWeight: 800,
                }}>✓</div>
              )}
              {/* Category dot */}
              <div style={{
                position: 'absolute', top: '8px', left: '8px',
                width: '6px', height: '6px', borderRadius: '50%',
                background: catColor[sign.category] || '#94a3b8',
              }} />

              <div style={{ fontSize: '36px', marginBottom: '10px' }}>{sign.sign}</div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#0a1628', marginBottom: '6px' }}>{sign.name}</div>
              <div style={{
                display: 'inline-block', padding: '2px 10px',
                background: `${diffColor[sign.difficulty]}12`,
                border: `1px solid ${diffColor[sign.difficulty]}30`,
                borderRadius: '20px', fontSize: '11px', fontWeight: 600,
                color: diffColor[sign.difficulty],
              }}>{sign.difficulty}</div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div style={{
              gridColumn: '1/-1', textAlign: 'center', padding: '48px',
              color: '#94a3b8', fontSize: '14px',
            }}>
              No signs found matching your filters
            </div>
          )}
        </div>

        {/* Detail panel */}
        {selected && (
          <div style={{
            background: '#ffffff', border: '1px solid #e8edf2',
            borderRadius: '16px', padding: '24px',
            height: 'fit-content', position: 'sticky', top: '0',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', letterSpacing: '1px' }}>SIGN DETAILS</div>
              <button onClick={() => setSelected(null)} style={{
                background: '#f8fafc', border: '1px solid #e2e8f0',
                width: '28px', height: '28px', borderRadius: '50%',
                cursor: 'pointer', color: '#64748b', fontSize: '14px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>✕</button>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ fontSize: '72px', marginBottom: '12px' }}>{selected.sign}</div>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0a1628', marginBottom: '10px' }}>{selected.name}</h2>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                <span style={{
                  padding: '3px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 700,
                  background: `${diffColor[selected.difficulty]}10`,
                  color: diffColor[selected.difficulty],
                  border: `1px solid ${diffColor[selected.difficulty]}30`,
                }}>{selected.difficulty}</span>
                <span style={{
                  padding: '3px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 700,
                  background: `${catColor[selected.category] || '#94a3b8'}10`,
                  color: catColor[selected.category] || '#94a3b8',
                  border: `1px solid ${catColor[selected.category] || '#94a3b8'}30`,
                }}>{selected.category}</span>
              </div>
            </div>

            <div style={{
              padding: '16px', background: '#f8fafc',
              border: '1px solid #f0f4f8', borderRadius: '12px', marginBottom: '16px',
            }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', letterSpacing: '1px', marginBottom: '8px' }}>HOW TO SIGN</div>
              <p style={{ fontSize: '13px', color: '#334155', lineHeight: 1.7 }}>{selected.description}</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button onClick={() => markPracticed(selected.id)} style={{
                width: '100%', padding: '12px',
                background: practiced.includes(selected.id) ? 'rgba(16,185,129,0.08)' : '#0066ff',
                border: practiced.includes(selected.id) ? '1.5px solid rgba(16,185,129,0.3)' : 'none',
                borderRadius: '10px',
                color: practiced.includes(selected.id) ? '#10b981' : 'white',
                cursor: 'pointer', fontWeight: 700, fontSize: '14px',
                transition: 'all 0.15s',
              }}>
                {practiced.includes(selected.id) ? '✓ Practiced!' : 'Mark as Practiced'}
              </button>
              <button onClick={startQuiz} style={{
                width: '100%', padding: '12px',
                background: '#f8fafc', border: '1.5px solid #e2e8f0',
                borderRadius: '10px', color: '#334155',
                cursor: 'pointer', fontWeight: 600, fontSize: '14px',
                transition: 'all 0.15s',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#0066ff'; e.currentTarget.style.color = '#0066ff' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#334155' }}
              >
                🧠 Test This Sign
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── QUIZ MODAL ─────────────────────────────────────────── */}
      {showQuiz && quizSign && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(10,22,40,0.85)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px',
        }}>
          <div style={{
            background: '#ffffff', borderRadius: '24px',
            padding: '36px', maxWidth: '460px', width: '100%',
            textAlign: 'center', position: 'relative',
            boxShadow: '0 24px 80px rgba(0,0,0,0.2)',
          }}>

            {/* Close */}
            <button onClick={() => setShowQuiz(false)} style={{
              position: 'absolute', top: '16px', right: '16px',
              background: '#f8fafc', border: '1px solid #e2e8f0',
              width: '32px', height: '32px', borderRadius: '50%',
              cursor: 'pointer', color: '#64748b', fontSize: '16px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>✕</button>

            {/* Score row */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '24px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#10b981' }}>{score.correct}/{score.total}</div>
                <div style={{ fontSize: '10px', color: '#94a3b8' }}>Score</div>
              </div>
              <div style={{ width: '1px', background: '#f0f4f8' }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#f59e0b' }}>🔥 {streak}</div>
                <div style={{ fontSize: '10px', color: '#94a3b8' }}>Streak</div>
              </div>
              <div style={{ width: '1px', background: '#f0f4f8' }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#0066ff' }}>{bestStreak}</div>
                <div style={{ fontSize: '10px', color: '#94a3b8' }}>Best</div>
              </div>
            </div>

            {/* Question */}
            <div style={{
              fontSize: '12px', fontWeight: 700, color: '#94a3b8',
              letterSpacing: '1.5px', marginBottom: '16px',
            }}>
              {quizMode === 'emoji' ? 'WHAT SIGN IS THIS?' : 'WHICH EMOJI SHOWS THIS SIGN?'}
            </div>

            {/* The question content */}
            {quizMode === 'emoji' ? (
              <div style={{
                fontSize: '88px', marginBottom: '28px', lineHeight: 1,
                animation: 'popIn 0.3s ease',
              }}>{quizSign.sign}</div>
            ) : (
              <div style={{
                fontSize: '28px', fontWeight: 900, color: '#0a1628',
                marginBottom: '28px', padding: '20px',
                background: '#f8faff', borderRadius: '14px',
                border: '1px solid #e8edf2',
              }}>{quizSign.name}</div>
            )}

            {/* Result */}
            {quizResult ? (
              <div>
                <div style={{
                  padding: '16px', borderRadius: '14px', marginBottom: '20px',
                  background: quizResult === 'correct' ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
                  border: `1px solid ${quizResult === 'correct' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
                }}>
                  <div style={{
                    fontSize: '24px', fontWeight: 800, marginBottom: '6px',
                    color: quizResult === 'correct' ? '#10b981' : '#ef4444',
                  }}>
                    {quizResult === 'correct' ? '✓ Correct!' : '✗ Wrong!'}
                  </div>
                  {quizResult === 'wrong' && (
                    <div style={{ fontSize: '13px', color: '#64748b' }}>
                      Correct answer: <strong style={{ color: '#0a1628' }}>{quizSign.name} {quizSign.sign}</strong>
                    </div>
                  )}
                  {quizResult === 'correct' && streak > 1 && (
                    <div style={{ fontSize: '13px', color: '#10b981', marginTop: '4px' }}>
                      🔥 {streak} in a row! Keep going!
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                  <button onClick={startQuiz} style={{
                    padding: '11px 28px',
                    background: '#0066ff', border: 'none',
                    borderRadius: '10px', color: 'white',
                    cursor: 'pointer', fontWeight: 700, fontSize: '14px',
                    transition: 'background 0.15s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = '#0052cc'}
                    onMouseLeave={e => e.currentTarget.style.background = '#0066ff'}
                  >Next Question →</button>
                  <button onClick={() => setShowQuiz(false)} style={{
                    padding: '11px 28px',
                    background: '#f8fafc', border: '1.5px solid #e2e8f0',
                    borderRadius: '10px', color: '#64748b',
                    cursor: 'pointer', fontWeight: 600, fontSize: '14px',
                  }}>End Quiz</button>
                </div>
              </div>
            ) : (
              // Options grid
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {quizOptions.map((opt, i) => (
                  <button key={i} onClick={() => answerQuiz(opt.name)} style={{
                    padding: '14px',
                    background: '#f8fafc',
                    border: '1.5px solid #e2e8f0',
                    borderRadius: '12px', color: '#0a1628',
                    cursor: 'pointer', fontWeight: 600, fontSize: '14px',
                    transition: 'all 0.15s',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,102,255,0.06)'; e.currentTarget.style.borderColor = '#0066ff'; e.currentTarget.style.color = '#0066ff' }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#0a1628' }}
                  >
                    {quizMode === 'name' && <span style={{ fontSize: '28px' }}>{opt.sign}</span>}
                    <span>{opt.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes popIn {
          0%   { transform: scale(0.8); opacity: 0; }
          100% { transform: scale(1);   opacity: 1; }
        }
        * { box-sizing: border-box; }
        input::placeholder { color: #94a3b8; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 2px; }
      `}</style>
    </div>
  )
}