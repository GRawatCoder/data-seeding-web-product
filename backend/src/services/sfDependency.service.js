import axios from 'axios'
import { getSandboxAuth } from './auth.store.js'


const SYSTEM_OBJECTS = new Set([
  'User',
  'Profile',
  'UserLicense',
  'Group',
  'Organization',
  'BusinessHours',
  'Queue',
  'Role'
])

const BUSINESS_PARENT_OVERRIDES = {
  Contact: ['Account'],
  Opportunity: ['Account'],
  OpportunityLineItem: ['Opportunity'],
  Case: ['Account'],
}



async function describeObject(auth, objectName) {
  const res = await axios.get(
    `${auth.instanceUrl}/services/data/v58.0/sobjects/${objectName}/describe`,
    {
      headers: {
        Authorization: `Bearer ${auth.accessToken}`,
      },
    }
  )
  return res.data
}

export async function resolveDependencies(sandboxId, selectedObjects) {
  const auth = getSandboxAuth(sandboxId)
  if (!auth) throw new Error('Sandbox not connected')

  const visited = new Set()
  const graph = {}

  async function walk(objectName) {
    if (visited.has(objectName)) return
    visited.add(objectName)

    const desc = await describeObject(auth, objectName)

    let parents = desc.fields
      .filter((f) => {
        if (!f.referenceTo?.length) return false;

        if (["CreatedById", "LastModifiedById", "OwnerId"].includes(f.name)) {
          return false;
        }

        if (f.referenceTo.some((obj) => SYSTEM_OBJECTS.has(obj))) {
          return false;
        }

        return f.relationshipOrder === 1 || f.nillable === false;
      })
      .flatMap((f) => f.referenceTo);

    // 🔑 Add business overrides
    const overrides = BUSINESS_PARENT_OVERRIDES[objectName] || [];
    parents = Array.from(new Set([...parents, ...overrides]));

    graph[objectName] = {
      parents,
    }

    for (const parent of parents) {
      await walk(parent)
    }
  }

  for (const obj of selectedObjects) {
    await walk(obj)
  }

  return graph
}
