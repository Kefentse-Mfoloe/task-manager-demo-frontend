import React from 'react'
import { NavLink } from 'react-router-dom'

const active = { fontWeight: 'bold' }

export default function Navbar() {
  return (
    <nav style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>
      <NavLink to="/" style={({ isActive }) => (isActive ? active : undefined)} end>
        Home
      </NavLink>
      {' | '}
      <NavLink to="/users" style={({ isActive }) => (isActive ? active : undefined)}>
        Users
      </NavLink>
      {' | '}
      <NavLink to="/tasks" style={({ isActive }) => (isActive ? active : undefined)}>
        Tasks
      </NavLink>
    </nav>
  )
}
