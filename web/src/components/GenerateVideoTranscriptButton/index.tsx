import { Payload, TextField } from 'payload'
import GenerateVideoTranscriptButtonClient from './client'

async function GenerateTranscriptButton({ field }: { field: TextField }) {
  return <GenerateVideoTranscriptButtonClient field={field} />;
}

export default GenerateTranscriptButton
