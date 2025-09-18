import { Payload, UIField } from 'payload'
import AgentInputClient from '../AgentInputClient'

async function AgentInput({ field }: { payload: Payload, field: UIField }) {
  return <AgentInputClient field={field} />;
}

export default AgentInput
