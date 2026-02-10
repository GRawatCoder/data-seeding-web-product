import { resolveRecordTypeId } from './recordType.resolver.js'
import { resolveUserId } from './user.resolver.js'

const FIELD_RESOLVERS = {
  RecordTypeId: resolveRecordTypeId,

  OwnerId: resolveUserId,
  CreatedById: resolveUserId,
  LastModifiedById: resolveUserId,
  ManagerId: resolveUserId,
}

export async function resolveField({
  field,
  value,
  record,
  objectName,
  sourceSandboxId,
  targetSandboxId,
  idMap,
}) {
  const resolver = FIELD_RESOLVERS[field]
  if (!resolver) return value

  return resolver({
    field,
    value,
    record,
    objectName,
    sourceSandboxId,
    targetSandboxId,
    idMap,
  })
}
