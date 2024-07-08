import express from "express";
import cors from "cors";
import multer from "multer";
import AdmZip from "adm-zip";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

app.get("/ping", (_req, res) => {
  return res.status(400).json({ ping: "pong!" });
});

app.post("/upload", upload.single("zipFile"), (req, res) => {
  console.log("!upload");
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const zip = new AdmZip(req.file.buffer);
  const zipEntries = zip.getEntries();

  const fileStructure = buildFileStructure(zipEntries);
  res.json({ structure: fileStructure });
});

app.post(
  "/extract",
  express.raw({ type: "application/zip", limit: "50mb" }),
  (req, res) => {
    console.log("extract");
    const zip = new AdmZip(req.body);
    console.log("!zip");
    const { files } = req.query;

    if (!files) {
      return res.status(400).json({ error: "No files specified" });
    }

    const fileList = Array.isArray(files) ? files : [files];

    const mergedContent = fileList
      .map((file) => {
        const entry = zip.getEntry(file);
        if (entry) {
          return `// ${file}\n${entry.getData().toString("utf8")}\n`;
        }
        return `// ${file}\n// File not found or couldn't be read\n`;
      })
      .join("\n");

    res.json({ content: mergedContent });
  }
);

function buildFileStructure(entries) {
  const structure = {};
  entries.forEach((entry) => {
    const parts = entry.entryName.split("/");
    let current = structure;
    parts.forEach((part, index) => {
      if (index === parts.length - 1) {
        current[part] = entry.entryName;
      } else {
        if (!current[part]) current[part] = {};
        current = current[part];
      }
    });
  });
  return structure;
}

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
