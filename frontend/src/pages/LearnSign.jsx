import { useState, useEffect, useRef } from 'react'
import { useOutletContext } from 'react-router-dom'

const signs = [
  // ── COMMON ──────────────────────────────────────────────────
  {
    id: 1, name: 'I Love You', category: 'Common', difficulty: 'Easy', handShape: '🤟', color: '#6366f1',
    howTo: 'Extend your thumb, index finger, and pinky. Keep middle and ring fingers curled down into your palm.',
    tips: 'The three fingers represent I, L, and Y combined — a shorthand for the full phrase!',
    funFact: 'This combines ASL letters I, L, and Y into one beautiful sign.',
    steps: ['Make a fist', 'Extend thumb outward', 'Extend index finger up', 'Extend pinky out', 'Keep middle & ring down'],
  },
  {
    id: 2, name: 'Stop', category: 'Common', difficulty: 'Easy', handShape: '🛑', color: '#ef4444',
    howTo: 'Hold your flat hand up with all fingers together, palm facing outward away from you.',
    tips: 'Keep fingers pressed tightly together. Sharp, deliberate motion.',
    funFact: 'This universal gesture is recognized across many cultures worldwide!',
    steps: ['Open hand flat', 'Press all fingers together', 'Raise to shoulder height', 'Palm faces outward', 'Hold firmly'],
  },
  {
    id: 3, name: 'Good', category: 'Common', difficulty: 'Easy', handShape: '👍', color: '#10b981',
    howTo: 'Make a fist and extend only your thumb upward toward the sky.',
    tips: 'Thumb points straight up. Other fingers stay tightly curled.',
    funFact: 'The thumbs-up has ancient Roman origins but fits perfectly as an ASL sign.',
    steps: ['Make a tight fist', 'Extend thumb upward', 'Keep other fingers curled', 'Hold confidently'],
  },
  {
    id: 4, name: 'Bad', category: 'Common', difficulty: 'Easy', handShape: '👎', color: '#f59e0b',
    howTo: 'Make a fist and point your thumb downward toward the ground.',
    tips: 'Opposite of Good — same handshape but flipped down.',
    funFact: 'Many ASL signs use opposite orientations to show contrasting meanings!',
    steps: ['Make a tight fist', 'Extend thumb downward', 'Keep other fingers curled', 'Point clearly down'],
  },
  {
    id: 5, name: 'Yes', category: 'Common', difficulty: 'Easy', handShape: '✊', color: '#10b981',
    howTo: 'Make a firm fist and nod it up and down, like your hand is nodding "yes".',
    tips: 'Mirrors a natural head nod. Keep the wrist movement fluid.',
    funFact: 'This sign mimics the natural head-nodding gesture, making it very intuitive!',
    steps: ['Make a firm fist', 'Hold at chest level', 'Nod fist up and down', 'Pair with a head nod'],
  },
  {
    id: 6, name: 'No', category: 'Common', difficulty: 'Easy', handShape: '🤚', color: '#ef4444',
    howTo: 'Extend your index and middle fingers, then quickly tap them to your thumb twice.',
    tips: 'The tapping looks like a beak snapping shut. Quick and sharp!',
    funFact: 'This handshape mimics a mouth saying "no" — fingers open and close like lips.',
    steps: ['Extend index & middle fingers', 'Extend thumb out', 'Snap fingers to thumb', 'Repeat twice quickly'],
  },
  {
    id: 7, name: 'Please', category: 'Polite', difficulty: 'Easy', handShape: '🫶', color: '#8b5cf6',
    howTo: 'Place your flat dominant hand on your chest and move it in a slow clockwise circle.',
    tips: 'Circular motion on chest is the key — keep it smooth and slow.',
    funFact: 'Teaching children this sign first is popular because it builds polite habits early.',
    steps: ['Flatten your hand', 'Place on chest', 'Move in slow clockwise circles', 'Keep motion smooth'],
  },
  {
    id: 8, name: 'Thank You', category: 'Polite', difficulty: 'Easy', handShape: '🙏', color: '#10b981',
    howTo: 'Touch your fingertips to your chin with a flat hand, then move your hand forward and down.',
    tips: 'Like blowing a kiss from your chin outward toward the person.',
    funFact: 'This sign is often one of the first learned because it is so universally useful!',
    steps: ['Flat hand, fingertips at chin', 'Move hand forward', 'Move hand slightly down', 'Smile while signing'],
  },
  {
    id: 9, name: 'Sorry', category: 'Polite', difficulty: 'Easy', handShape: '✋', color: '#8b5cf6',
    howTo: 'Make a fist and rub it in a circular motion on your chest.',
    tips: 'The circular motion on the chest represents heartfelt apology.',
    funFact: 'This sign visually represents rubbing guilt away from your heart!',
    steps: ['Make a fist', 'Place on chest', 'Rub in circles', 'Keep motion gentle'],
  },
  {
    id: 10, name: 'Excuse Me', category: 'Polite', difficulty: 'Medium', handShape: '🙌', color: '#06b6d4',
    howTo: 'Hold non-dominant hand flat, palm up. Brush dominant flat fingers across the palm 2-3 times.',
    tips: 'The brushing motion goes from heel of palm toward fingertips.',
    funFact: 'Similar to "sorry" but the brushing motion distinguishes it as asking for passage.',
    steps: ['Non-dominant hand flat, palm up', 'Dominant hand flat', 'Brush across palm 2-3 times', 'Motion toward fingertips'],
  },
  // ── EMERGENCY ───────────────────────────────────────────────
  {
    id: 11, name: 'Help', category: 'Emergency', difficulty: 'Easy', handShape: '🆘', color: '#ef4444',
    howTo: 'Place your dominant fist with thumb up onto your non-dominant flat palm, then lift both hands upward.',
    tips: 'The lifting motion represents being aided. More urgency = sharper upward motion.',
    funFact: 'This sign visually shows one hand helping lift the other — a beautiful metaphor!',
    steps: ['Make thumbs-up fist', 'Rest on flat non-dominant palm', 'Lift both hands upward', 'Add urgency with expression'],
  },
  {
    id: 12, name: 'Call Ambulance', category: 'Emergency', difficulty: 'Medium', handShape: '🚨', color: '#ef4444',
    howTo: 'Point index finger up as emergency signal, then bring hand to ear mimicking a phone call.',
    tips: 'Two-part sign: point up for emergency, then phone gesture for calling.',
    funFact: 'Emergency signs in ASL often combine a distress signal with the specific action needed.',
    steps: ['Point index finger upward', 'Make Y handshape (phone)', 'Bring to ear', 'Mouth "ambulance"'],
  },
  {
    id: 13, name: 'Call Police', category: 'Emergency', difficulty: 'Medium', handShape: '🚔', color: '#3b82f6',
    howTo: 'Point index finger up, then tap C handshape twice on your chest where a badge would be.',
    tips: 'The badge tap is the key identifier. Form a C shape and tap firmly.',
    funFact: 'The badge gesture is iconic — C stands for "cop" in some interpretations.',
    steps: ['Point index finger up', 'Form C handshape', 'Tap chest twice', 'Where a badge would sit'],
  },
  {
    id: 14, name: 'I Need Doctor', category: 'Emergency', difficulty: 'Medium', handShape: '🏥', color: '#8b5cf6',
    howTo: 'Point to yourself first, then tap index and middle fingers on your inner wrist (pulse point).',
    tips: 'The wrist tap mimics checking a pulse — a universal medical gesture.',
    funFact: 'The pulse-point gesture for doctor/medical is used in many sign languages worldwide!',
    steps: ['Point to yourself (I)', 'Extend index & middle fingers', 'Tap inner wrist twice', 'At the pulse point'],
  },
  {
    id: 15, name: 'Fire', category: 'Emergency', difficulty: 'Easy', handShape: '🔥', color: '#ef4444',
    howTo: 'Hold both hands up with fingers spread and wiggle them upward like rising flames.',
    tips: 'Wiggling fingers moving upward mimics the movement of fire.',
    funFact: 'One of the most visually descriptive signs — it literally looks like fire!',
    steps: ['Both hands up', 'Fingers spread wide', 'Wiggle fingers rapidly', 'Move hands upward like flames'],
  },
  {
    id: 16, name: 'Danger', category: 'Emergency', difficulty: 'Medium', handShape: '⚠️', color: '#f59e0b',
    howTo: 'Make an A handshape with thumb up, brush it upward across the back of your non-dominant hand twice.',
    tips: 'The brushing motion creates a sense of urgency and warning.',
    funFact: 'This sign can be made with varying intensity to show the level of danger.',
    steps: ['Non-dominant hand flat', 'Make A shape with dominant hand', 'Brush thumb up across back of hand', 'Repeat twice'],
  },
  {
    id: 17, name: 'Pain', category: 'Emergency', difficulty: 'Easy', handShape: '😣', color: '#ef4444',
    howTo: 'Point both index fingers toward each other and twist them back and forth near the area of pain.',
    tips: 'Point near the body part that hurts to specify where the pain is.',
    funFact: 'The twisting motion represents sharp or throbbing pain visually!',
    steps: ['Extend both index fingers', 'Point them toward each other', 'Twist back and forth', 'Near the painful area'],
  },
  // ── EMOTIONS ────────────────────────────────────────────────
  {
    id: 18, name: 'Happy', category: 'Emotions', difficulty: 'Easy', handShape: '😊', color: '#f59e0b',
    howTo: 'Place your flat hand on your chest and brush it upward in a circular motion twice.',
    tips: 'Think of happiness bubbling up from your heart — that is the movement!',
    funFact: 'Joy and happiness share similar signs — the upward motion symbolizes lifted spirits.',
    steps: ['Flat hand on chest', 'Brush upward in arc', 'Repeat circular motion', 'Add a smile!'],
  },
  {
    id: 19, name: 'Sad', category: 'Emotions', difficulty: 'Easy', handShape: '😢', color: '#6366f1',
    howTo: 'Hold both open hands in front of your face and move them downward slowly.',
    tips: 'The downward motion mimics tears falling or the feeling of drooping sadness.',
    funFact: 'The motion perfectly mimics the visual of sadness — everything droops down.',
    steps: ['Both hands open, near face', 'Fingers spread apart', 'Move both hands slowly downward', 'Make a sad expression'],
  },
  {
    id: 20, name: 'Angry', category: 'Emotions', difficulty: 'Easy', handShape: '😡', color: '#ef4444',
    howTo: 'Hold curved fingers in front of your face and pull them downward with tension.',
    tips: 'Tense your fingers and pull sharply — the tension in your hands shows anger.',
    funFact: 'Facial expression is very important in ASL — for angry, look angry too!',
    steps: ['Curved fingers near face', 'Tense all fingers', 'Pull hands down sharply', 'Show angry expression'],
  },
  {
    id: 21, name: 'Scared', category: 'Emotions', difficulty: 'Easy', handShape: '😱', color: '#8b5cf6',
    howTo: 'Hold both flat hands in front of your chest and quickly bring them toward each other.',
    tips: 'The sudden inward motion mimics the startled reflex of being scared.',
    funFact: 'This sign can also mean surprise — context and facial expression differentiate them.',
    steps: ['Both flat hands at sides', 'Palms facing chest', 'Quickly bring hands inward', 'Make a startled face'],
  },
  {
    id: 22, name: 'Excited', category: 'Emotions', difficulty: 'Medium', handShape: '🤩', color: '#f59e0b',
    howTo: 'Alternate brushing your middle fingers upward on your chest in an outward circular motion.',
    tips: 'The alternating motion and upward energy conveys excitement bubbling up.',
    funFact: 'This sign shares roots with "enthusiastic" — both show energy moving upward.',
    steps: ['Both hands on chest', 'Middle fingers extended', 'Alternate brushing upward', 'Keep motion energetic'],
  },
  {
    id: 23, name: 'Love', category: 'Emotions', difficulty: 'Easy', handShape: '❤️', color: '#ef4444',
    howTo: 'Cross both arms over your chest like you are hugging yourself.',
    tips: 'This is different from "I Love You" — this is the verb love, like hugging your heart.',
    funFact: 'The self-hug motion universally represents love and affection across cultures.',
    steps: ['Cross arms at wrists', 'Place on chest', 'Hands make fists', 'Like hugging yourself'],
  },
  {
    id: 24, name: 'Tired', category: 'Emotions', difficulty: 'Easy', handShape: '😴', color: '#94a3b8',
    howTo: 'Hold bent hands against your chest with fingertips touching, then rotate them downward and outward.',
    tips: 'The drooping rotation mimics tired shoulders and sagging posture.',
    funFact: 'This sign looks exactly like someone slumping with exhaustion — very visual!',
    steps: ['Fingertips on chest', 'Hands bent at wrist', 'Rotate downward', 'Let shoulders droop naturally'],
  },
  {
    id: 25, name: 'Bored', category: 'Emotions', difficulty: 'Easy', handShape: '😑', color: '#94a3b8',
    howTo: 'Place your index finger on the side of your nose and twist it slightly outward.',
    tips: 'The nose twist is subtle but distinct — combine it with a blank expression.',
    funFact: 'The nose gesture in ASL often relates to social or emotional states — quite unique!',
    steps: ['Index finger to side of nose', 'Twist finger slightly outward', 'Look bored naturally', 'Keep motion small'],
  },
  // ── FOOD & DRINK ────────────────────────────────────────────
  {
    id: 26, name: 'Eat', category: 'Food', difficulty: 'Easy', handShape: '🍽️', color: '#10b981',
    howTo: 'Bring your dominant hand to your mouth repeatedly, fingers bunched together as if holding food.',
    tips: 'Mimic the action of putting food in your mouth — very natural motion.',
    funFact: 'This sign is highly intuitive — it literally looks like eating!',
    steps: ['Bunch all fingers together', 'Bring to mouth', 'Repeat motion', 'Like picking up and eating food'],
  },
  {
    id: 27, name: 'Drink', category: 'Food', difficulty: 'Easy', handShape: '🥤', color: '#06b6d4',
    howTo: 'Make a C shape with your hand (like holding a cup) and tilt it toward your mouth.',
    tips: 'The C handshape mimics holding a glass or cup. Tilt it like you are drinking.',
    funFact: 'One of the most common signs learned early because it is so immediately useful!',
    steps: ['Form C handshape', 'Hold at chin level', 'Tilt toward mouth', 'Like drinking from a cup'],
  },
  {
    id: 28, name: 'Water', category: 'Food', difficulty: 'Easy', handShape: '💧', color: '#06b6d4',
    howTo: 'Form a W handshape (3 fingers up) and tap it to your chin twice.',
    tips: 'W for water — extend index, middle, and ring fingers and tap your chin.',
    funFact: 'The W handshape is the first letter of "water" — a common pattern in ASL.',
    steps: ['Extend index, middle, ring fingers (W)', 'Tuck thumb and pinky', 'Tap chin twice', 'Keep taps gentle'],
  },
  {
    id: 29, name: 'Food', category: 'Food', difficulty: 'Easy', handShape: '🍕', color: '#f59e0b',
    howTo: 'Bunch all your fingertips together and bring them to your mouth twice.',
    tips: 'Very similar to "eat" — the repetition is what distinguishes "food" as a noun.',
    funFact: 'The distinction between eat (verb) and food (noun) is the repetition of the motion.',
    steps: ['Bunch fingertips together', 'Bring to mouth', 'Tap lips twice', 'Shorter motion than eat'],
  },
  {
    id: 30, name: 'Milk', category: 'Food', difficulty: 'Easy', handShape: '🥛', color: '#f1f5f9',
    howTo: 'Open and close your hand in a squeezing motion, like milking a cow.',
    tips: 'The squeezing motion is the key — alternate open and closed fist.',
    funFact: 'This sign directly mimics the action of milking, making it visually memorable.',
    steps: ['Start with open hand', 'Squeeze into fist', 'Open again', 'Repeat the squeezing motion'],
  },
  {
    id: 31, name: 'More', category: 'Food', difficulty: 'Easy', handShape: '➕', color: '#6366f1',
    howTo: 'Bring your fingertips together on both hands (like an O shape) and tap them together twice.',
    tips: 'Both hands tap together at the fingertips — symmetrical and simple!',
    funFact: 'One of the most useful signs for children — often learned alongside "please" and "eat".',
    steps: ['Both hands flat O shape', 'Fingertips touching on each hand', 'Bring hands together', 'Tap fingertips twice'],
  },
  {
    id: 32, name: 'Hot', category: 'Food', difficulty: 'Easy', handShape: '🥵', color: '#ef4444',
    howTo: 'Hold a curved hand in front of your mouth, then quickly twist it downward and away.',
    tips: 'Like spitting out something hot from your mouth — the motion is very expressive.',
    funFact: 'This sign visually mimics reacting to something burning hot in your mouth!',
    steps: ['Curved hand at mouth', 'Fingers pointing toward mouth', 'Twist hand quickly downward', 'Like spitting out hot food'],
  },
  {
    id: 33, name: 'Cold', category: 'Food', difficulty: 'Easy', handShape: '🥶', color: '#06b6d4',
    howTo: 'Make two fists and bring them close to your body, shaking them as if you are shivering.',
    tips: 'The shivering motion mimics being cold — very natural and intuitive!',
    funFact: 'Physical sensation signs in ASL often mimic the body reaction to that sensation.',
    steps: ['Make two fists', 'Hold near shoulders', 'Shake fists as if shivering', 'Hunch shoulders slightly'],
  },
  // ── FAMILY ──────────────────────────────────────────────────
  {
    id: 34, name: 'Mother', category: 'Family', difficulty: 'Easy', handShape: '👩', color: '#ec4899',
    howTo: 'Spread your dominant hand with fingers extended, thumb touching your chin.',
    tips: 'The chin position represents female. Spread fingers = 5 (mother).',
    funFact: 'Female signs in ASL are typically near the chin, while male signs are near the forehead.',
    steps: ['Spread all 5 fingers', 'Thumb touches chin', 'Fingers point upward', 'Hold briefly'],
  },
  {
    id: 35, name: 'Father', category: 'Family', difficulty: 'Easy', handShape: '👨', color: '#3b82f6',
    howTo: 'Spread your dominant hand with fingers extended, thumb touching your forehead.',
    tips: 'Same handshape as Mother but at the forehead — male signs are near forehead.',
    funFact: 'Father and Mother differ only in placement — a beautiful minimal pair in ASL.',
    steps: ['Spread all 5 fingers', 'Thumb touches forehead', 'Fingers point upward', 'Hold briefly'],
  },
  {
    id: 36, name: 'Baby', category: 'Family', difficulty: 'Easy', handShape: '👶', color: '#f59e0b',
    howTo: 'Cradle your arms together and rock them gently side to side as if holding a baby.',
    tips: 'The rocking motion is gentle and rhythmic — just like soothing a real baby!',
    funFact: 'This sign is recognized across many different sign languages worldwide.',
    steps: ['Fold arms together', 'One arm cradles the other', 'Rock arms side to side', 'Gentle rocking motion'],
  },
  {
    id: 37, name: 'Brother', category: 'Family', difficulty: 'Medium', handShape: '👦', color: '#3b82f6',
    howTo: 'Grab your cap at the forehead with dominant hand (male), then bring both hands together with L shapes.',
    tips: 'Two-part sign: male indicator at forehead, then both hands form L shapes.',
    funFact: 'Sister and Brother share the same base sign, differing only in the gender indicator position.',
    steps: ['L shape at forehead (male)', 'Bring down to chest', 'Both hands make L shapes', 'Bring index fingers together'],
  },
  {
    id: 38, name: 'Sister', category: 'Family', difficulty: 'Medium', handShape: '👧', color: '#ec4899',
    howTo: 'Touch thumb to chin (female indicator), then bring both hands together with L shapes.',
    tips: 'Two-part sign: female indicator at chin, then both hands form L shapes.',
    funFact: 'The L handshape in family signs represents the shape of a person standing.',
    steps: ['A shape at chin (female)', 'Bring down to chest', 'Both hands make L shapes', 'Bring index fingers together'],
  },
  {
    id: 39, name: 'Friend', category: 'Family', difficulty: 'Easy', handShape: '🤝', color: '#10b981',
    howTo: 'Hook your dominant index finger over your non-dominant index finger, then reverse the grip.',
    tips: 'The interlocking fingers symbolize two people connected — friendship!',
    funFact: 'This sign beautifully represents the mutual bond of friendship through interlocked fingers.',
    steps: ['Extend index fingers on both hands', 'Hook dominant over non-dominant', 'Then reverse the hook', 'The connection symbolizes friendship'],
  },
  {
    id: 40, name: 'Family', category: 'Family', difficulty: 'Medium', handShape: '👨‍👩‍👧', color: '#f59e0b',
    howTo: 'Form an F handshape on both hands, then move them apart in a circle until pinky sides meet.',
    tips: 'The circular motion encompasses everyone — the whole family group.',
    funFact: 'The circle motion in ASL often represents groups or communities coming together.',
    steps: ['Both hands make F shape', 'Index fingers and thumbs touching', 'Move hands apart in arc', 'Circle until pinky sides meet'],
  },
  // ── NUMBERS ─────────────────────────────────────────────────
  {
    id: 41, name: 'One', category: 'Numbers', difficulty: 'Easy', handShape: '☝️', color: '#6366f1',
    howTo: 'Extend only your index finger upward, keeping all other fingers curled down.',
    tips: 'Most natural number sign — literally one finger up!',
    funFact: 'Number signs in ASL are essential for giving phone numbers, ages, prices, and addresses.',
    steps: ['Make a fist', 'Extend only index finger', 'Point straight up', 'Keep other fingers curled'],
  },
  {
    id: 42, name: 'Two', category: 'Numbers', difficulty: 'Easy', handShape: '✌️', color: '#6366f1',
    howTo: 'Extend your index and middle fingers upward in a V shape, keeping other fingers curled.',
    tips: 'Same as the peace sign! Keep fingers spread slightly apart.',
    funFact: 'The V sign is used globally — as peace, victory, and the number two in ASL.',
    steps: ['Make a fist', 'Extend index finger', 'Extend middle finger', 'Keep fingers in V shape'],
  },
  {
    id: 43, name: 'Three', category: 'Numbers', difficulty: 'Easy', handShape: '🤟', color: '#6366f1',
    howTo: 'Extend your thumb, index finger, and middle finger upward, keeping ring and pinky curled.',
    tips: 'Different from "I Love You" — in Three, the middle finger is up instead of the pinky.',
    funFact: 'The number 3 in ASL can be confused with other signs, so placement matters!',
    steps: ['Extend thumb outward', 'Extend index finger up', 'Extend middle finger up', 'Keep ring & pinky curled'],
  },
  {
    id: 44, name: 'Four', category: 'Numbers', difficulty: 'Easy', handShape: '🖖', color: '#6366f1',
    howTo: 'Extend your index, middle, ring, and pinky fingers upward, keeping only your thumb curled.',
    tips: 'All four fingers up, thumb tucked in. Simple and clean.',
    funFact: 'Numbers 1 through 5 in ASL are essential survival vocabulary for everyday life.',
    steps: ['Tuck thumb into palm', 'Extend all four fingers', 'Keep fingers together', 'Point upward'],
  },
  {
    id: 45, name: 'Five', category: 'Numbers', difficulty: 'Easy', handShape: '🖐️', color: '#6366f1',
    howTo: 'Spread all five fingers wide open with palm facing outward.',
    tips: 'Full open hand, all fingers spread — easiest number sign!',
    funFact: 'Five is identical to "stop" in some contexts — facial expression differentiates them.',
    steps: ['Open hand completely', 'Spread all 5 fingers wide', 'Palm faces outward', 'Hold clearly'],
  },
  // ── ACTIONS ─────────────────────────────────────────────────
  {
    id: 46, name: 'Come', category: 'Actions', difficulty: 'Easy', handShape: '👋', color: '#10b981',
    howTo: 'Extend both index fingers pointing forward, then curl them back toward yourself twice.',
    tips: 'The beckoning motion is very natural — like calling someone to come to you.',
    funFact: 'This sign uses a universal beckoning gesture recognized across many cultures.',
    steps: ['Extend index fingers forward', 'Point away from body', 'Curl fingers toward yourself', 'Repeat twice'],
  },
  {
    id: 47, name: 'Go', category: 'Actions', difficulty: 'Easy', handShape: '👉', color: '#f59e0b',
    howTo: 'Extend both index fingers pointing up, then arc them forward and down, pointing in the direction of go.',
    tips: 'The arcing motion in the direction of travel indicates movement away.',
    funFact: 'Come and Go are opposites — both use index fingers but in opposite directions.',
    steps: ['Both index fingers pointing up', 'Arc hands forward', 'End with fingers pointing ahead', 'Can point in specific direction'],
  },
  {
    id: 48, name: 'Wait', category: 'Actions', difficulty: 'Easy', handShape: '✋', color: '#94a3b8',
    howTo: 'Hold both spread hands in front of you, palms up, and wiggle your fingers slowly.',
    tips: 'The upward wiggling fingers suggest suspension and holding on.',
    funFact: 'This sign captures the feeling of being in a holding pattern — very expressive!',
    steps: ['Both hands open, palms up', 'Fingers spread', 'Wiggle fingers slowly', 'Hold at waist level'],
  },
  {
    id: 49, name: 'Sit', category: 'Actions', difficulty: 'Easy', handShape: '🪑', color: '#8b5cf6',
    howTo: 'Hold your dominant hand in a U shape (2 fingers) and rest it on your non-dominant fingers.',
    tips: 'The two fingers represent legs sitting down on a seat.',
    funFact: 'This sign literally shows legs sitting down — one of the most visual signs in ASL!',
    steps: ['Extend index & middle fingers on dominant hand', 'Other fingers curled', 'Rest on non-dominant curved fingers', 'Like legs dangling from a seat'],
  },
  {
    id: 50, name: 'Stand', category: 'Actions', difficulty: 'Easy', handShape: '🧍', color: '#06b6d4',
    howTo: 'Hold non-dominant hand flat palm-up, then place two fingers of dominant hand standing upright on it.',
    tips: 'The two fingers represent legs — they are standing up on the flat palm.',
    funFact: 'Sit and Stand are a classic pair — both use two fingers as legs in different positions.',
    steps: ['Non-dominant hand flat, palm up', 'Dominant hand: extend 2 fingers', 'Place fingers upright on palm', 'Fingers represent standing legs'],
  },
]

