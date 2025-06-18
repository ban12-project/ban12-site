import { writeMetadata } from '#/public/exiftool.esm'
import { toast } from 'sonner'

function genAppleMakerNotesTags(uuid: string) {
  return [
    `-ContentIdentifier=${uuid}`,
    // '-LivePhotoAuto=1',
    // '-LivePhotoVitalityScore=1',
    // '-LivePhotoVitalityScoringVersion=4',
  ]
}

export async function writeTags(file: File) {
  const uuid = crypto.randomUUID()
  const tags = genAppleMakerNotesTags(uuid)
  const options = {
    tags,
  }

  const result = await writeMetadata(file, options)
  const filename = `${uuid}.${file.name.split('.').pop()}`

  if (result.success) {
    toast.success('Tags written successfully')
    return new File([result.data!], filename, { type: file.type })
  } else {
    toast.error(result.error)
  }
}
