import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from "../../api/axios";



function Login() {
  const [values, setValues] = useState({
    email: '',
    password: ''
  })

   const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()
  
  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    // Базовая валидация
    if (!values.email || !values.password) {
      setError('Please fill in all fields')
      setLoading(false)
      return
    }

    try {
      const res = await axios.post('http://localhost:8081/login', values)
      
      if (res.data.status === "Success") {   
        navigate('/')
      } else {
        setError(res.data.error || "Invalid credentials")
      }
    } catch (err) {
      console.error("Login request error:", err)
      setError("Server error — please try again later")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='login-container'>
      <div className='login-card'>
        <h2>Sign In</h2>

        {error && <div className='login-error'>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className='mb-3'>
            <label htmlFor="email"><strong>Email</strong></label>
            <input
              type="email"
              placeholder='Enter Email'
              name='email'
              onChange={e => setValues({ ...values, email: e.target.value })}
              className='form-control'
              required
            />
          </div>

          <div className='mb-3'>
            <label htmlFor="password"><strong>Password</strong></label>
            <input
              type="password"
              placeholder='Enter Password'
              name='password'
              onChange={e => setValues({ ...values, password: e.target.value })}
              className='form-control'
              required
            />
          </div>

           <button 
            type='submit' 
            className='btn-login'
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Log in'}
          </button>

          <div className='register-link-container'>
            <p className='register-text'>Don't have an account yet?</p>
            
            <Link
              to="/register"
              className='register-link'
            >
              Create Account
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login