const categories   = ['All', 'Common', 'Polite', 'Emergency', 'Emotions', 'Food', 'Family', 'Numbers', 'Actions']
const difficulties = ['All', 'Easy', 'Medium', 'Hard']
const diffColor    = { Easy: '#10b981', Medium: '#f59e0b', Hard: '#ef4444' }
const catColor     = { Common: '#6366f1', Polite: '#8b5cf6', Emergency: '#ef4444', Emotions: '#f59e0b', Food: '#10b981', Family: '#ec4899', Numbers: '#6366f1', Actions: '#06b6d4' }

const QUIZ_MODES = [
  { id: 'name',  label: '📝 Name the Sign',  desc: 'Read the description, guess the name'  },
  { id: 'steps', label: '👣 Match the Steps', desc: 'Read the steps, pick the correct sign' },
  { id: 'tips',  label: '💡 Tip Challenge',   desc: 'Read the tip, identify the sign'       },
]

export default function LearnSign() {
  const ctx  = useOutletContext?.() || {}
  const dark = ctx.dark ?? (localStorage.getItem('signova_theme') !== 'light')

  const [search,         setSearch]         = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [activeDiff,     setActiveDiff]     = useState('All')
  const [flipped,        setFlipped]        = useState({})
  const [practiced,      setPracticed]      = useState(() => {
    try { return JSON.parse(localStorage.getItem('signova_practiced') || '[]') } catch { return [] }
  })
  const [selected,       setSelected]       = useState(null)
  const [activeTab,      setActiveTab]      = useState('learn')
  const [quizMode,       setQuizMode]       = useState('name')
  const [quizSign,       setQuizSign]       = useState(null)
  const [quizOptions,    setQuizOptions]    = useState([])
  const [quizResult,     setQuizResult]     = useState(null)
  const [answered,       setAnswered]       = useState(null)
  const [score,          setScore]          = useState({ correct: 0, total: 0 })
  const [streak,         setStreak]         = useState(0)
  const [bestStreak,     setBestStreak]     = useState(() => parseInt(localStorage.getItem('signova_best_streak') || '0'))
  const [quizStarted,    setQuizStarted]    = useState(false)
  const [sessionTime,    setSessionTime]    = useState(0)
  const timerRef = useRef(null)

  useEffect(() => {
    timerRef.current = setInterval(() => setSessionTime(t => t + 1), 1000)
    return () => clearInterval(timerRef.current)
  }, [])

  const savePracticed = (ids) => localStorage.setItem('signova_practiced', JSON.stringify(ids))
  const markPracticed = (id) => {
    if (!practiced.includes(id)) { const u = [...practiced, id]; setPracticed(u); savePracticed(u) }
  }
  const toggleFlip = (id) => setFlipped(prev => ({ ...prev, [id]: !prev[id] }))

  const filtered = signs.filter(s => {
    const matchCat  = activeCategory === 'All' || s.category === activeCategory
    const matchDiff = activeDiff === 'All' || s.difficulty === activeDiff
    const matchSrch = s.name.toLowerCase().includes(search.toLowerCase()) ||
                      s.howTo.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchDiff && matchSrch
  })

  const pct = Math.round((practiced.length / signs.length) * 100)
  const formatTime = (s) => `${Math.floor(s / 60)}m ${s % 60}s`

  const startQuiz = () => {
    const random  = signs[Math.floor(Math.random() * signs.length)]
    const others  = signs.filter(s => s.id !== random.id).sort(() => Math.random() - .5).slice(0, 3)
    const options = [...others, random].sort(() => Math.random() - .5)
    setQuizSign(random); setQuizOptions(options); setQuizResult(null); setAnswered(null); setQuizStarted(true)
  }

  const answerQuiz = (answer) => {
    if (answered !== null) return
    const correct = answer === quizSign.name
    setAnswered(answer); setQuizResult(correct ? 'correct' : 'wrong')
    const ns = correct ? streak + 1 : 0
    setStreak(ns)
    if (ns > bestStreak) { setBestStreak(ns); localStorage.setItem('signova_best_streak', String(ns)) }
    setScore(prev => ({ correct: prev.correct + (correct ? 1 : 0), total: prev.total + 1 }))
    if (correct) markPracticed(quizSign.id)
  }

  const resetProgress = () => { setPracticed([]); savePracticed([]); setScore({ correct: 0, total: 0 }); setStreak(0) }

  // Theme
  const text      = dark ? '#f1f5f9' : '#0a1628'
  const textMuted = dark ? '#64748b' : '#94a3b8'
  const cardBg    = dark ? '#0d1035' : '#ffffff'
  const border    = dark ? '#1e2448' : '#e8edf2'
  const subBg     = dark ? '#111442' : '#f8fafc'
  const divider   = dark ? '#1e2448' : '#f0f4f8'
  const inputBg   = dark ? '#111442' : '#ffffff'
  const accent    = '#6366f1'

  const tabs = [
    { id: 'learn',    label: '📚 Learn',    badge: `${filtered.length}` },
    { id: 'quiz',     label: '🧠 Quiz',     badge: score.total > 0 ? `${score.correct}/${score.total}` : null },
    { id: 'progress', label: '📊 Progress', badge: `${pct}%` },
  ]

  return (
    <div style={{ fontFamily: "'DM Sans','Segoe UI',system-ui,sans-serif", color: text }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: text, letterSpacing: '-.5px', marginBottom: '4px' }}>Learn Sign Language</h1>
          <p style={{ color: textMuted, fontSize: '13px' }}>{signs.length} signs · {practiced.length} mastered · Session: {formatTime(sessionTime)}</p>
        </div>
        {score.total > 0 && (
          <div style={{ display: 'flex', gap: '10px', padding: '7px 14px', background: cardBg, border: `1px solid ${border}`, borderRadius: '10px' }}>
            <div style={{ textAlign: 'center' }}><div style={{ fontSize: '14px', fontWeight: 800, color: '#10b981' }}>{score.correct}/{score.total}</div><div style={{ fontSize: '10px', color: textMuted }}>Score</div></div>
            <div style={{ width: '1px', background: divider }} />
            <div style={{ textAlign: 'center' }}><div style={{ fontSize: '14px', fontWeight: 800, color: '#f59e0b' }}>🔥{streak}</div><div style={{ fontSize: '10px', color: textMuted }}>Streak</div></div>
            <div style={{ width: '1px', background: divider }} />
            <div style={{ textAlign: 'center' }}><div style={{ fontSize: '14px', fontWeight: 800, color: accent }}>{bestStreak}</div><div style={{ fontSize: '10px', color: textMuted }}>Best</div></div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', padding: '4px', background: dark ? 'rgba(255,255,255,.05)' : subBg, border: `1px solid ${border}`, borderRadius: '12px', marginBottom: '20px', width: 'fit-content' }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            padding: '8px 18px', borderRadius: '9px', border: 'none', cursor: 'pointer',
            fontWeight: 700, fontSize: '13px', transition: 'all .2s',
            background: activeTab === tab.id ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'transparent',
            color: activeTab === tab.id ? 'white' : textMuted,
            display: 'flex', alignItems: 'center', gap: '6px',
          }}>
            {tab.label}
            {tab.badge && <span style={{ fontSize: '11px', padding: '1px 7px', borderRadius: '20px', background: activeTab === tab.id ? 'rgba(255,255,255,.2)' : (dark ? 'rgba(255,255,255,.08)' : '#e2e8f0'), color: activeTab === tab.id ? '#fff' : textMuted }}>{tab.badge}</span>}
          </button>
        ))}
      </div>

      {/* ══ LEARN TAB ══ */}
      {activeTab === 'learn' && (
        <div>
          {/* Filters */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <input type="text" placeholder="Search signs..." value={search} onChange={e => setSearch(e.target.value)}
                style={{ padding: '8px 12px 8px 32px', width: '170px', background: inputBg, border: `1.5px solid ${border}`, borderRadius: '10px', color: text, fontSize: '12px', outline: 'none' }}
                onFocus={e => e.target.style.borderColor = accent} onBlur={e => e.target.style.borderColor = border}
              />
              <span style={{ position: 'absolute', left: '9px', top: '50%', transform: 'translateY(-50%)', color: textMuted, fontSize: '13px' }}>🔍</span>
            </div>
            {categories.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)} style={{
                padding: '6px 10px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', borderRadius: '8px', transition: 'all .15s',
                background: activeCategory === cat ? `${catColor[cat] || accent}15` : (dark ? 'rgba(255,255,255,.04)' : cardBg),
                border: `1.5px solid ${activeCategory === cat ? catColor[cat] || accent : border}`,
                color: activeCategory === cat ? catColor[cat] || accent : textMuted,
              }}>{cat}</button>
            ))}
            {difficulties.filter(d => d !== 'All').map(diff => (
              <button key={diff} onClick={() => setActiveDiff(activeDiff === diff ? 'All' : diff)} style={{
                padding: '6px 10px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', borderRadius: '8px', transition: 'all .15s',
                background: activeDiff === diff ? `${diffColor[diff]}15` : (dark ? 'rgba(255,255,255,.04)' : cardBg),
                border: `1.5px solid ${activeDiff === diff ? diffColor[diff] : border}`,
                color: activeDiff === diff ? diffColor[diff] : textMuted,
              }}>{diff}</button>
            ))}
          </div>

          {/* Category summary */}
          {activeCategory === 'All' && (
            <div style={{ display: 'flex', gap: '6px', marginBottom: '14px', flexWrap: 'wrap' }}>
              {['Common','Polite','Emergency','Emotions','Food','Family','Numbers','Actions'].map(cat => {
                const count = signs.filter(s => s.category === cat).length
                const color = catColor[cat] || accent
                return (
                  <div key={cat} onClick={() => setActiveCategory(cat)} style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', background: `${color}12`, border: `1px solid ${color}30`, color, transition: 'all .15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = `${color}25`}
                    onMouseLeave={e => e.currentTarget.style.background = `${color}12`}
                  >{cat} ({count})</div>
                )
              })}
            </div>
          )}

          {/* Grid + Detail panel */}
          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>

            {/* Cards */}
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '10px' }}>
              {filtered.map(sign => {
                const isFlipped   = flipped[sign.id]
                const isPracticed = practiced.includes(sign.id)
                const isSelected  = selected?.id === sign.id
                return (
                  <div key={sign.id} style={{ perspective: '1000px', height: '185px' }}>
                    <div style={{ position: 'relative', width: '100%', height: '100%', transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)', transition: 'transform .5s ease' }}>

                      {/* Front */}
                      <div onClick={() => toggleFlip(sign.id)} style={{
                        position: 'absolute', inset: 0, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
                        background: isSelected ? `${sign.color}15` : cardBg,
                        border: `1.5px solid ${isSelected ? sign.color : isPracticed ? '#10b98155' : border}`,
                        borderRadius: '14px', padding: '14px 10px',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', textAlign: 'center',
                      }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = sign.color }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = isSelected ? sign.color : isPracticed ? '#10b98155' : border }}
                      >
                        {isPracticed && <div style={{ position: 'absolute', top: '7px', right: '7px', width: '16px', height: '16px', borderRadius: '50%', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px', color: '#fff', fontWeight: 800 }}>✓</div>}
                        <div style={{ position: 'absolute', top: '7px', left: '7px', width: '5px', height: '5px', borderRadius: '50%', background: catColor[sign.category] || textMuted }} />
                        <div style={{ fontSize: '40px', marginBottom: '7px', lineHeight: 1 }}>{sign.handShape}</div>
                        <div style={{ fontSize: '12px', fontWeight: 800, color: text, marginBottom: '5px' }}>{sign.name}</div>
                        <span style={{ padding: '2px 8px', background: `${diffColor[sign.difficulty]}15`, border: `1px solid ${diffColor[sign.difficulty]}30`, borderRadius: '20px', fontSize: '10px', fontWeight: 600, color: diffColor[sign.difficulty], marginBottom: '7px', display: 'inline-block' }}>{sign.difficulty}</span>
                        <div style={{ fontSize: '9px', color: textMuted }}>👆 Tap to flip</div>
                      </div>

                      {/* Back */}
                      <div style={{
                        position: 'absolute', inset: 0, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)',
                        background: `${sign.color}10`, border: `1.5px solid ${sign.color}40`,
                        borderRadius: '14px', padding: '10px',
                        display: 'flex', flexDirection: 'column', gap: '5px',
                      }}>
                        <div style={{ fontSize: '9px', fontWeight: 700, color: sign.color, letterSpacing: '1px' }}>HOW TO SIGN</div>
                        <div style={{ fontSize: '10px', color: text, lineHeight: 1.6, flex: 1, overflowY: 'auto' }}>{sign.howTo}</div>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button onClick={(e) => { e.stopPropagation(); toggleFlip(sign.id) }}
                            style={{ flex: 1, padding: '5px', background: dark ? 'rgba(255,255,255,.08)' : 'rgba(255,255,255,.9)', border: `1px solid ${border}`, borderRadius: '6px', color: textMuted, cursor: 'pointer', fontSize: '9px', fontWeight: 600 }}>↩ Back</button>
                          <button onClick={(e) => { e.stopPropagation(); setSelected(selected?.id === sign.id ? null : sign); setFlipped(p => ({ ...p, [sign.id]: false })) }}
                            style={{ flex: 1, padding: '5px', background: sign.color, border: 'none', borderRadius: '6px', color: '#fff', cursor: 'pointer', fontSize: '9px', fontWeight: 700 }}>Details →</button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
              {filtered.length === 0 && (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '48px', color: textMuted }}>No signs match your filters</div>
              )}
            </div>

            {/* Detail panel */}
            {selected && (
              <div style={{ width: '290px', flexShrink: 0, background: cardBg, border: `1px solid ${border}`, borderRadius: '16px', padding: '16px', position: 'sticky', top: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: textMuted, letterSpacing: '1px' }}>SIGN DETAILS</div>
                  <button onClick={() => setSelected(null)} style={{ background: subBg, border: `1px solid ${border}`, width: '22px', height: '22px', borderRadius: '50%', cursor: 'pointer', color: textMuted, fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                </div>
                <div style={{ textAlign: 'center', padding: '12px', background: `${selected.color}10`, borderRadius: '10px', marginBottom: '10px', border: `1px solid ${selected.color}20` }}>
                  <div style={{ fontSize: '44px', marginBottom: '5px' }}>{selected.handShape}</div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: text, marginBottom: '5px' }}>{selected.name}</div>
                  <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                    <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: 700, background: `${diffColor[selected.difficulty]}15`, color: diffColor[selected.difficulty], border: `1px solid ${diffColor[selected.difficulty]}30` }}>{selected.difficulty}</span>
                    <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: 700, background: `${selected.color}15`, color: selected.color, border: `1px solid ${selected.color}30` }}>{selected.category}</span>
                  </div>
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <div style={{ fontSize: '9px', fontWeight: 700, color: textMuted, letterSpacing: '1px', marginBottom: '6px' }}>STEP BY STEP</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {selected.steps.map((step, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '5px 8px', background: subBg, borderRadius: '7px', border: `1px solid ${divider}` }}>
                        <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: selected.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px', fontWeight: 800, color: '#fff', flexShrink: 0 }}>{i + 1}</div>
                        <span style={{ fontSize: '11px', color: text }}>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ padding: '8px 10px', background: 'rgba(245,158,11,.06)', border: '1px solid rgba(245,158,11,.2)', borderRadius: '8px', marginBottom: '7px' }}>
                  <div style={{ fontSize: '9px', fontWeight: 700, color: '#f59e0b', letterSpacing: '1px', marginBottom: '3px' }}>💡 TIP</div>
                  <div style={{ fontSize: '11px', color: text, lineHeight: 1.5 }}>{selected.tips}</div>
                </div>
                <div style={{ padding: '8px 10px', background: 'rgba(99,102,241,.06)', border: '1px solid rgba(99,102,241,.2)', borderRadius: '8px', marginBottom: '10px' }}>
                  <div style={{ fontSize: '9px', fontWeight: 700, color: accent, letterSpacing: '1px', marginBottom: '3px' }}>🌟 FUN FACT</div>
                  <div style={{ fontSize: '11px', color: text, lineHeight: 1.5 }}>{selected.funFact}</div>
                </div>
                <button onClick={() => markPracticed(selected.id)} style={{
                  width: '100%', padding: '10px',
                  background: practiced.includes(selected.id) ? 'rgba(16,185,129,.1)' : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                  border: practiced.includes(selected.id) ? '1.5px solid rgba(16,185,129,.3)' : 'none',
                  borderRadius: '9px', color: practiced.includes(selected.id) ? '#10b981' : '#fff',
                  cursor: 'pointer', fontWeight: 700, fontSize: '12px',
                  boxShadow: practiced.includes(selected.id) ? 'none' : '0 4px 12px rgba(99,102,241,.35)',
                }}>
                  {practiced.includes(selected.id) ? '✓ Mastered!' : 'Mark as Mastered'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══ QUIZ TAB ══ */}
      {activeTab === 'quiz' && (
        <div style={{ maxWidth: '540px', margin: '0 auto' }}>
          {!quizStarted ? (
            <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: '20px', padding: '28px', textAlign: 'center' }}>
              <div style={{ fontSize: '44px', marginBottom: '12px' }}>🧠</div>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: text, marginBottom: '6px' }}>Sign Language Quiz</h2>
              <p style={{ color: textMuted, fontSize: '13px', marginBottom: '20px' }}>50 signs to test! Choose your quiz mode.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', marginBottom: '18px' }}>
                {QUIZ_MODES.map(m => (
                  <div key={m.id} onClick={() => setQuizMode(m.id)} style={{ padding: '11px 14px', borderRadius: '11px', cursor: 'pointer', textAlign: 'left', background: quizMode === m.id ? 'rgba(99,102,241,.1)' : subBg, border: `1.5px solid ${quizMode === m.id ? accent : border}`, display: 'flex', alignItems: 'center', gap: '10px', transition: 'all .15s' }}>
                    <span style={{ fontSize: '18px' }}>{m.label.split(' ')[0]}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: quizMode === m.id ? accent : text }}>{m.label.slice(2)}</div>
                      <div style={{ fontSize: '11px', color: textMuted }}>{m.desc}</div>
                    </div>
                    {quizMode === m.id && <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', color: '#fff' }}>✓</div>}
                  </div>
                ))}
              </div>
              <button onClick={startQuiz} style={{ padding: '12px 36px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', border: 'none', borderRadius: '12px', color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: '14px', boxShadow: '0 4px 16px rgba(99,102,241,.4)' }}>Start Quiz →</button>
            </div>
          ) : quizSign && (
            <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: '20px', padding: '22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '18px', padding: '8px 12px', background: subBg, borderRadius: '10px', border: `1px solid ${divider}` }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#10b981' }}>✓ {score.correct} correct</span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#f59e0b' }}>🔥 {streak}</span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: text }}>{score.total} answered</span>
              </div>
              <div style={{ fontSize: '10px', fontWeight: 700, color: textMuted, letterSpacing: '1.5px', marginBottom: '12px', textAlign: 'center' }}>
                {quizMode === 'name' ? 'WHAT IS THIS SIGN CALLED?' : quizMode === 'steps' ? 'WHICH SIGN DO THESE STEPS DESCRIBE?' : 'WHICH SIGN DOES THIS TIP DESCRIBE?'}
              </div>
              {quizMode === 'name' && (
                <div style={{ padding: '16px', background: `${quizSign.color}10`, border: `1px solid ${quizSign.color}25`, borderRadius: '12px', marginBottom: '16px', textAlign: 'center' }}>
                  <div style={{ fontSize: '56px', marginBottom: '8px' }}>{quizSign.handShape}</div>
                  <div style={{ fontSize: '13px', color: text, lineHeight: 1.6 }}>{quizSign.howTo}</div>
                </div>
              )}
              {quizMode === 'steps' && (
                <div style={{ padding: '14px', background: subBg, border: `1px solid ${border}`, borderRadius: '12px', marginBottom: '16px' }}>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: accent, marginBottom: '8px', letterSpacing: '1px' }}>STEPS:</div>
                  {quizSign.steps.map((step, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 0', borderBottom: i < quizSign.steps.length - 1 ? `1px solid ${divider}` : 'none' }}>
                      <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px', fontWeight: 800, color: '#fff', flexShrink: 0 }}>{i + 1}</div>
                      <span style={{ fontSize: '12px', color: text }}>{step}</span>
                    </div>
                  ))}
                </div>
              )}
              {quizMode === 'tips' && (
                <div style={{ padding: '16px', background: 'rgba(245,158,11,.06)', border: '1px solid rgba(245,158,11,.2)', borderRadius: '12px', marginBottom: '16px', textAlign: 'center' }}>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: '#f59e0b', marginBottom: '8px', letterSpacing: '1px' }}>💡 TIP:</div>
                  <div style={{ fontSize: '14px', color: text, lineHeight: 1.7, fontStyle: 'italic' }}>"{quizSign.tips}"</div>
                </div>
              )}
              {quizResult ? (
                <div>
                  <div style={{ padding: '12px', borderRadius: '12px', marginBottom: '12px', textAlign: 'center', background: quizResult === 'correct' ? 'rgba(16,185,129,.1)' : 'rgba(239,68,68,.1)', border: `1px solid ${quizResult === 'correct' ? 'rgba(16,185,129,.25)' : 'rgba(239,68,68,.25)'}` }}>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: quizResult === 'correct' ? '#10b981' : '#ef4444', marginBottom: '3px' }}>{quizResult === 'correct' ? '🎉 Correct!' : '❌ Wrong!'}</div>
                    {quizResult === 'wrong' && <div style={{ fontSize: '12px', color: text }}>Answer: <strong>{quizSign.name}</strong></div>}
                    {quizResult === 'correct' && streak > 1 && <div style={{ fontSize: '12px', color: '#10b981', marginTop: '2px' }}>🔥 {streak} in a row!</div>}
                  </div>
                  <div style={{ display: 'flex', gap: '7px' }}>
                    <button onClick={startQuiz} style={{ flex: 1, padding: '10px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', border: 'none', borderRadius: '10px', color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: '13px' }}>Next →</button>
                    <button onClick={() => { setQuizStarted(false); setScore({ correct: 0, total: 0 }); setStreak(0) }} style={{ padding: '10px 12px', background: subBg, border: `1.5px solid ${border}`, borderRadius: '10px', color: textMuted, cursor: 'pointer', fontWeight: 600, fontSize: '12px' }}>End</button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '7px' }}>
                  {quizOptions.map((opt, i) => (
                    <button key={i} onClick={() => answerQuiz(opt.name)} style={{
                      padding: '12px 8px', textAlign: 'center',
                      background: dark ? 'rgba(255,255,255,.05)' : subBg,
                      border: `1.5px solid ${border}`, borderRadius: '10px', color: text,
                      cursor: 'pointer', fontWeight: 700, fontSize: '13px', transition: 'all .15s',
                    }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,.12)'; e.currentTarget.style.borderColor = accent; e.currentTarget.style.color = accent }}
                      onMouseLeave={e => { e.currentTarget.style.background = dark ? 'rgba(255,255,255,.05)' : subBg; e.currentTarget.style.borderColor = border; e.currentTarget.style.color = text }}
                    >{opt.name}</button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ══ PROGRESS TAB ══ */}
      {activeTab === 'progress' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '720px' }}>
          <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: '16px', padding: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: text }}>Overall Mastery</div>
              <div style={{ fontSize: '24px', fontWeight: 900, color: pct === 100 ? '#10b981' : accent }}>{pct}%</div>
            </div>
            <div style={{ height: '10px', background: dark ? '#1e2448' : '#f0f4f8', borderRadius: '5px', overflow: 'hidden', marginBottom: '12px' }}>
              <div style={{ height: '100%', borderRadius: '5px', width: `${pct}%`, background: pct === 100 ? '#10b981' : 'linear-gradient(90deg,#6366f1,#8b5cf6)', transition: 'width .5s' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '7px' }}>
              {[
                { label: 'Mastered',    value: practiced.length,  color: '#10b981' },
                { label: 'Remaining',   value: signs.length - practiced.length, color: textMuted },
                { label: 'Quiz Score',  value: score.total > 0 ? `${Math.round(score.correct/score.total*100)}%` : '—', color: accent },
                { label: 'Best Streak', value: bestStreak, color: '#f59e0b' },
              ].map((s, i) => (
                <div key={i} style={{ textAlign: 'center', padding: '10px 6px', background: subBg, borderRadius: '10px', border: `1px solid ${divider}` }}>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: '10px', color: textMuted, marginTop: '2px' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: '16px', padding: '18px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: text, marginBottom: '12px' }}>By Category</div>
            {['Common','Polite','Emergency','Emotions','Food','Family','Numbers','Actions'].map(cat => {
              const catSigns     = signs.filter(s => s.category === cat)
              const catPracticed = catSigns.filter(s => practiced.includes(s.id)).length
              const catPct       = Math.round((catPracticed / catSigns.length) * 100)
              const color        = catColor[cat] || accent
              return (
                <div key={cat} style={{ marginBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: text }}>{cat}</span>
                    <span style={{ fontSize: '11px', color: textMuted }}>{catPracticed}/{catSigns.length} · {catPct}%</span>
                  </div>
                  <div style={{ height: '6px', background: dark ? '#1e2448' : '#f0f4f8', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: '3px', width: `${catPct}%`, background: color, transition: 'width .5s' }} />
                  </div>
                </div>
              )
            })}
          </div>

          <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: '16px', padding: '18px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: text, marginBottom: '12px' }}>All 50 Signs Checklist</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px,1fr))', gap: '6px' }}>
              {signs.map(sign => {
                const done = practiced.includes(sign.id)
                return (
                  <div key={sign.id} style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '6px 9px', background: done ? 'rgba(16,185,129,.06)' : subBg, border: `1px solid ${done ? 'rgba(16,185,129,.2)' : divider}`, borderRadius: '7px' }}>
                    <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: done ? '#10b981' : (dark ? '#1e2448' : '#e2e8f0'), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '7px', color: done ? '#fff' : textMuted, flexShrink: 0, fontWeight: 800 }}>{done ? '✓' : '○'}</div>
                    <span style={{ fontSize: '10px', fontWeight: 600, color: done ? '#10b981' : textMuted }}>{sign.name}</span>
                  </div>
                )
              })}
            </div>
          </div>

          <button onClick={resetProgress} style={{ padding: '10px', background: 'rgba(239,68,68,.06)', border: '1.5px solid rgba(239,68,68,.2)', borderRadius: '10px', color: '#ef4444', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}>
            🗑 Reset All Progress
          </button>
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