import { Payload, UIField } from 'payload'
import ConvertSinglePageClient from './client'

async function ConvertSinglePage({ field }: { field: UIField }) {
  return <ConvertSinglePageClient field={field} />;
}

export default ConvertSinglePage
