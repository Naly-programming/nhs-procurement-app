import { Document, Packer, Paragraph, TextRun } from 'docx'

interface StepData {
  company_name?: string
  website?: string
  product_desc?: string
  used_in_nhs?: boolean
}

export async function generateDocxBuffer(stepData: StepData): Promise<Blob> {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: 'NHS Procurement Readiness Report',
                bold: true,
                size: 32,
              }),
            ],
          }),
          new Paragraph({ text: '' }),
          new Paragraph({ text: `Company Name: ${stepData.company_name || '—'}` }),
          new Paragraph({ text: `Website: ${stepData.website || '—'}` }),
          new Paragraph({ text: `Product Description: ${stepData.product_desc || '—'}` }),
          new Paragraph({
            text: `Used in NHS Before: ${stepData.used_in_nhs ? 'Yes' : 'No'}`,
          }),
        ],
      },
    ],
  })

  const buffer = await Packer.toBlob(doc)
  return buffer
}
