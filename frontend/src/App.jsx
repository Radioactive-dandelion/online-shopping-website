import React, { createContext, useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import axios from "./api/axios"


import Home from './Home'
import Register from './Register'
import Login from './Login'
import Profile from './Profile'   

export const AuthContext = createContext()

function App() {
  const [auth, setAuth] = useState({
    isAuthenticated: false,
    name: '',
    loading: true
  })

  // Checking authorization when loading
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get('http://localhost:8081/', {
          withCredentials: true
        })

        if (res.data.status === 'Success') {
          setAuth({
            isAuthenticated: true,
            name: res.data.name,
            loading: false
          })
        } else {
          setAuth({ isAuthenticated: false, name: '', loading: false })
        }
      } catch (err) {
        console.error('Auth check error:', err)
        setAuth({ isAuthenticated: false, name: '', loading: false })
      }
    }

    checkAuth()
  }, [])

  // logout
  const handleLogout = async (navigate) => {
    try {
      await axios.post(
        'http://localhost:8081/logout',
        {},
        { withCredentials: true }
      )
      setAuth({ isAuthenticated: false, name: '', loading: false })
      navigate('/login')
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

  return (
    <AuthContext.Provider value={{ auth, setAuth, handleLogout }}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </BrowserRouter>
    </AuthContext.Provider>
  )
}

export default App
