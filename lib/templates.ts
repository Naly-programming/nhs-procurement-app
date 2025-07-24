export interface TemplateQuestion {
  key: string
  label: string
}

export interface Template {
  id: string
  title: string
  category: string
  description: string
  questions: TemplateQuestion[]
  clauses: string[]
}

export const templates: Template[] = [
  {
    id: 'employment',
    title: 'Employment Agreement',
    category: 'HR',
    description: 'Standard employment contract for new hires.',
    questions: [
      { key: 'employee_name', label: 'Employee Name' },
      { key: 'start_date', label: 'Start Date' },
      { key: 'position', label: 'Position' }
    ],
    clauses: [
      'This Employment Agreement is made effective {{start_date}} between the Company and {{employee_name}}.',
      'The employee will serve as {{position}} and perform the duties of the role.',
      'The employee agrees to keep all company information confidential.'
    ]
  },
  {
    id: 'nda',
    title: 'Non-Disclosure Agreement',
    category: 'Legal',
    description: 'Simple NDA for sharing confidential information.',
    questions: [
      { key: 'party_a', label: 'Disclosing Party' },
      { key: 'party_b', label: 'Receiving Party' }
    ],
    clauses: [
      'This NDA is entered into between {{party_a}} and {{party_b}}.',
      '{{party_b}} shall keep all confidential information strictly confidential.',
      'The obligations survive termination of this Agreement.'
    ]
  }
]
