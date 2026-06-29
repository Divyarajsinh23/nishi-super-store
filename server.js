import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import multer from "multer";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5001;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json({ limit: "50mb" }));

const PRODUCTS_FILE = path.join(__dirname, "src", "products.json");
const LOCATION_FILE = path.join(__dirname, "src", "location.json");
const UPLOAD_DIR = path.join(__dirname, "public", "25_product_images");

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Multer config for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    // Generate clean filename
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

const upload = multer({ storage });

// API: Get all products
app.get("/api/products", (req, res) => {
  try {
    if (!fs.existsSync(PRODUCTS_FILE)) {
      return res.status(404).json({ error: "Products file not found" });
    }
    const data = fs.readFileSync(PRODUCTS_FILE, "utf-8");
    res.json(JSON.parse(data));
  } catch (err) {
    console.error("Error reading products:", err);
    res.status(500).json({ error: "Failed to read products data" });
  }
});

// API: Update all products
app.post("/api/products", (req, res) => {
  try {
    const products = req.body;
    if (!Array.isArray(products)) {
      return res.status(400).json({ error: "Invalid data format. Expected an array of products." });
    }
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2), "utf-8");
    console.log(`[SUCCESS] Products updated. Count: ${products.length}`);
    res.json({ message: "Products updated successfully", count: products.length });
  } catch (err) {
    console.error("Error writing products:", err);
    res.status(500).json({ error: "Failed to save products data" });
  }
});

// API: Get location settings
app.get("/api/location", (req, res) => {
  try {
    if (!fs.existsSync(LOCATION_FILE)) {
      return res.status(404).json({ error: "Location file not found" });
    }
    const data = fs.readFileSync(LOCATION_FILE, "utf-8");
    res.json(JSON.parse(data));
  } catch (err) {
    console.error("Error reading location:", err);
    res.status(500).json({ error: "Failed to read location data" });
  }
});

// API: Update location settings
app.post("/api/location", (req, res) => {
  try {
    const location = req.body;
    if (!location || typeof location !== "object") {
      return res.status(400).json({ error: "Invalid location data" });
    }
    fs.writeFileSync(LOCATION_FILE, JSON.stringify(location, null, 2), "utf-8");
    console.log(`[SUCCESS] Location settings updated.`);
    res.json({ message: "Location updated successfully" });
  } catch (err) {
    console.error("Error writing location:", err);
    res.status(500).json({ error: "Failed to save location data" });
  }
});

// API: Handle single product image upload
app.post("/api/upload", upload.single("image"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file provided" });
    }
    const relativeUrl = `/25_product_images/${req.file.filename}`;
    console.log(`[SUCCESS] Image uploaded: ${relativeUrl}`);
    res.json({ url: relativeUrl });
  } catch (err) {
    console.error("Error uploading image:", err);
    res.status(500).json({ error: "Failed to process image upload" });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`=============================================`);
  console.log(`  Backend Express server running dynamically  `);
  console.log(`  Local URL:   http://localhost:${PORT}        `);
  console.log(`  Network:     http://0.0.0.0:${PORT}          `);
  console.log(`=============================================`);
});
