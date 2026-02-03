import { getObjectMetadata } from './metadata.helper.js';

export async function getInsertableFields({
  sandboxId,
  objectName,
}) {
  const metadata = await getObjectMetadata(sandboxId, objectName)

  if (!metadata?.insertableFields) {
    console.error('❌ [FIELDS] insertableFields missing', {
      sandboxId,
      objectName,
      metadata,
    })
    throw new Error(`Insertable fields not found for ${objectName}`)
  }

  console.log(
    `🧩 [FIELDS] ${objectName} insertable fields (${metadata.insertableFields.length})`
  )

  return metadata.insertableFields
}
