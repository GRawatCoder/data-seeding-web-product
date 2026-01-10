import { Router } from 'express'
import { removeSandbox } from '../controllers/sandbox.controller.js'
import { listSandboxes, createSandbox } from '../controllers/sandbox.controller.js'

const router = Router()

router.get('/', listSandboxes)
router.post('/', createSandbox)
router.delete('/:id', removeSandbox)

export default router
