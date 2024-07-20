import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { cors } from 'hono/cors'
import { serveStatic } from "@hono/node-server/serve-static";
import AdmZip from 'adm-zip'
import { exec } from 'child_process'
import fs from 'fs'
import path from 'path'
import os from 'os'
import util from 'util'

const execPromise = util.promisify(exec);

const app = new Hono()

app.use('/*', cors())
app.use("/", serveStatic({ root: "./public" }));

async function fetchFileFromUrl(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return await response.arrayBuffer();
}

async function fetchFromGitHub(url, branch = 'main') {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'github-'));
  try {
    console.log(`Cloning repository: ${url}, branch: ${branch}`);
    const { stdout, stderr } = await execPromise(`git clone --depth 1 --branch ${branch} ${url} ${tempDir}`, { timeout: 60000 });
    console.log('Clone stdout:', stdout);
    if (stderr) console.error('Clone stderr:', stderr);
    
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
  } catch (error) {
    console.error('Error in fetchFromGitHub:', error);
    throw new Error(`Failed to clone repository: ${error.message}`);
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
    if (file) {
      buffer = await file.arrayBuffer()
    } else if (url) {
      if (url.includes('github.com')) {
        buffer = await fetchFromGitHub(url, branch);
      } else {
        buffer = await fetchFileFromUrl(url);
      }
    } else {
      return c.json({ error: 'No file or URL provided' }, 400)
    }

    const zip = new AdmZip(Buffer.from(buffer))
    const zipEntries = zip.getEntries()
    const fileStructure = buildFileStructure(zipEntries)
    return c.json(fileStructure)
  } catch (error) {
    console.error('Error in /upload:', error)
    return c.json({ error: 'Internal server error: ' + error.message }, 500)
  }
})

app.post('/extract', async (c) => {
  try {
    const formData = await c.req.formData()
    const filesString = formData.get('files')
    const file = formData.get('zipFile')
    const url = formData.get('url')
    const branch = formData.get('branch') || 'main'
    const includeFileStructure = formData.get('includeFileStructure') === 'true'
    
    if ((!file && !url) || !filesString) return c.json({ error: 'Missing file/URL or file list' }, 400)
    const files = JSON.parse(filesString)

    let buffer;
    if (file) {
      buffer = await file.arrayBuffer()
    } else if (url) {
      if (url.includes('github.com')) {
        buffer = await fetchFromGitHub(url, branch);
      } else {
        buffer = await fetchFileFromUrl(url);
      }
    }

    const zip = new AdmZip(Buffer.from(buffer))
    const zipEntries = zip.getEntries()
    const fileStructure = buildFileStructure(zipEntries)

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

    let responseContent = extractedContent;
    if (includeFileStructure) {
      const structureText = getFileStructureText(fileStructure);
      responseContent = `File Structure:\n${structureText}\n\nFile Contents:\n${extractedContent}`;
    }

    return c.json({ content: responseContent })
  } catch (error) {
    console.error('Error in /extract:', error)
    return c.json({ error: 'Internal server error: ' + error.message }, 500)
  }
})

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

function getFileStructureText(structure, indent = '') {
  let text = '';
  for (const [name, item] of Object.entries(structure)) {
    if (item.type === 'file') {
      text += `${indent}${name}\n`;
    } else {
      text += `${indent}${name}/\n`;
      text += getFileStructureText(item.children, indent + '  ');
    }
  }
  return text;
}

// Start the server
const port = process.env.PORT || 3000;
serve({
  fetch: app.fetch,
  port
})

console.log(`Server is running on http://localhost:${port}`)