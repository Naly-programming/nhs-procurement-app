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
    avatar_url: '',
    industry: [] as string[]
  })
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  useEffect(() => {
    if (user) fetchProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      if (!user) return
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error
      if (data) setProfile(data)
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error loading profile data:', error.message)
        alert('Error loading profile data')
      } else {
        alert('Unknown error loading profile')
      }
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
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Profile update failed:', error.message)
        alert(`Error updating profile: ${error.message}`)
      } else {
        alert('Unknown error updating profile')
      }
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

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      if (data?.publicUrl) {
        setProfile({ ...profile, avatar_url: data.publicUrl })
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Avatar upload failed:', error.message)
        alert('Error uploading avatar')
      } else {
        alert('Unknown error uploading avatar')
      }
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
              onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
              className="w-full border rounded p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Company</label>
            <input
              type="text"
              value={profile.company || ''}
              onChange={(e) => setProfile({ ...profile, company: e.target.value })}
              className="w-full border rounded p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input
              type="text"
              value={profile.phone || ''}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              className="w-full border rounded p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Age</label>
            <input
              type="number"
              value={profile.age || ''}
              onChange={(e) => setProfile({ ...profile, age: e.target.value })}
              className="w-full border rounded p-2"
            />
          </div>

          <div className="relative">
            <label className="block text-sm font-medium mb-1">Industries</label>
            <div className="relative">
              <div
                className="flex flex-wrap gap-2 min-h-10 p-2 border rounded-lg bg-white cursor-pointer"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                {profile.industry.length > 0 ? (
                  profile.industry.map((industry) => (
                    <span
                      key={industry}
                      className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-sm"
                    >
                      {industry}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setProfile(prev => ({
                            ...prev,
                            industry: prev.industry.filter(i => i !== industry)
                          }))
                        }}
                        className="ml-1.5 text-blue-500 hover:text-blue-700"
                      >
                        ×
                      </button>
                    </span>
                  ))
                ) : (
                  <span className="text-gray-400">Select industries...</span>
                )}
              </div>
              {isDropdownOpen && (
                <div className="mt-1 border rounded-lg shadow-lg bg-white absolute z-10 w-full">
                {['Healthcare', 'Construction', 'Technology', 'Education', 'Manufacturing']
                  .filter(industry => !profile.industry.includes(industry))
                  .map((industry) => (
                    <div
                      key={industry}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => setProfile(prev => ({
                        ...prev,
                        industry: [...prev.industry, industry]
                      }))}
                    >
                      {industry}
                    </div>
                  ))}
                </div>
              )}
            </div>
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
            className="w-full bg-primary text-white px-6 py-2 rounded hover:bg-primary-hover transition-colors" 
          >
            {loading ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      )}
    </div>
  )
}
