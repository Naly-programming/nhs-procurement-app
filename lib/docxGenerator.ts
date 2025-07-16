import { Packer, Document, Paragraph, TextRun } from 'docx'

interface StepData {
  company_name?: string
  website?: string
  product_desc?: string
  used_in_nhs?: boolean
  has_data_policy?: boolean
  has_ico_registration?: boolean
  is_dsp_toolkit_compliant?: boolean
}

export async function generateDocxBuffer(data: StepData): Promise<Blob> {
  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: 'NHS Procurement Readiness Report',
                bold: true,
                size: 28,
              }),
            ],
          }),

          new Paragraph({ text: '' }),

          new Paragraph({
            children: [new TextRun({ text: 'Basic Company Info', bold: true })],
          }),
          new Paragraph({ text: `Company Name: ${data.company_name || '—'}` }),
          new Paragraph({ text: `Website: ${data.website || '—'}` }),
          new Paragraph({ text: '' }),

          new Paragraph({
            children: [new TextRun({ text: 'Product Details', bold: true })],
          }),
          new Paragraph({ text: `Product Description: ${data.product_desc || '—'}` }),
          new Paragraph({ text: `Used in NHS Before: ${data.used_in_nhs ? 'Yes' : 'No'}` }),
          new Paragraph({ text: '' }),

          new Paragraph({
            children: [new TextRun({ text: 'Compliance Checklist', bold: true })],
          }),
          new Paragraph({ text: `Data Protection Policy: ${data.has_data_policy ? 'Yes' : 'No'}` }),
          new Paragraph({ text: `ICO Registered: ${data.has_ico_registration ? 'Yes' : 'No'}` }),
          new Paragraph({ text: `DSP Toolkit Compliant: ${data.is_dsp_toolkit_compliant ? 'Yes' : 'No'}` }),
        ],
      },
    ],
  })

  const buffer = await Packer.toBlob(doc)
  return buffer
}
