import React, { useEffect, useState } from 'react'
import axios from "./api/axios"
import { useNavigate } from "react-router-dom";
import "./App.css";




function Profile() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [profile, setProfile] = useState({
    id: null,
    name: '',
    full_name: '',
    email: '',
    bio: '',
    avatar: '',
    preferences: {}
  })

  const [passwords, setPasswords] = useState({ oldPassword: '', newPassword: '' })
  const [avatarFile, setAvatarFile] = useState(null)

    const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post("/logout");
      navigate("/"); // redirect after logout
    } catch (err) {
      console.error("Logout error:", err);
    }
  };


  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        setError('')
        const res = await axios.get('/profile')
        if (res.data && res.data.status === 'Success' && res.data.profile) {
          const p = res.data.profile
          let prefs = {}
          try { prefs = p.preferences ? JSON.parse(p.preferences) : {} } 
          catch(e) { prefs = p.preferences || {} }

          setProfile({
            id: p.id,
            name: p.name || '',
            full_name: p.full_name || '',
            email: p.email || '',
            bio: p.bio || '',
            avatar: p.avatar || '',
            preferences: prefs
          })
        } else {
          setError(res.data?.error || 'Failed to load profile')
        }
      } catch (err) {
        console.error(err)
        setError(err.response?.data?.error || 'Error loading profile')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const handleChange = (field) => (e) => {
    setProfile(prev => ({ ...prev, [field]: e.target.value }))
  }

  const handlePrefChange = (key, value) => {
    setProfile(prev => ({ ...prev, preferences: { ...prev.preferences, [key]: value } }))
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const payload = {
        name: profile.name,
        full_name: profile.full_name,
        bio: profile.bio
      }
      const res = await axios.put('/profile', payload)
      if (res.data?.status === 'Success') {
        setSuccess('Profile updated')
      } else {
        setError(res.data?.error || 'Failed to update profile')
      }
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.error || 'Error updating profile')
    } finally {
      setSaving(false)
      setTimeout(() => setSuccess(''), 3000)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    if (!passwords.oldPassword || !passwords.newPassword) {
      setError('Fill in both password fields')
      setSaving(false)
      return
    }

    try {
      const res = await axios.put('/profile/password', passwords)
      if (res.data?.status === 'Success') {
        setSuccess('Password changed')
        setPasswords({ oldPassword: '', newPassword: '' })
      } else {
        setError(res.data?.error || 'Failed to change password')
      }
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.error || 'Error changing password')
    } finally {
      setSaving(false)
      setTimeout(() => setSuccess(''), 3000)
    }
  }

  const handleSavePreferences = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const res = await axios.put('/profile/preferences', profile.preferences)
      if (res.data?.status === 'Success') {
        setSuccess('Preferences saved')
      } else {
        setError(res.data?.error || 'Failed to save preferences')
      }
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.error || 'Error saving preferences')
    } finally {
      setSaving(false)
      setTimeout(() => setSuccess(''), 2000)
    }
  }

  const handleAvatarSelect = (e) => {
    setAvatarFile(e.target.files?.[0] || null)
  }

  const handleUploadAvatar = async (e) => {
    e.preventDefault()
    if (!avatarFile) {
      setError('Select a file')
      return
    }

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const fd = new FormData()
      fd.append('avatar', avatarFile)
      const res = await axios.post('/profile/avatar', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      if (res.data?.status === 'Success') {
        setProfile(prev => ({ ...prev, avatar: res.data.avatar }))
        setSuccess('Avatar uploaded')
      } else {
        setError(res.data?.error || 'Failed to upload avatar')
      }
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.error || 'Error uploading avatar')
    } finally {
      setSaving(false)
      setAvatarFile(null)
      const input = document.getElementById('avatarInput')
      if (input) input.value = ''
      setTimeout(() => setSuccess(''), 2000)
    }
  }

  const handleRemoveAvatar = async () => {
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const res = await axios.post('/profile/avatar/remove')
      if (res.data?.status === 'Success') {
        setProfile(prev => ({ ...prev, avatar: '' }))
        setSuccess('Avatar removed')
      } else {
        setError(res.data?.error || 'Failed to remove avatar')
      }
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.error || 'Error removing avatar')
    } finally {
      setSaving(false)
      setTimeout(() => setSuccess(''), 2000)
    }
  }

  if (loading) return <div className="loading-indicator">Loading profile...</div>

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h2>My Profile</h2>
        <button className="btn-logout" onClick={handleLogout} disabled={saving}>
          {saving ? 'Processing...' : 'Logout'}
        </button>
      </div>

      {error && <div className="profile-alert alert-danger">{error}</div>}
      {success && <div className="profile-alert alert-success">{success}</div>}

      <div className="profile-grid">
        {/* Левая колонка */}
        <div>
          {/* Аватар */}
          <div className="profile-card">
            <div className="avatar-container">
              {profile.avatar ? (
                <img src={profile.avatar} alt="avatar" className="avatar-image" />
              ) : (
                <div className="avatar-placeholder">No avatar</div>
              )}

              <form onSubmit={handleUploadAvatar} className="profile-form">
                <div className="file-upload">
                  <input 
                    id="avatarInput" 
                    type="file" 
                    accept="image/*" 
                    onChange={handleAvatarSelect} 
                    className="form-control" 
                    style={{ display: 'none' }} 
                  />
                  <div
                    className="custom-file-display"
                  >
                    {avatarFile ? avatarFile.name : 'No file chosen'}
                  </div>
                  <button 
                    type="button"
                    className="btn-browse"
                    onClick={() => document.getElementById('avatarInput').click()}
                    disabled={saving}
                  >
                    Browse
                  </button>
                </div>

                <div className="action-buttons">
                  <button 
                    className="profile-btn btn-profile-save" 
                    type="submit" 
                    disabled={saving || !avatarFile}
                  >
                    {saving ? 'Uploading...' : 'Upload'}
                  </button>
                  <button 
                    className="profile-btn btn-profile-danger" 
                    type="button" 
                    onClick={handleRemoveAvatar} 
                    disabled={saving || !profile.avatar}
                  >
                    Remove
                  </button>
                </div>
              </form>
            </div>
          </div>
          {/* Настройки */}
          <div className="profile-card">
            <h6>Settings</h6>

            <form onSubmit={handleSavePreferences} className="profile-form">
              {/* Тема */}
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="prefTheme"
                  checked={profile.preferences?.theme === 'dark'}
                  onChange={(e) => handlePrefChange('theme', e.target.checked ? 'dark' : 'light')}
                  disabled={saving}
                />
                <label className="form-check-label" htmlFor="prefTheme">Dark theme</label>
              </div>

              {/* Язык */}
              <div className="mb-3">
                <label className="form-label">Language</label>
                <select
                  className="form-select"
                  value={profile.preferences?.language || 'en'}
                  onChange={(e) => handlePrefChange('language', e.target.value)}
                  disabled={saving}
                >
                  <option value="en">English</option>
                  <option value="ru">Russian</option>
                </select>
              </div>

              {/* Валюта */}
              <div className="mb-3">
                <label className="form-label">Currency</label>
                <select
                  className="form-select"
                  value={profile.preferences?.currency || 'USD'}
                  onChange={(e) => handlePrefChange('currency', e.target.value)}
                  disabled={saving}
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="RUB">RUB</option>
                  <option value="KZT">KZT</option>
                </select>
              </div>

              {/* Уведомления */}
              <div className="form-check mb-4">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="prefNotifications"
                  checked={profile.preferences?.notifications ?? true}
                  onChange={(e) => handlePrefChange('notifications', e.target.checked)}
                  disabled={saving}
                />
                <label className="form-check-label" htmlFor="prefNotifications">
                  Receive email notifications
                </label>
              </div>

              <button className="profile-btn btn-profile-outline" type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </form>
          </div>
        </div>

        {/* Правая колонка */}
        <div>
          {/* Информация профиля */}
          <div className="profile-card">
            <form onSubmit={handleSaveProfile} className="profile-form">
              <div className="mb-3">
                <label className="form-label">Username</label>
                <input 
                  className="form-control" 
                  value={profile.name} 
                  onChange={handleChange('name')}
                  disabled={saving}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Full Name</label>
                <input 
                  className="form-control" 
                  value={profile.full_name} 
                  onChange={handleChange('full_name')}
                  disabled={saving}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Email</label>
                <input 
                  className="form-control" 
                  value={profile.email} 
                  readOnly 
                />
              </div>

              <div className="mb-4">
                <label className="form-label">About</label>
                <textarea 
                  className="form-control" 
                  rows="4" 
                  value={profile.bio} 
                  onChange={handleChange('bio')}
                  disabled={saving}
                  placeholder="Tell us about yourself..."
                />
              </div>

              <button className="profile-btn btn-profile-save" type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </form>
          </div>

          {/* Смена пароля */}
          <div className="profile-card">
            <h6>Change Password</h6>
            
            <form onSubmit={handleChangePassword} className="profile-form">
              <div className="mb-3">
                <label className="form-label">Current Password</label>
                <input 
                  className="form-control" 
                  type="password" 
                  value={passwords.oldPassword} 
                  onChange={e => setPasswords({ ...passwords, oldPassword: e.target.value })}
                  disabled={saving}
                  placeholder="Enter current password"
                />
              </div>

              <div className="mb-4">
                <label className="form-label">New Password</label>
                <input 
                  className="form-control" 
                  type="password" 
                  value={passwords.newPassword} 
                  onChange={e => setPasswords({ ...passwords, newPassword: e.target.value })}
                  disabled={saving}
                  placeholder="Enter new password"
                />
              </div>

              <button className="profile-btn btn-profile-warning" type="submit" disabled={saving}>
                {saving ? 'Changing...' : 'Change Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile