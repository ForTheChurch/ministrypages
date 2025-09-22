import { Payload, UIField } from 'payload'
import AgentInputClient from '../AgentInputClient'

async function AgentInput({ field }: { field: UIField }) {
  return <AgentInputClient field={field} />;
}

export default AgentInput
