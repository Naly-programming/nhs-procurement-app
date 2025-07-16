import { Document, Packer, Paragraph, TextRun } from 'docx'

type IntakeStepData = {
  company_name?: string
  website?: string
  product_desc?: string
  used_in_nhs?: boolean
}

export const generateDocxBuffer = async (data: IntakeStepData): Promise<Blob> => {
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
          new Paragraph(''),
          new Paragraph(`Company Name: ${data.company_name || '—'}`),
          new Paragraph(`Website: ${data.website || '—'}`),
          new Paragraph(`Product Description:`),
          new Paragraph(data.product_desc || '—'),
          new Paragraph(`Used in NHS Before: ${data.used_in_nhs ? 'Yes' : 'No'}`),
        ],
      },
    ],
  })

  const blob = await Packer.toBlob(doc)
  return blob
}
