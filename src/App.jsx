import React from 'react'
import { Routes, Route } from 'react-router-dom'
import './App.css'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Users from './pages/Users'
import Tasks from './pages/Tasks'

function App() {
  return (
    <div>
      <Navbar />
      <main style={{ padding: 16 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/users" element={<Users />} />
          <Route path="/tasks" element={<Tasks />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
