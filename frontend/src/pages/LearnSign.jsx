import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'

const signs = [
  { id: 1,  sign: '🤟', name: 'I Love You',    description: 'Extend thumb, index finger, and pinky. Keep middle and ring fingers down.',        difficulty: 'Easy',   category: 'Common'    },
  { id: 2,  sign: '✋', name: 'Stop',           description: 'Hold your flat hand up with fingers together, palm facing outward.',                 difficulty: 'Easy',   category: 'Common'    },
  { id: 3,  sign: '👍', name: 'Good',           description: 'Make a fist and point your thumb upward toward the sky.',                           difficulty: 'Easy',   category: 'Common'    },
  { id: 4,  sign: '👎', name: 'Bad',            description: 'Make a fist and point your thumb downward toward the ground.',                      difficulty: 'Easy',   category: 'Common'    },
  { id: 5,  sign: '🙏', name: 'Please',         description: 'Place your flat hand on your chest and move it in a slow circular motion.',         difficulty: 'Easy',   category: 'Polite'    },
  { id: 6,  sign: '🆘', name: 'Help',           description: 'Make a tight fist with thumb on side, lift fist upward from waist.',                difficulty: 'Easy',   category: 'Emergency' },
  { id: 7,  sign: '✌️', name: 'No',            description: 'Extend index and middle fingers, wave them side to side. Keep wrist still.',        difficulty: 'Easy',   category: 'Common'    },
  { id: 8,  sign: '✊', name: 'Yes',            description: 'Make a firm fist and nod it up and down like a head nodding yes.',                  difficulty: 'Easy',   category: 'Common'    },
  { id: 9,  sign: '🤙', name: 'Excuse Me',      description: 'Extend fingers flat, brush them across the opposite open palm 2-3 times.',          difficulty: 'Medium', category: 'Polite'    },
  { id: 10, sign: '🚑', name: 'Call Ambulance', description: 'Point finger up then mimic holding a phone near your ear.',                         difficulty: 'Medium', category: 'Emergency' },
  { id: 11, sign: '👮', name: 'Call Police',    description: 'Point finger up then tap your chest (badge area) twice.',                           difficulty: 'Medium', category: 'Emergency' },
  { id: 12, sign: '👨‍⚕️', name: 'I Need Doctor', description: 'Point to yourself then tap your inner wrist (pulse point).',                      difficulty: 'Medium', category: 'Emergency' },
]

const categories   = ['All', 'Common', 'Polite', 'Emergency']
const difficulties = ['All', 'Easy', 'Medium', 'Hard']
const diffColor    = { Easy: '#10b981', Medium: '#f59e0b', Hard: '#ef4444' }
const catColor     = { Common: '#6366f1', Polite: '#8b5cf6', Emergency: '#ef4444' }

