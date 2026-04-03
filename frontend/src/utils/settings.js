const DEFAULTS = {
  voiceOutput:         true,
  voiceSpeed:          1,
  voicePitch:          1,
  voiceGender:         'female',
  confidenceThreshold: 75,
  detectionSpeed:      150,
  showConfidence:      true,
  autoSaveHistory:     true,
  language:            'en',
  notifications:       true,
}

export function getSettings() {
  try {
    const saved = localStorage.getItem('signova_settings')
    return saved ? { ...DEFAULTS, ...JSON.parse(saved) } : DEFAULTS
  } catch {
    return DEFAULTS
  }
}

export function speakText(text) {
  if (!text) return
  const s = getSettings()
  if (!s.voiceOutput) return

  // Cancel any ongoing speech
  window.speechSynthesis.cancel()

  const utterance    = new SpeechSynthesisUtterance(text)
  utterance.rate     = parseFloat(s.voiceSpeed)  || 1
  utterance.pitch    = parseFloat(s.voicePitch)  || 1
  utterance.volume   = 1
  utterance.lang     = s.language === 'hi' ? 'hi-IN'
                     : s.language === 'es' ? 'es-ES'
                     : s.language === 'fr' ? 'fr-FR'
                     : 'en-US'

  const trySpeak = () => {
    const voices = window.speechSynthesis.getVoices()

    if (voices.length > 0) {
      // Try to find a matching voice
      const langCode = utterance.lang.split('-')[0]
      const langVoices = voices.filter(v => v.lang.startsWith(langCode))
      const pool = langVoices.length > 0 ? langVoices : voices

      let picked = null
      if (s.voiceGender === 'female') {
        picked = pool.find(v => /zira|samantha|victoria|karen|moira|tessa|female|woman/i.test(v.name))
      } else {
        picked = pool.find(v => /david|mark|daniel|james|male|man/i.test(v.name))
      }
      // Fallback to first available
      if (!picked) picked = pool[0]
      if (picked)  utterance.voice = picked
    }

    window.speechSynthesis.speak(utterance)
  }

  // Voices load asynchronously — wait if not ready
  if (window.speechSynthesis.getVoices().length === 0) {
    window.speechSynthesis.addEventListener('voiceschanged', trySpeak, { once: true })
    // Fallback: speak without specific voice after 300ms
    setTimeout(() => {
      if (!utterance.voice) window.speechSynthesis.speak(utterance)
    }, 300)
  } else {
    trySpeak()
  }
}