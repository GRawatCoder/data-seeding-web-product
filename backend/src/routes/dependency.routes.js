import { Router } from 'express'
import { getDependencies } from '../controllers/dependency.controller.js'

const router = Router()

router.post('/:sandboxId', getDependencies)

export default router
