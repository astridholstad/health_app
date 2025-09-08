import { useMemo, useState } from 'react'
import './App.css'
import { useAuth } from './context/AuthContext.jsx'
import LoginForm from './components/LoginForm.jsx'
import PlansTable from './components/PlansTable.jsx'
import { supabase } from './lib/supabase.js'

const EXERCISE_LIBRARY = {
  'Helkropp': [
    'Knebøy 3x8-12',
    'Benkpress 3x6-10',
    'Stående roing 3x8-12',
    'Skulderpress 3x8-12',
    'Planke 3x30-60s'
  ],
  'Overkropp': [
    'Benkpress 4x6-10',
    'Nedtrekk/Pullups 4x6-10',
    'Sittende roing 3x8-12',
    'Skulderpress 3x8-12',
    'Bicepscurl 3x10-15',
    'Pushdowns 3x10-15'
  ],
  'Underkropp': [
    'Knebøy 4x6-10',
    'Rumenske markløft 3x8-12',
    'Utfall 3x10-12 per bein',
    'Legghev 3x12-20',
    'Hollow hold 3x20-40s'
  ],
  'Push': [
    'Benkpress 4x6-10',
    'Skulderpress 3x8-12',
    'Skrå benk med manualer 3x8-12',
    'Flyes 3x12-15',
    'Pushdowns 3x10-15',
    'Sidehev 3x12-20'
  ],
  'Pull': [
    'Markløft/Trap-bar 3x3-5 (valgfritt)',
    'Pullups/Nedtrekk 4x6-10',
    'Sittende roing 3x8-12',
    'Face pull 3x12-20',
    'Bicepscurl 3x10-15'
  ],
  'Bein': [
    'Knebøy 4x6-10',
    'Rumenske markløft 3x8-12',
    'Hoftehev 3x8-12',
    'Utfall 3x10-12 per bein',
    'Legghev 3x12-20'
  ],
  'Bryst': [
    'Benkpress 4x6-10',
    'Skrå benk med manualer 3x8-12',
    'Dips 3xAMRAP',
    'Flyes 3x12-15'
  ],
  'Rygg': [
    'Pullups/Nedtrekk 4x6-10',
    'Sittende roing 3x8-12',
    'Stående roing 3x8-12',
    'Face pull 3x12-20'
  ],
  'Skuldre': [
    'Skulderpress 4x6-10',
    'Sidehev 3x12-20',
    'Omvendt flyes 3x12-20'
  ],
  'Biceps': [
    'Stangcurl 4x8-12',
    'Hantelcurl 3x10-15',
    'Hammercurl 3x10-15'
  ],
  'Triceps': [
    'Smal benkpress 4x6-10',
    'Pushdowns 3x10-15',
    'Overhead triceps 3x10-15'
  ],
  'Kjerne': [
    'Planke 3x40-60s',
    'Hanging leg raise 3x8-12',
    'Pallof press 3x12-15 per side'
  ],
  'Bryst/Triceps': [
    'Benkpress 4x6-10',
    'Skrå benk 3x8-12',
    'Dips 3xAMRAP',
    'Pushdowns 3x10-15',
    'Overhead triceps 3x10-15'
  ],
  'Rygg/Biceps': [
    'Nedtrekk/Pullups 4x6-10',
    'Sittende roing 3x8-12',
    'Stående roing 3x8-12',
    'Stangcurl 3x8-12',
    'Hammercurl 3x10-15'
  ],
  'Skuldre/Kjerne': [
    'Skulderpress 4x6-10',
    'Sidehev 3x12-20',
    'Face pull 3x12-20',
    'Planke 3x40-60s',
    'Hanging leg raise 3x8-12'
  ],
  'Armer/Kjerne': [
    'Stangcurl 3x8-12',
    'Hammercurl 3x10-15',
    'Pushdowns 3x10-15',
    'Overhead triceps 3x10-15',
    'Planke 3x40-60s'
  ]
}

const WEEKDAYS = ['Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag', 'Søndag']

function generateSplit(days) {
  const plans = {
    1: [['Helkropp']],
    2: [
      ['Overkropp', 'Underkropp'],
      ['Push', 'Pull'],
      ['Helkropp', 'Helkropp']
    ],
    3: [
      ['Push', 'Pull', 'Bein'],
      ['Helkropp', 'Helkropp', 'Helkropp'],
      ['Overkropp', 'Underkropp', 'Helkropp']
    ],
    4: [
      ['Push', 'Pull', 'Bein', 'Helkropp'],
      ['Bryst/Triceps', 'Rygg/Biceps', 'Bein', 'Skuldre/Kjerne']
    ],
    5: [
      ['Bryst', 'Rygg', 'Skuldre', 'Bein', 'Armer/Kjerne'],
      ['Push', 'Pull', 'Bein', 'Overkropp', 'Helkropp']
    ],
    6: [
      ['Push', 'Pull', 'Bein', 'Push', 'Pull', 'Bein'],
      ['Helkropp', 'Helkropp', 'Helkropp', 'Helkropp', 'Helkropp', 'Helkropp']
    ],
    7: [
      ['Bryst', 'Rygg', 'Skuldre', 'Bein', 'Biceps', 'Triceps', 'Kjerne']
    ]
  }

  const options = plans[days] || plans[3]
  const randomIndex = Math.floor(Math.random() * options.length)
  return options[randomIndex]
}

