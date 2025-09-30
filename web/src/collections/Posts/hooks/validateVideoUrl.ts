'use server'
import type { Validate } from "payload"

export const validateVideoUrl: Validate<string> = async (value, options) => {
    if (!value) return true
    if (
        value.match(/^https?:\/\/(www\.)?youtube\.com\/watch\?v=[\w-]+/) ||
        value.match(/^https?:\/\/youtu\.be\/[\w-]+/) ||
        value.match(/^https?:\/\/(www\.)?youtube\.com\/embed\/[\w-]+/) ||
        value.match(/^https?:\/\/(www\.)?vimeo\.com\/\d+/) ||
        value.match(/^https?:\/\/player\.vimeo\.com\/video\/\d+/)
    ) {
        return true
    }
    return 'Only YouTube or Vimeo links are allowed.'
}
