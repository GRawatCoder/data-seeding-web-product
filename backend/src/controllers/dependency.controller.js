import { resolveDependencies } from '../services/sfDependency.service.js'

export async function getDependencies(req, res) {
  const { sandboxId } = req.params
  const { objects } = req.body

  if (!Array.isArray(objects) || !objects.length) {
    return res.status(400).json({ error: 'objects array required' })
  }

  const graph = await resolveDependencies(sandboxId, objects)
  res.json(graph)
}
