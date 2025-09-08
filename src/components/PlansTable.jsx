import { useMemo } from 'react'

export default function PlansTable({ plans = [] }) {
  const rows = useMemo(() => plans.map((p, idx) => ({
    idx: idx + 1,
    createdAt: new Date(p.createdAt).toLocaleString(),
    days: p.days,
    schedule: p.schedule
  })), [plans])

  if (!plans.length) {
    return (
      <div className="alert alert-light" role="alert" style={{border: '1px solid #ffd1e6'}}>
        Ingen lagrede planer ennå. Trykk «Lagre plan» for å lagre.
      </div>
    )
  }

  return (
    <div className="table-responsive">
      <table className="table align-middle">
        <thead>
          <tr>
            <th>#</th>
            <th>Dato</th>
            <th>Dager</th>
            <th>Plan</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.idx}>
              <td>{r.idx}</td>
              <td>{r.createdAt}</td>
              <td>{r.days}</td>
              <td className="small">{r.schedule.join(' · ')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}


