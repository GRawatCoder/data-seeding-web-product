export function resolveExecutionOrder(dependencyGraph) {
  const visited = new Set()
  const visiting = new Set()
  const order = []

  function visit(node) {
    if (visited.has(node)) return
    if (visiting.has(node)) {
      throw new Error(`Circular dependency detected at ${node}`)
    }

    visiting.add(node)

    const parents = dependencyGraph[node]?.parents || []
    for (const parent of parents) {
      visit(parent)
    }

    visiting.delete(node)
    visited.add(node)
    order.push(node)
  }

  Object.keys(dependencyGraph).forEach(visit)

  return order
}
