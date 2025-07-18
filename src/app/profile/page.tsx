'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@/lib/UserContext'
import { supabase } from '@/lib/supabaseClient'

export default function ProfilePage() {
  const { user } = useUser()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState({
    full_name: '',
    company: '',
    phone: '',
    age: '',
    avatar_url: ''
  })

  useEffect(() => {
    if (user) fetchProfile()
  }, [user])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      if (!user) return
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single()

      if (error) throw error
      if (data) setProfile(data)
    } catch (error) {
      alert('Error loading profile data')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setLoading(true)
      const updates = {
        id: user?.id,
        ...profile,
        updated_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('profiles')
        .upsert(updates, {
          onConflict: 'id'
        })

      if (error) {
        console.error('Update error:', error)
        throw error
      }
      alert('Profile updated successfully!')
    } catch (error: any) {
      console.error('Profile update failed:', error)
      alert(`Error updating profile: ${error?.message || 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const uploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return

    const file = e.target.files[0]
    const fileExt = file.name.split('.').pop()
    if (!user) return
    const fileName = `${user.id}/${Math.random()}.${fileExt}`
    const filePath = `${fileName}`

    try {
      setLoading(true)
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      setProfile({ ...profile, avatar_url: publicUrl })
    } catch (error) {
      alert('Error uploading avatar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto p-4 pt-20">
      <h1 className="text-2xl font-bold mb-6">Your Profile</h1>
      
      {loading ? (
        <p>Loading profile...</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input
              type="text"
              value={profile.full_name || ''}
              onChange={(e) => setProfile({...profile, full_name: e.target.value})}
              className="w-full border rounded p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Company</label>
            <input
              type="text"
              value={profile.company || ''}
              onChange={(e) => setProfile({...profile, company: e.target.value})}
              className="w-full border rounded p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input
              type="text"
              value={profile.phone || ''}
              onChange={(e) => setProfile({...profile, phone: e.target.value})}
              className="w-full border rounded p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Age</label>
            <input
              type="number"
              value={profile.age || ''}
              onChange={(e) => setProfile({...profile, age: e.target.value})}
              className="w-full border rounded p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Profile Picture</label>
            {profile.avatar_url ? (
              <img 
                src={profile.avatar_url} 
                alt="Avatar" 
                className="w-24 h-24 rounded-full mb-2"
              />
            ) : null}
            <input 
              type="file"
              accept="image/*"
              onChange={uploadAvatar}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      )}
    </div>
  )
}