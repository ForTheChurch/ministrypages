import {
  Attachment,
  AttachmentAdapter,
  CompleteAttachment,
  PendingAttachment,
  SimpleImageAttachmentAdapter,
} from '@assistant-ui/react'

export class MediaUploadAttachmentAdapter implements AttachmentAdapter {
  public accept = 'image/*'

  private mediaId: Record<string, string> = {}
  private simpleImageAttachmentAdapter = new SimpleImageAttachmentAdapter()

  public async add(state: { file: File }): Promise<PendingAttachment> {
    // Create FormData with the file
    const formData = new FormData()
    formData.append('file', state.file, state.file.name)

    // Make the fetch request to Payload CMS API
    const response = await fetch('/api/media', {
      method: 'POST',
      body: formData,
      credentials: 'include',
      // Note: Don't set Content-Type header - browser will set it with boundary
    })

    if (!response.ok) {
      throw new Error(`Failed to upload media: ${response.statusText}`)
    }

    const data = await response.json()

    // Check for errors in the response
    if (data.errors && data.errors.length > 0) {
      throw new Error(`Upload failed: ${JSON.stringify(data.errors)}`)
    }

    if (!data.doc || !data.doc.id) {
      throw new Error('No document ID returned from upload')
    }

    this.mediaId[state.file.name] = data.doc.id
    return this.simpleImageAttachmentAdapter.add(state)
  }

  public async send(attachment: PendingAttachment): Promise<CompleteAttachment> {
    const result = await this.simpleImageAttachmentAdapter.send(attachment)
    result.content.push({
      type: 'text',
      text: `<media name="${attachment.name}" id="${this.mediaId[attachment.name]}" />`,
    })
    return result
  }

  public async remove(attachment: Attachment) {
    if (!this.mediaId[attachment.name]) {
      return
    }

    const response = await fetch(`/api/media/${this.mediaId}`, {
      method: 'DELETE',
      credentials: 'include',
    })

    if (!response.ok) {
      console.error('Failed to delete media:', response.statusText)
    }

    delete this.mediaId[attachment.name]
    return this.simpleImageAttachmentAdapter.remove()
  }
}
