'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'

type Tender = {
  id: string
  title: string
  description: string
  published_date: string
  deadline: string
  value: number
  source: string
  // Add other fields as needed
}

export default function TendersList() {
  const [tenders, setTenders] = useState<Tender[]>([])
  const [loading, setLoading] = useState(true)
  const tabs = [
    { id: 'all', name: 'All', dbValue: 'all' },
    { id: 'contractsFinder', name: 'Contracts Finder', dbValue: 'contractsfinder' },
    { id: 'findTender', name: 'Find Tender', dbValue: 'findtender' },
    { id: 'publicContractsScotland', name: 'Public Contracts Scotland', dbValue: 'pcs' },
    { id: 'sell2wales', name: 'Sell2Wales', dbValue: 'sell2wales' },
  ]
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    const fetchTenders = async () => {
      try {
        setLoading(true)
        let query = supabase.from('tenders').select('*')

        if (activeTab !== 'all') {
          const tabConfig = tabs.find(t => t.id === activeTab)
          if (tabConfig) {
            query = query.eq('source', tabConfig.dbValue)
          }
        }

        const { data, error } = await query

        if (error) throw error
        setTenders(data || [])
      } catch (error) {
        console.error('Error fetching tenders:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTenders()
  }, [activeTab])

  return (
    <div className="mt-8">
      <div className="flex border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`px-4 py-2 font-medium text-sm ${activeTab === tab.id ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="mt-4">Loading tenders...</p>
      ) : (
        <div className="mt-4 space-y-4">
          {tenders.length === 0 ? (
            <p>No tenders found</p>
          ) : (
            tenders.map((tender) => (
              <div key={tender.id} className="p-4 border rounded-lg hover:shadow transition-shadow">
                <h3 className="font-bold text-lg">{tender.title}</h3>
                <p className="text-gray-600 mt-1">{tender.description}</p>
                <div className="mt-2 text-sm text-gray-500">
                  <span>Published: {new Date(tender.published_date).toLocaleDateString()}</span>
                  <span className="mx-2">•</span>
                  <span>Deadline: {new Date(tender.deadline).toLocaleDateString()}</span>
                  <span className="mx-2">•</span>
                  <span>Value: £{tender.value?.toLocaleString() || 'N/A'}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}