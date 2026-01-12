import { Router } from 'express'
import {
  listObjects,
  previewData,
  getExecutionOrder 
} from '../controllers/seeding.controller.js'

const router = Router()

router.get('/objects/:sandboxId', listObjects)
router.get('/preview/:sandboxId', previewData)
router.post('/execution-order/:sandboxId', getExecutionOrder)

export default router
