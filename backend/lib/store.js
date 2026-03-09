import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, "..", "data");

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function readCollection(fileName, fallback = {}) {
  ensureDataDir();
  const fullPath = path.join(DATA_DIR, fileName);

  if (!fs.existsSync(fullPath)) {
    fs.writeFileSync(fullPath, JSON.stringify(fallback, null, 2), "utf-8");
    return fallback;
  }

  try {
    const raw = fs.readFileSync(fullPath, "utf-8");
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function writeCollection(fileName, value) {
  ensureDataDir();
  const fullPath = path.join(DATA_DIR, fileName);
  fs.writeFileSync(fullPath, JSON.stringify(value, null, 2), "utf-8");
}

export function nowIso() {
  return new Date().toISOString();
}
