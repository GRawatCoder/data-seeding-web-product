export function transformRecord({ record, idMap }) {
  const clone = { ...record }
  delete clone.Id

  for (const key of Object.keys(clone)) {
    if (key.endsWith('Id') && idMap[clone[key]]) {
      clone[key] = idMap[clone[key]]
    }
  }

  return clone
}
