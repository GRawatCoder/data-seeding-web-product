import express from 'express'
import cors from 'cors'
import healthRoutes from './routes/health.routes.js'
import sandboxRoutes from './routes/sandbox.routes.js'
import oauthRoutes from './routes/oauth.routes.js'
import dependencyRoutes from './routes/dependency.routes.js'
import seedingRoutes from './routes/seeding.routes.js'

const app = express()

app.use(cors({
  origin: 'http://localhost:5174',
  credentials: true,
}))

app.use(express.json())

app.use('/health', healthRoutes)
app.use('/api/sandboxes', sandboxRoutes)
app.use('/oauth', oauthRoutes)
app.use('/seeding/dependencies', dependencyRoutes)
app.use('/seeding', seedingRoutes)

export default app
