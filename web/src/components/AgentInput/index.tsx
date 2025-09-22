import { Payload, UIField } from 'payload'
import AgentInputClient from './client'

async function AgentInput({ field }: { field: UIField }) {
  return <AgentInputClient field={field} />;
}

export default AgentInput
