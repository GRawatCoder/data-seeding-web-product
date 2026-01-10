import { Router } from 'express'
import {
  oauthLogin,
  oauthCallback,
} from '../controllers/oauth.controller.js'

const router = Router()

router.get('/login', oauthLogin)
router.get('/callback', oauthCallback)

export default router
