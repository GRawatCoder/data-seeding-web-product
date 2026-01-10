import { Router } from 'express'
import { listSandboxes, createSandbox } from '../controllers/sandbox.controller.js'

const router = Router()

router.get('/', listSandboxes)
router.post('/', createSandbox)

export default router
