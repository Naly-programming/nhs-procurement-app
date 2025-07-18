'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'
import { useUser } from '@/lib/UserContext'

type Tender = {
  id: string
  title: string
  description: string
  published_date: string
  closing_date: string | null
  contract_start_date: string | null
  value_min: string | null
  value_max: string | null
  source: string
  industry: string[]
}

export default function TendersList() {
  const [tenders, setTenders] = useState<Tender[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useUser()
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [totalItems, setTotalItems] = useState(0)
  const tabs = [
    { id: 'all', name: 'All', dbValue: 'all' },
    { id: 'contractsFinder', name: 'Contracts Finder', dbValue: 'contractsfinder' },
    { id: 'findTender', name: 'Find Tender', dbValue: 'findtender' },
    { id: 'publicContractsScotland', name: 'Public Contracts Scotland', dbValue: 'pcs' },
    { id: 'sell2wales', name: 'Sell2Wales', dbValue: 'sell2wales' },
  ]
  const [activeTab, setActiveTab] = useState('all')
  const [suggestedTenders, setSuggestedTenders] = useState<Tender[]>([])
  const [userIndustry, setUserIndustry] = useState('')

  useEffect(() => {
    const fetchUserIndustry = async () => {
      if (!user?.id) return
      const { data } = await supabase
        .from('profiles')
        .select('industry')
        .eq('id', user.id)
        .single()
      if (data?.industry) {
        setUserIndustry(data.industry)
      }
    }

    const fetchTenders = async () => {
      try {
        setLoading(true)
        let query = supabase.from('tenders').select('*', { count: 'exact' })
        
        // Apply pagination
        const from = (currentPage - 1) * itemsPerPage
        const to = from + itemsPerPage - 1
        query = query.range(from, to)

        if (activeTab !== 'all') {
          const tabConfig = tabs.find(t => t.id === activeTab)
          if (tabConfig) {
            query = query.eq('source', tabConfig.dbValue)
          }
        }

        // Temporary test data
        const testTenders = [{
          id: 'test-tender-1',
          title: 'Test Tender Matching Your Industry',
          description: 'This tender matches your selected industry',
          published_date: new Date().toISOString(),
          closing_date: new Date(Date.now() + 86400000).toISOString(),
          value_min: '100000',
          value_max: '100000',
          source: 'test',
          industry: [userIndustry || 'construction', 'technology']
        }]
        
        if (userIndustry) {
          const { data: suggestedData, error } = await supabase
            .from('tenders')
            .select('*')
            .contains('industry', [userIndustry])
            .limit(5)
            
          if (error) {
            console.error('Error fetching suggested tenders:', error)
          }
          setSuggestedTenders([...suggestedData || [], ...testTenders])
        }

        const { data, error, count } = await query.order('published_date', { ascending: false })

        if (error) throw error
        setTenders(data || [])
        setTotalItems(count || 0)
      } catch (error) {
        console.error('Error fetching tenders:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTenders()
  }, [activeTab, user, userIndustry, currentPage])

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
              <Link
                key={tender.id}
                href={`/dashboard/tenders/${tender.id}`}
                className="block p-4 border rounded-lg hover:shadow transition-shadow"
              >
                <div>
                  <h3 className="font-bold text-lg">{tender.title}</h3>
                  <p className="text-gray-600 mt-1">{tender.description}</p>
                  <div className="mt-2 text-sm text-gray-500">
                    <span>Deadline: {tender.closing_date ? new Date(tender.closing_date).toLocaleDateString('en-GB') : 'N/A'}</span>
                    <span className="mx-2">•</span>
                    <span>Value: {formatValueDisplay(tender.value_min, tender.value_max)}</span>
                    <span className="mx-2">•</span>
                    <span>{tender.industry?.[0] || ''}</span>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      )}

      {suggestedTenders.length > 0 && (
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-t-lg">
            <h3 className="text-xl font-bold">Suggested for You</h3>
            <p className="text-blue-100">Based on your selected industries</p>
          </div>
          <div className="border border-t-0 rounded-b-lg divide-y">
            {suggestedTenders.map((tender) => (
              <Link
                key={`suggested-${tender.id}`}
                href={`/dashboard/tenders/${tender.id}`}
                className="block p-4 hover:bg-blue-50 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{tender.title}</h3>
                    <p className="text-gray-600 mt-1">{tender.description}</p>
                    <div className="mt-2 text-sm text-gray-500">
                      <span>Deadline: {tender.closing_date ? new Date(tender.closing_date).toLocaleDateString('en-GB') : 'N/A'}</span>
                      <span className="mx-2">•</span>
                      <span>Value: {formatValueDisplay(tender.value_min, tender.value_max)}</span>
                      <span className="mx-2">•</span>
                      <span>{tender.industry?.[0] || ''}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function formatValueDisplay(min?: string | null, max?: string | null): string {
  if (!min || min === '0') {
    return max && max !== '0' ? `Up to £${max}` : 'N/A'
  }
  return max && max !== min ? `£${min}-£${max}` : `£${min}`
}