export default function LearnSign() {
  const ctx      = useOutletContext?.() || {}
  const dark     = ctx.dark ?? (localStorage.getItem('signova_theme') !== 'light')

  const [selected,       setSelected]       = useState(null)
  const [activeCategory, setActiveCategory] = useState('All')
  const [activeDiff,     setActiveDiff]     = useState('All')
  const [search,         setSearch]         = useState('')
  const [practiced,      setPracticed]      = useState([])
  const [showQuiz,       setShowQuiz]       = useState(false)
  const [quizSign,       setQuizSign]       = useState(null)
  const [quizOptions,    setQuizOptions]    = useState([])
  const [quizResult,     setQuizResult]     = useState(null)
  const [score,          setScore]          = useState({ correct: 0, total: 0 })
  const [quizMode,       setQuizMode]       = useState('emoji')
  const [streak,         setStreak]         = useState(0)
  const [bestStreak,     setBestStreak]     = useState(0)
  const [answered,       setAnswered]       = useState(null)

  const filtered = signs.filter(s => {
    const matchCat  = activeCategory === 'All' || s.category  === activeCategory
    const matchDiff = activeDiff     === 'All' || s.difficulty === activeDiff
    const matchSrch = s.name.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchDiff && matchSrch
  })

  const markPracticed = (id) => { if (!practiced.includes(id)) setPracticed(p => [...p, id]) }

  const startQuiz = () => {
    const pool   = signs
    const random = pool[Math.floor(Math.random() * pool.length)]
    const others = pool.filter(s => s.id !== random.id).sort(() => Math.random() - .5).slice(0, 3)
    const options = [...others, random].sort(() => Math.random() - .5)
    setQuizSign(random); setQuizOptions(options); setQuizResult(null); setAnswered(null)
    setQuizMode(Math.random() > .5 ? 'emoji' : 'name'); setShowQuiz(true)
  }

  const answerQuiz = (answer) => {
    if (answered !== null) return
    const correct = answer === quizSign.name
    setAnswered(answer); setQuizResult(correct ? 'correct' : 'wrong')
    const newStreak = correct ? streak + 1 : 0
    setStreak(newStreak)
    if (newStreak > bestStreak) setBestStreak(newStreak)
    setScore(prev => ({ correct: prev.correct + (correct ? 1 : 0), total: prev.total + 1 }))
    if (correct) markPracticed(quizSign.id)
  }

  const pct = signs.length > 0 ? Math.round((practiced.length / signs.length) * 100) : 0

  // Theme
  const text      = dark ? '#f1f5f9' : '#0a1628'
  const textMuted = dark ? '#64748b' : '#94a3b8'
  const cardBg    = dark ? '#0d1035' : '#ffffff'
  const border    = dark ? '#1e2448' : '#e8edf2'
  const subBg     = dark ? '#111442' : '#f8fafc'
  const divider   = dark ? '#1e2448' : '#f0f4f8'
  const inputBg   = dark ? '#111442' : '#ffffff'
  const accent    = '#6366f1'
  const labelCol  = dark ? '#94a3b8' : '#334155'

  return (
    <div style={{ fontFamily: "'DM Sans','Segoe UI',system-ui,sans-serif", color: text }}>

      {/* ── Header ─────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: text, letterSpacing: '-.5px', marginBottom: '4px' }}>Learn Sign Language</h1>
          <p style={{ color: textMuted, fontSize: '13px' }}>Practice {signs.length} signs · {practiced.length} completed · {pct}% done</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          {score.total > 0 && (
            <div style={{ display: 'flex', gap: '12px', padding: '7px 14px', background: cardBg, border: `1px solid ${border}`, borderRadius: '10px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#10b981' }}>{score.correct}/{score.total}</div>
                <div style={{ fontSize: '10px', color: textMuted }}>Score</div>
              </div>
              <div style={{ width: '1px', background: divider }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#f59e0b' }}>🔥 {streak}</div>
                <div style={{ fontSize: '10px', color: textMuted }}>Streak</div>
              </div>
              <div style={{ width: '1px', background: divider }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '14px', fontWeight: 800, color: accent }}>{bestStreak}</div>
                <div style={{ fontSize: '10px', color: textMuted }}>Best</div>
              </div>
            </div>
          )}
          <button onClick={startQuiz} style={{
            padding: '8px 18px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
            border: 'none', borderRadius: '10px', color: 'white',
            cursor: 'pointer', fontWeight: 700, fontSize: '13px',
            boxShadow: '0 4px 14px rgba(99,102,241,.4)', transition: 'all .15s',
          }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 6px 20px rgba(99,102,241,.55)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 14px rgba(99,102,241,.4)'}
          >🧠 Take Quiz</button>
        </div>
      </div>

      {/* ── Progress ───────────────────────────────────────────── */}
      <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: '14px', padding: '16px 18px', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '16px', transition: 'background .4s' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: labelCol }}>Learning Progress</span>
            <span style={{ fontSize: '13px', fontWeight: 700, color: accent }}>{practiced.length}/{signs.length} signs</span>
          </div>
          <div style={{ height: '8px', background: dark ? '#1e2448' : '#f0f4f8', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: '4px', width: `${pct}%`, background: pct === 100 ? '#10b981' : 'linear-gradient(90deg,#6366f1,#8b5cf6)', transition: 'width .5s ease' }} />
          </div>
        </div>
        <div style={{ padding: '8px 14px', borderRadius: '10px', background: pct === 100 ? 'rgba(16,185,129,.1)' : 'rgba(99,102,241,.1)', border: `1px solid ${pct === 100 ? 'rgba(16,185,129,.25)' : 'rgba(99,102,241,.25)'}`, fontSize: '20px', fontWeight: 900, color: pct === 100 ? '#10b981' : accent }}>
          {pct}%
        </div>
      </div>

      {/* ── Filters ────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '18px', flexWrap: 'wrap', alignItems: 'center' }}>
        <input type="text" placeholder="Search signs..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ padding: '9px 14px', minWidth: '160px', background: inputBg, border: `1.5px solid ${border}`, borderRadius: '10px', color: text, fontSize: '13px', outline: 'none', fontFamily: "'DM Sans','Segoe UI',system-ui", transition: 'border-color .2s' }}
          onFocus={e => e.target.style.borderColor = accent}
          onBlur={e => e.target.style.borderColor = border}
        />
        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)} style={{
              padding: '7px 12px',
              background: activeCategory === cat ? 'rgba(99,102,241,.1)' : (dark ? 'rgba(255,255,255,.04)' : cardBg),
              border: `1.5px solid ${activeCategory === cat ? accent : border}`,
              borderRadius: '8px', color: activeCategory === cat ? accent : textMuted,
              cursor: 'pointer', fontSize: '12px', fontWeight: 600, transition: 'all .15s',
            }}>{cat}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
          {difficulties.map(diff => (
            <button key={diff} onClick={() => setActiveDiff(diff)} style={{
              padding: '7px 12px',
              background: activeDiff === diff ? `${diffColor[diff] || accent}15` : (dark ? 'rgba(255,255,255,.04)' : cardBg),
              border: `1.5px solid ${activeDiff === diff ? diffColor[diff] || accent : border}`,
              borderRadius: '8px', color: activeDiff === diff ? diffColor[diff] || accent : textMuted,
              cursor: 'pointer', fontSize: '12px', fontWeight: 600, transition: 'all .15s',
            }}>{diff}</button>
          ))}
        </div>
      </div>

      {/* ── Grid + Detail ─────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 300px' : '1fr', gap: '18px' }}>

        {/* Signs grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px', alignContent: 'start' }}>
          {filtered.map(sign => (
            <div key={sign.id} onClick={() => setSelected(selected?.id === sign.id ? null : sign)} style={{
              padding: '18px 12px', textAlign: 'center',
              background: selected?.id === sign.id ? 'rgba(99,102,241,.1)' : cardBg,
              border: `1.5px solid ${selected?.id === sign.id ? accent : practiced.includes(sign.id) ? 'rgba(16,185,129,.4)' : border}`,
              borderRadius: '14px', cursor: 'pointer', transition: 'all .15s', position: 'relative',
            }}
              onMouseEnter={e => { if (selected?.id !== sign.id) { e.currentTarget.style.borderColor = accent; e.currentTarget.style.transform = 'translateY(-2px)' } }}
              onMouseLeave={e => { if (selected?.id !== sign.id) { e.currentTarget.style.borderColor = practiced.includes(sign.id) ? 'rgba(16,185,129,.4)' : border; e.currentTarget.style.transform = 'translateY(0)' } }}
            >
              {practiced.includes(sign.id) && (
                <div style={{ position: 'absolute', top: '7px', right: '7px', width: '17px', height: '17px', borderRadius: '50%', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', color: 'white', fontWeight: 800 }}>✓</div>
              )}
              <div style={{ position: 'absolute', top: '7px', left: '7px', width: '6px', height: '6px', borderRadius: '50%', background: catColor[sign.category] || textMuted }} />
              <div style={{ fontSize: '34px', marginBottom: '8px' }}>{sign.sign}</div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: text, marginBottom: '5px' }}>{sign.name}</div>
              <div style={{ display: 'inline-block', padding: '2px 9px', background: `${diffColor[sign.difficulty]}15`, border: `1px solid ${diffColor[sign.difficulty]}30`, borderRadius: '20px', fontSize: '10px', fontWeight: 600, color: diffColor[sign.difficulty] }}>{sign.difficulty}</div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '48px', color: textMuted, fontSize: '14px' }}>
              No signs found matching your filters
            </div>
          )}
        </div>

        {/* Detail panel */}
        {selected && (
          <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: '16px', padding: '20px', height: 'fit-content', position: 'sticky', top: '0', transition: 'background .4s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: textMuted, letterSpacing: '1px' }}>SIGN DETAILS</div>
              <button onClick={() => setSelected(null)} style={{ background: subBg, border: `1px solid ${border}`, width: '28px', height: '28px', borderRadius: '50%', cursor: 'pointer', color: textMuted, fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '18px' }}>
              <div style={{ fontSize: '68px', marginBottom: '10px' }}>{selected.sign}</div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: text, marginBottom: '8px' }}>{selected.name}</h2>
              <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, background: `${diffColor[selected.difficulty]}12`, color: diffColor[selected.difficulty], border: `1px solid ${diffColor[selected.difficulty]}30` }}>{selected.difficulty}</span>
                <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, background: `${catColor[selected.category] || '#94a3b8'}12`, color: catColor[selected.category] || textMuted, border: `1px solid ${catColor[selected.category] || '#94a3b8'}30` }}>{selected.category}</span>
              </div>
            </div>

            <div style={{ padding: '14px', background: subBg, border: `1px solid ${divider}`, borderRadius: '12px', marginBottom: '14px' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, color: textMuted, letterSpacing: '1px', marginBottom: '7px' }}>HOW TO SIGN</div>
              <p style={{ fontSize: '13px', color: labelCol, lineHeight: 1.7 }}>{selected.description}</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button onClick={() => markPracticed(selected.id)} style={{
                width: '100%', padding: '11px',
                background: practiced.includes(selected.id) ? 'rgba(16,185,129,.1)' : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                border: practiced.includes(selected.id) ? '1.5px solid rgba(16,185,129,.3)' : 'none',
                borderRadius: '10px', color: practiced.includes(selected.id) ? '#10b981' : 'white',
                cursor: 'pointer', fontWeight: 700, fontSize: '13px', transition: 'all .15s',
                boxShadow: practiced.includes(selected.id) ? 'none' : '0 4px 14px rgba(99,102,241,.35)',
              }}>
                {practiced.includes(selected.id) ? '✓ Practiced!' : 'Mark as Practiced'}
              </button>
              <button onClick={startQuiz} style={{
                width: '100%', padding: '11px',
                background: dark ? 'rgba(255,255,255,.04)' : subBg,
                border: `1.5px solid ${border}`, borderRadius: '10px', color: labelCol,
                cursor: 'pointer', fontWeight: 600, fontSize: '13px', transition: 'all .15s',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = accent; e.currentTarget.style.color = accent }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = border; e.currentTarget.style.color = labelCol }}
              >🧠 Test This Sign</button>
            </div>
          </div>
        )}
      </div>

      {/* ── QUIZ MODAL ─────────────────────────────────────────── */}
      {showQuiz && quizSign && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(6,9,26,.88)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: dark ? '#0d1035' : '#ffffff', border: `1px solid ${border}`, borderRadius: '24px', padding: '32px', maxWidth: '440px', width: '100%', textAlign: 'center', position: 'relative', boxShadow: '0 24px 80px rgba(0,0,0,.4)' }}>

            <button onClick={() => setShowQuiz(false)} style={{ position: 'absolute', top: '14px', right: '14px', background: subBg, border: `1px solid ${border}`, width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer', color: textMuted, fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>

            {/* Score row */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '20px' }}>
              {[
                { value: `${score.correct}/${score.total}`, label: 'Score',  color: '#10b981' },
                { value: `🔥 ${streak}`,                   label: 'Streak', color: '#f59e0b' },
                { value: bestStreak,                        label: 'Best',   color: accent    },
              ].map((s, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: '10px', color: textMuted }}>{s.label}</div>
                </div>
              ))}
            </div>

            <div style={{ fontSize: '11px', fontWeight: 700, color: textMuted, letterSpacing: '1.5px', marginBottom: '14px' }}>
              {quizMode === 'emoji' ? 'WHAT SIGN IS THIS?' : 'WHICH EMOJI SHOWS THIS SIGN?'}
            </div>

            {quizMode === 'emoji' ? (
              <div style={{ fontSize: '80px', marginBottom: '24px', lineHeight: 1, animation: 'popIn .3s ease' }}>{quizSign.sign}</div>
            ) : (
              <div style={{ fontSize: '24px', fontWeight: 900, color: text, marginBottom: '24px', padding: '16px', background: subBg, borderRadius: '14px', border: `1px solid ${border}` }}>{quizSign.name}</div>
            )}

            {quizResult ? (
              <div>
                <div style={{ padding: '14px', borderRadius: '14px', marginBottom: '18px', background: quizResult === 'correct' ? 'rgba(16,185,129,.1)' : 'rgba(239,68,68,.1)', border: `1px solid ${quizResult === 'correct' ? 'rgba(16,185,129,.25)' : 'rgba(239,68,68,.25)'}` }}>
                  <div style={{ fontSize: '22px', fontWeight: 800, marginBottom: '5px', color: quizResult === 'correct' ? '#10b981' : '#ef4444' }}>
                    {quizResult === 'correct' ? '✓ Correct!' : '✗ Wrong!'}
                  </div>
                  {quizResult === 'wrong' && (
                    <div style={{ fontSize: '13px', color: textMuted }}>
                      Correct: <strong style={{ color: text }}>{quizSign.name} {quizSign.sign}</strong>
                    </div>
                  )}
                  {quizResult === 'correct' && streak > 1 && (
                    <div style={{ fontSize: '13px', color: '#10b981', marginTop: '4px' }}>🔥 {streak} in a row! Keep going!</div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                  <button onClick={startQuiz} style={{ padding: '10px 24px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', border: 'none', borderRadius: '10px', color: 'white', cursor: 'pointer', fontWeight: 700, fontSize: '13px', boxShadow: '0 4px 14px rgba(99,102,241,.4)' }}>Next →</button>
                  <button onClick={() => setShowQuiz(false)} style={{ padding: '10px 24px', background: dark ? 'rgba(255,255,255,.05)' : subBg, border: `1.5px solid ${border}`, borderRadius: '10px', color: textMuted, cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}>End Quiz</button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {quizOptions.map((opt, i) => (
                  <button key={i} onClick={() => answerQuiz(opt.name)} style={{
                    padding: '12px 8px',
                    background: dark ? 'rgba(255,255,255,.05)' : subBg,
                    border: `1.5px solid ${border}`, borderRadius: '12px', color: text,
                    cursor: 'pointer', fontWeight: 600, fontSize: '13px', transition: 'all .15s',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,.1)'; e.currentTarget.style.borderColor = accent; e.currentTarget.style.color = accent }}
                    onMouseLeave={e => { e.currentTarget.style.background = dark ? 'rgba(255,255,255,.05)' : subBg; e.currentTarget.style.borderColor = border; e.currentTarget.style.color = text }}
                  >
                    {quizMode === 'name' && <span style={{ fontSize: '26px' }}>{opt.sign}</span>}
                    <span>{opt.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes popIn { 0%{transform:scale(.8);opacity:0} 100%{transform:scale(1);opacity:1} }
        * { box-sizing:border-box; }
        input::placeholder { color:#64748b; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-thumb { background:${dark ? '#1e2448' : '#e2e8f0'}; border-radius:2px; }
      `}</style>
    </div>
  )
}