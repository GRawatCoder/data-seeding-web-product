import express from 'express'
import cors from 'cors'
import healthRoutes from './routes/health.routes.js'
import sandboxRoutes from './routes/sandbox.routes.js'

const app = express()

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}))

app.use(express.json())

app.use('/health', healthRoutes)
app.use('/api/sandboxes', sandboxRoutes)

export default app