function sampleExercisesFor(dayType, maxExercises = 5) {
  const list = EXERCISE_LIBRARY[dayType] || EXERCISE_LIBRARY['Helkropp']
  // Lett randomisering av rekkefølge
  const shuffled = [...list].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(maxExercises, shuffled.length))
}

function App() {
  const { user, logout } = useAuth()
  const [numDays, setNumDays] = useState(3)
  const [selectedDays, setSelectedDays] = useState([])
  const [seed, setSeed] = useState(0)
  const [savedPlans, setSavedPlans] = useState([])

  const plan = useMemo(() => generateSplit(numDays), [numDays, seed])

  const toggleWeekday = (day) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    )
  }

  const displayedDays = selectedDays.length > 0 ? selectedDays : WEEKDAYS.slice(0, numDays)

  if (!user) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-12 col-sm-10 col-md-6 col-lg-5">
            <LoginForm />
          </div>
        </div>
      </div>
    )
  }

  // Hent lagrede planer når bruker finnes
  useEffect(() => {
    const loadPlans = async () => {
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (!error && data) setSavedPlans(data)
    }
    loadPlans()
  }, [user])

  const saveCurrentPlan = async () => {
    const schedule = displayedDays.map((_, idx) => plan[idx] || plan[plan.length - 1])
    const { data, error } = await supabase
      .from('plans')
      .insert({ user_id: user.id, days: numDays, schedule })
      .select('*')
    if (!error && data) {
      setSavedPlans((prev) => [data[0], ...prev])
    }
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-10 col-lg-8">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center mb-3">
                <h1 className="h3 m-0">Treningsplan-generator</h1>
                <div className="ms-auto d-flex align-items-center gap-2">
                  <span className="small text-muted d-none d-sm-inline">{user.email}</span>
                  <button className="btn btn-outline-secondary btn-sm" onClick={logout}>Logg ut</button>
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="days" className="form-label">Hvor mange dager vil du trene denne uken?</label>
                <input
                  id="days"
                  type="range"
                  className="form-range"
                  min={1}
                  max={7}
                  value={numDays}
                  onChange={(e) => setNumDays(Number(e.target.value))}
                />
                <div className="d-flex justify-content-between">
                  <small>1</small>
                  <span className="fw-bold">{numDays} dager</span>
                  <small>7</small>
                </div>
              </div>

              <div className="mb-4">
                <div className="d-flex align-items-center mb-2">
                  <h2 className="h6 m-0">Velg ukedager (valgfritt)</h2>
                  <button
                    className="btn btn-link btn-sm ms-auto"
                    onClick={() => setSelectedDays([])}
                  >Nullstill</button>
                </div>
                <div className="d-flex flex-wrap gap-2">
                  {WEEKDAYS.map((day) => (
                    <button
                      key={day}
                      type="button"
                      className={`btn btn-sm ${selectedDays.includes(day) ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => toggleWeekday(day)}
                      disabled={selectedDays.length >= numDays && !selectedDays.includes(day)}
                    >
                      {day}
                    </button>
                  ))}
                </div>
                <small className="text-muted">Velg opptil {numDays} dager, ellers brukes de første {numDays} dagene.</small>
              </div>

              <div className="d-flex align-items-center mb-3">
                <h2 className="h6 m-0">Anbefalt split</h2>
                <button
                  className="btn btn-outline-secondary btn-sm ms-auto"
                  onClick={() => setSeed((s) => s + 1)}
                >Regenerer</button>
              </div>

              <ul className="list-group">
                {displayedDays.map((day, idx) => {
                  const dayType = plan[idx] || plan[plan.length - 1]
                  const exercises = sampleExercisesFor(dayType)
                  return (
                    <li key={day} className="list-group-item">
                      <div className="d-flex align-items-center mb-1">
                        <span className="badge text-bg-secondary me-2">{idx + 1}</span>
                        <div className="fw-semibold flex-grow-1">{day}</div>
                        <span className="badge rounded-pill text-bg-light" style={{border: '1px solid #ffd1e6'}}>{dayType}</span>
                      </div>
                      <ul className="mb-0 small">
                        {exercises.map((ex) => (
                          <li key={ex}>{ex}</li>
                        ))}
                      </ul>
                    </li>
                  )
                })}
              </ul>

              <div className="mt-3 d-flex justify-content-end">
                <button className="btn btn-primary" onClick={saveCurrentPlan}>Lagre plan</button>
              </div>

              <div className="mt-4">
                <details>
                  <summary className="mb-2">Hva betyr split-typene?</summary>
                  <ul className="small text-muted mb-0">
                    <li>Push: Bryst, skuldre, triceps</li>
                    <li>Pull: Rygg, biceps</li>
                    <li>Bein: Lår, legger, sete</li>
                    <li>Overkropp/Underkropp: Helkropp delt i to</li>
                    <li>Helkropp: Økter som dekker hele kroppen</li>
                  </ul>
                </details>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <div className="card shadow-sm">
              <div className="card-body">
                <div className="d-flex align-items-center mb-2">
                  <h2 className="h6 m-0">Lagrede planer</h2>
                </div>
                <PlansTable plans={savedPlans} />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default App
