import { Router } from 'express'
import {
  listObjects,
  previewData,
  getExecutionOrder,
  validateTarget,dryRun
} from '../controllers/seeding.controller.js'

const router = Router()

router.get('/objects/:sandboxId', listObjects)
router.get('/preview/:sandboxId', previewData)
router.post('/execution-order/:sandboxId', getExecutionOrder)
router.post('/validate-target/:sandboxId', validateTarget)
router.post('/dry-run', dryRun)

export default router
