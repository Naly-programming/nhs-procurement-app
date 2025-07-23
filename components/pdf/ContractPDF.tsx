import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { load } from 'cheerio'

interface Clause {
  text: string
}

const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 12, fontFamily: 'Helvetica', lineHeight: 1.5 },
  clause: { marginBottom: 10 },
})

export default function ContractPDF({ title, clauses }: { title: string; clauses: Clause[] }) {
  return (
    <Document>
      <Page style={styles.page}>
        <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 20 }}>{title}</Text>
        {clauses.map((c, i) => {
          const $ = load(c.text)
          const plain = $.text()
          return (
            <View key={i} style={styles.clause}>
              <Text>{`${i + 1}. ${plain}`}</Text>
            </View>
          )
        })}
      </Page>
    </Document>
  )
}
