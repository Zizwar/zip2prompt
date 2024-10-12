import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { cors } from 'hono/cors'
import { serveStatic } from "@hono/node-server/serve-static";
import AdmZip from 'adm-zip'
import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import os from 'os'

const app = new Hono()

app.use('/*', cors())
app.use("/", serveStatic({ root: "./public" }));

const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

async function fetchFileFromUrl(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return await response.arrayBuffer();
}

async function fetchFromGitHub(url, branch = 'main') {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'github-'));
  try {
    execSync(`git clone --depth 1 --branch ${branch} ${url} ${tempDir}`, { stdio: 'inherit' });

    const zip = new AdmZip();
    const addFilesToZip = (dir, zipPath = '') => {
      const files = fs.readdirSync(dir, { withFileTypes: true });
      for (const file of files) {
        const filePath = path.join(dir, file.name);
        if (file.isDirectory()) {
          if (file.name !== '.git') {
            addFilesToZip(filePath, path.join(zipPath, file.name));
          }
        } else {
          zip.addLocalFile(filePath, zipPath);
        }
      }
    };
    addFilesToZip(tempDir);

    return zip.toBuffer();
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

app.post('/upload', async (c) => {
  try {
    const formData = await c.req.formData()
    const file = formData.get('zipFile')
    const url = formData.get('url')
    const branch = formData.get('branch') || 'main'

    let buffer;
    let filename;
    if (file) {
      buffer = await file.arrayBuffer()
      filename = file.name;
    } else if (url) {
      if (url.includes('github.com')) {
        buffer = await fetchFromGitHub(url, branch);
        filename = url.split('/').pop() + '.zip';
      } else {
        buffer = await fetchFileFromUrl(url);
        filename = url.split('/').pop();
      }
    } else {
      return c.json({ error: 'No file or URL provided' }, 400)
    }

    const filePath = path.join(uploadsDir, filename);
    fs.writeFileSync(filePath, Buffer.from(buffer));

    const zip = new AdmZip(Buffer.from(buffer))
    const zipEntries = zip.getEntries()
    const fileStructure = buildFileStructure(zipEntries)
    return c.json({ fileStructure, filename })
  } catch (error) {
    console.error('Error in /upload:', error)
    return c.json({ error: 'Internal server error: ' + error.message }, 500)
  }
})

app.get('/reopen/:filename', async (c) => {
  try {
    const filename = c.req.param('filename');
    const filePath = path.join(uploadsDir, filename);
    
    if (!fs.existsSync(filePath)) {
      return c.json({ error: 'File not found' }, 404);
    }

    const zip = new AdmZip(filePath);
    const zipEntries = zip.getEntries();
    const fileStructure = buildFileStructure(zipEntries);
    
    return c.json({ fileStructure, filename });
  } catch (error) {
    console.error('Error in /reopen:', error);
    return c.json({ error: 'Internal server error: ' + error.message }, 500);
  }
});

app.post('/extract', async (c) => {
  try {
    const formData = await c.req.formData()
    const filesString = formData.get('files')
    const filename = formData.get('filename')

    if (!filename || !filesString) return c.json({ error: 'Missing filename or file list' }, 400)
    const files = JSON.parse(filesString)

    const filePath = path.join(uploadsDir, filename);
    if (!fs.existsSync(filePath)) {
      return c.json({ error: 'File not found' }, 404);
    }

    const zip = new AdmZip(filePath)
    const extractedContent = files.map(file => {
      const entry = zip.getEntry(file)
      if (entry) {
        let content = entry.getData().toString('utf8')
        if (file.endsWith('.json')) {
          try {
            const jsonObj = JSON.parse(content)
            content = JSON.stringify(jsonObj, null, 2)
          } catch (e) {
            console.error('Error parsing JSON:', e)
          }
        }
        return `// ${file}\n${content}`
      }
      return `// ${file}\nFile not found in the ZIP archive.`
    }).join('\n\n')
    return c.json({ content: extractedContent })
  } catch (error) {
    console.error('Error in /extract:', error)
    return c.json({ error: 'Internal server error: ' + error.message }, 500)
  }
})

app.get('/uploads', (c) => {
  const files = fs.readdirSync(uploadsDir);
  return c.json(files);
});

app.delete('/upload/:filename', (c) => {
  const filename = c.req.param('filename');
  const filePath = path.join(uploadsDir, filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    return c.json({ message: 'File deleted successfully' });
  } else {
    return c.json({ error: 'File not found' }, 404);
  }
});

function buildFileStructure(entries) {
  const structure = {}
  entries.forEach(entry => {
    const path = entry.entryName.split('/')
    let current = structure
    path.forEach((part, index) => {
      if (index === path.length - 1) {
        current[part] = {
          type: 'file',
          path: entry.entryName
        }
      } else {
        if (!current[part]) {
          current[part] = {
            type: 'directory',
            children: {}
          }
        }
        current = current[part].children
      }
    })
  })
  return structure
}

serve({
  fetch: app.fetch,
  port: 3001
})

console.log('Server is running on http://msn.so:3003')
