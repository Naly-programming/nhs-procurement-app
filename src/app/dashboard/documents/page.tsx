'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useUser } from '@/lib/UserContext'
import ProcurementPDF from '@/components/pdf/ProcurementPDF'
import { pdf } from '@react-pdf/renderer'
import { generateDocxBuffer } from '@/lib/docxGenerator'
import { generateMarkdownZip } from '@/lib/markdownZipGenerator'

interface DocumentRecord {
  id: string
  user_id: string
  doc_type: 'pdf' | 'docx' | 'markdown'
  file_url: string
  created_at: string
  file_name?: string
  storage_path?: string
}

interface IntakeStepData {
  company_name: string
  website: string
  product_desc: string
  used_in_nhs: boolean
}

export default function DocumentsPage() {
  const { user } = useUser()
  const [docs, setDocs] = useState<DocumentRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    const fetchDocuments = async () => {
      if (!user?.id) return

      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) console.error('Error fetching docs:', error)
      setDocs(data || [])
      setLoading(false)
    }

    fetchDocuments()
  }, [user])

  const handleGenerateDocs = async (format: 'pdf' | 'docx' | 'markdown') => {
    if (!user?.id) return
    setGenerating(true)

    const { data: intake, error } = await supabase
      .from('intake_responses')
      .select('step_data')
      .eq('user_id', user.id)
      .not('submitted_at', 'is', null)
      .order('submitted_at', { ascending: false })
      .limit(1)
      .maybeSingle<{ step_data: IntakeStepData }>()

    if (error || !intake?.step_data) {
      alert('No intake data found. Please complete the wizard first.')
      setGenerating(false)
      return
    }

    let blob: Blob | null = null
    const timestamp = Date.now()
    const fileName = `procurement-pack-${timestamp}.${format === 'markdown' ? 'zip' : format}`

    if (format === 'pdf') {
      blob = await pdf(<ProcurementPDF data={intake.step_data} />).toBlob()
    } else if (format === 'docx') {
      blob = await generateDocxBuffer(intake.step_data)
    } else if (format === 'markdown') {
      blob = await generateMarkdownZip(intake.step_data)
    }

    if (!blob) {
      alert('Error generating document.')
      setGenerating(false)
      return
    }

    const contentTypes: Record<string, string> = {
      pdf: 'application/pdf',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      markdown: 'application/zip',
    }

    const filePath = `${user.id}/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, blob, {
        contentType: contentTypes[format],
        upsert: true,
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      alert('Upload failed.')
      setGenerating(false)
      return
    }

    const { data: urlData } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath)

    if (!urlData?.publicUrl) {
      alert('Failed to get public URL.')
      setGenerating(false)
      return
    }

    await supabase.from('documents').insert([
      {
        user_id: user.id,
        doc_type: format,
        file_url: urlData.publicUrl,
        file_name: fileName,
        storage_path: filePath,
      },
    ])

    const { data: updatedDocs, error: fetchError } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (fetchError) {
      console.error(fetchError)
    }

    setDocs(updatedDocs || [])
    alert(`${format.toUpperCase()} file generated successfully!`)
    setGenerating(false)
  }

  return (
    <section className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-6">Your Documents</h1>

      {loading ? (
        <p>Loading documents...</p>
      ) : (
        <div className="space-y-8">
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              Generate your procurement pack in your preferred format:
            </p>
            <div className="space-x-4">
              {['pdf', 'docx', 'markdown'].map((format) => (
                <button
                  key={format}
                  onClick={() => handleGenerateDocs(format as DocumentRecord['doc_type'])}
                  disabled={generating}
                  className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700"
                >
                  {generating ? 'Working...' : `Generate ${format.toUpperCase()}`}
                </button>
              ))}
            </div>
          </div>

          <div className="border rounded">
            {docs.length === 0 ? (
              <p className="p-4 text-sm text-gray-600">No documents generated yet.</p>
            ) : (
              <ul className="divide-y">
                {docs.map((doc) => (
                  <li key={doc.id} className="flex justify-between items-center px-4 py-3">
                    <div>
                      <strong className="block text-sm text-gray-800">
                        {doc.doc_type.toUpperCase()}
                      </strong>
                      <span className="text-xs text-gray-500">
                        {new Date(doc.created_at).toLocaleString()}
                      </span>
                    </div>
                    <a
                      href={doc.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-teal-600 underline text-sm"
                    >
                      Download
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
