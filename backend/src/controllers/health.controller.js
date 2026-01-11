import { checkSandboxHealth } from '../services/sfHealth.service.js'

export async function sandboxHealth(req, res) {
  const { sandboxId } = req.params
    console.log(`Checking health for sandboxId: ${sandboxId}`)
  const result = await checkSandboxHealth(sandboxId)
  res.json(result)
}
