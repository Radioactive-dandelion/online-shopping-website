import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from "../../api/axios";


function Register() {
  const navigate = useNavigate()
  const [values, setValues] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError(null)
    setSuccess(null)

    // Basic validation
    if (!values.name || !values.email || !values.password) {
      setError('Please fill in all fields')
      return
    }

    try {
      setLoading(true)
      const res = await axios.post('http://localhost:8081/register', values, {
        headers: { 'Content-Type': 'application/json' }
      })

      if (res.status >= 200 && res.status < 300) {
        setSuccess('Registration successful')
        console.log('response:', res.data)

        setTimeout(() => navigate('/login'), 800)
      } else {
        setError('Unexpected server response')
        console.log('unexpected response', res)
      }
    } catch (err) {
      console.error('request error', err)

      if (err.response) {
        setError(err.response.data?.error || 'Server error')
        console.log('server error details:', err.response.data)
      } else {
        setError('Network error — server is unreachable')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='register-container'>
    <div className='register-card'>
        <h2>Sign Up</h2>

        {error && <div className='alert alert-danger'>{error}</div>}
        {success && <div className='alert alert-success'>{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className='mb-3'>
            <label htmlFor="name"><strong>Name</strong></label>
            <input
              id="name"
              type="text"
              placeholder='Enter Name'
              name='name'
              value={values.name}
              onChange={e => setValues({ ...values, name: e.target.value })}
              className='form-control'
            />
          </div>

          <div className='mb-3'>
            <label htmlFor="email"><strong>Email</strong></label>
            <input
              id="email"
              type="email"
              placeholder='Enter Email'
              name='email'
              value={values.email}
              onChange={e => setValues({ ...values, email: e.target.value })}
              className='form-control'
            />
          </div>

          <div className='mb-3'>
            <label htmlFor="password"><strong>Password</strong></label>
            <input
              id="password"
              type="password"
              placeholder='Enter Password'
              name='password'
              value={values.password}
              onChange={e => setValues({ ...values, password: e.target.value })}
              className='form-control'
            />
          </div>

          <button
            type='submit'
            className='btn-register'
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Sign Up'}
          </button>

          <div className='login-link-container'>
          <p className='login-text'>Already have an account?</p>
          <Link
            to="/login"
            className='login-link'
          >
            Log In
          </Link>
        </div>
        </form>
      </div>
    </div>
  )
}

export default Register
