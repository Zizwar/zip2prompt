// server.js
import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { cors } from 'hono/cors'
import AdmZip from 'adm-zip'
import { serveStatic } from "@hono/node-server/serve-static";

const app = new Hono()

app.use('/*', cors())

// Serve static files
app.use("/", serveStatic({ root: "./public" }));

app.post('/upload', async (c) => {
  try {
    const formData = await c.req.formData()
    const file = formData.get('zipFile')
    
    if (!file) return c.json({ error: 'No file uploaded' }, 400)

    const buffer = await file.arrayBuffer()
    const zip = new AdmZip(Buffer.from(buffer))
    const zipEntries = zip.getEntries()

    const fileStructure = buildFileStructure(zipEntries)
    return c.json(fileStructure)
  } catch (error) {
    console.error('Error in /upload:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

app.post('/extract', async (c) => {
  try {
    const formData = await c.req.formData()
    const filesString = formData.get('files')
    const file = formData.get('zipFile')
    
    if (!file || !filesString) return c.json({ error: 'Missing file or file list' }, 400)

    const files = JSON.parse(filesString)
    const buffer = await file.arrayBuffer()
    const zip = new AdmZip(Buffer.from(buffer))

    const extractedContent = files.map(file => {
      const entry = zip.getEntry(file)
      if (entry) {
        return `// ${file}\n${entry.getData().toString('utf8')}`
      }
      return `// ${file}\nFile not found in the ZIP archive.`
    }).join('\n\n')

    return c.json({ content: extractedContent })
  } catch (error) {
    console.error('Error in /extract:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

function buildFileStructure(entries) {
  const structure = {}
  entries.forEach(entry => {
    const path = entry.entryName.split('/')
    let current = structure
    path.forEach((part, index) => {
      if (index === path.length - 1) {
        current[part] = entry.entryName
      } else {
        if (!current[part]) current[part] = {}
        current = current[part]
      }
    })
  })
  return structure
}

// Start the server
serve({
  fetch: app.fetch,
  port: 3000
})

console.log('Server is running on http://localhost:3000')