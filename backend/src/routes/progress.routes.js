import express from 'express'

const clients = []

export const sendProgress = (data) => {
  clients.forEach(res => {
    res.write(`data: ${JSON.stringify(data)}\n\n`)
  })
}

const router = express.Router()

router.get('/progress', (req, res) => {
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  })

  clients.push(res)

  req.on('close', () => {
    clients.splice(clients.indexOf(res), 1)
  })
})

export default router
