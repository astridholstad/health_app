import { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'

export default function LoginForm() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login({ email, password })
    } catch (err) {
      setError(err.message || 'Innlogging feilet')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="card shadow-sm" onSubmit={onSubmit}>
      <div className="card-body">
        <h2 className="h5 mb-3">Logg inn</h2>
        {!!error && <div className="alert alert-danger py-2">{error}</div>}
        <div className="mb-3">
          <label className="form-label" htmlFor="email">E-post</label>
          <input
            id="email"
            type="email"
            className="form-control"
            placeholder="deg@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label" htmlFor="password">Passord</label>
          <input
            id="password"
            type="password"
            className="form-control"
            placeholder="••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={4}
            required
          />
        </div>
        <div className="d-grid">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Logger inn...' : 'Logg inn'}
          </button>
        </div>
      </div>
    </form>
  )
}


