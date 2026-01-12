import { Router } from 'express'
import {
  listObjects,
  previewData,
  getExecutionOrder,
  validateTarget
} from '../controllers/seeding.controller.js'

const router = Router()

router.get('/objects/:sandboxId', listObjects)
router.get('/preview/:sandboxId', previewData)
router.post('/execution-order/:sandboxId', getExecutionOrder)
router.post('/validate-target/:sandboxId', validateTarget)

export default router
