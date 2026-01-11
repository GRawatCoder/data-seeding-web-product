import { Router } from 'express'
import {
  listObjects,
  previewData,
} from '../controllers/seeding.controller.js'

const router = Router()

router.get('/objects/:sandboxId', listObjects)
router.get('/preview/:sandboxId', previewData)

export default router
