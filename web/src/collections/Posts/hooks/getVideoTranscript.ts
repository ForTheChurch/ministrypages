import type { FieldHook } from 'payload'

/**
 * Sends a video URL to the agent backend to create a formatted transcript to
 * insert into the post.
 */
export const getVideoTranscript: FieldHook = ({ value, previousValue }) => {
  if (!value || typeof value !== 'string' || value === previousValue) {
    return;
  }

  const url = value.trim();
  console.log("[getVideoTranscript] Executing placeholder hook for URL:", url);
}
