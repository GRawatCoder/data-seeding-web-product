import { Router } from 'express'
import { sandboxHealth } from '../controllers/health.controller.js'

const router = Router()

router.get('/:sandboxId', sandboxHealth)

export default router
