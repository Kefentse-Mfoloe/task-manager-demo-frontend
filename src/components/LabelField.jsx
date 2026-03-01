import React from 'react'

export default function LabelField({ label, error, children }) {
  return (
    <div>
      <label>
        {label}
        {children}
      </label>
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </div>
  )
}
