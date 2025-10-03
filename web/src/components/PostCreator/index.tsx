import { UIField } from 'payload'
import PostCreatorClient from './client'

async function PostCreator({ field }: { field: UIField }) {
  return <PostCreatorClient field={field} />
}

export default PostCreator
