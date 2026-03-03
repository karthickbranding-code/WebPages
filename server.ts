import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("repbox.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS reports (
    id TEXT PRIMARY KEY,
    sender TEXT,
    title TEXT,
    content TEXT,
    type TEXT,
    priority TEXT,
    status TEXT,
    tags TEXT,
    metadata TEXT,
    is_starred INTEGER DEFAULT 0,
    is_archived INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Key Middleware (Simple simulation)
  const validateApiKey = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const apiKey = req.headers["x-api-key"];
    if (!apiKey || apiKey !== "yoda-edge-secret-key") {
      return res.status(401).json({ error: "Unauthorized: Invalid API Key" });
    }
    next();
  };

  // API Routes
  app.get("/api/reports", (req, res) => {
    const reports = db.prepare("SELECT * FROM reports ORDER BY created_at DESC").all();
    res.json(reports);
  });

  app.post("/api/reports", validateApiKey, (req, res) => {
    const { id, sender, title, content, type, priority, status, tags, metadata } = req.body;
    try {
      const stmt = db.prepare(`
        INSERT INTO reports (id, sender, title, content, type, priority, status, tags, metadata)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(id, sender, title, content, type, priority, status, JSON.stringify(tags), metadata ? JSON.stringify(metadata) : null);
      res.status(201).json({ message: "Report saved successfully" });
    } catch (error) {
      console.error("Save error:", error);
      res.status(500).json({ error: "Failed to save report" });
    }
  });

  app.delete("/api/reports/:id", (req, res) => {
    const { id } = req.params;
    try {
      db.prepare("DELETE FROM reports WHERE id = ?").run(id);
      res.json({ message: "Report deleted permanently" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete report" });
    }
  });

  app.patch("/api/reports/:id", (req, res) => {
    const { id } = req.params;
    const { is_starred, is_archived } = req.body;
    
    if (is_starred !== undefined) {
      db.prepare("UPDATE reports SET is_starred = ? WHERE id = ?").run(is_starred ? 1 : 0, id);
    }
    if (is_archived !== undefined) {
      db.prepare("UPDATE reports SET is_archived = ? WHERE id = ?").run(is_archived ? 1 : 0, id);
    }
    
    res.json({ message: "Report updated" });
  });

  // Seed initial data if empty
  const count = db.prepare("SELECT COUNT(*) as count FROM reports").get() as { count: number };
  if (count.count === 0) {
    const initialReports = [
      { 
        id: '1', 
        sender: 'AWS Cloud Data', 
        title: 'Cloud Sync Report', 
        content: 'Your Data Successfully Uploaded! at AWS Cloud Account No.2309AB. Sync completed for 1.2TB of industrial telemetry.', 
        type: 'Data Bridge', 
        priority: 'Normal', 
        status: 'Read', 
        tags: ['Cloud', 'Sync'],
        metadata: JSON.stringify({ file_type: 'Excel', file_name: 'cloud_sync_log_march.xlsx' })
      },
      { 
        id: '2', 
        sender: 'Rockwell Automat', 
        title: 'Predictive Maintenance', 
        content: 'Machine No.23AB bearing seems unusual, >450RPM. Vibration analysis indicates potential cage failure. Immediate inspection recommended.', 
        type: 'Predict AI', 
        priority: 'High', 
        status: 'Unread', 
        tags: ['Predict AI', 'Urgent'],
        metadata: JSON.stringify({ machine_id: 'M-23AB', location: 'Floor 3, Section B', dashboard_url: 'https://dashboard.yodaedge.ai/m23ab' })
      },
      { 
        id: '3', 
        sender: 'Packaging Machine', 
        title: 'Production Summary', 
        content: 'Completed! Successfully Packed and Despatched 576 Cartons | LR No.87ARCNo.210#. All targets met for Shift A.', 
        type: 'System', 
        priority: 'Normal', 
        status: 'Read', 
        tags: ['Production', 'Shift A'],
        metadata: JSON.stringify({ file_type: 'Excel', file_name: 'production_summary_shift_a.csv' })
      },
      { 
        id: '4', 
        sender: 'Camera 012', 
        title: 'Security Alert', 
        content: 'Queue Management System Reports - Unusual Activities detected near the loading dock at 03:45 AM.', 
        type: 'Alert', 
        priority: 'High', 
        status: 'Unread', 
        tags: ['Security', 'Dock'],
        metadata: JSON.stringify({ alert_type: 'Motion Detection', clip_id: 'CAM012-3456' })
      },
      { 
        id: '5', 
        sender: 'Jedi Master Yoda', 
        title: 'Voice Announcement', 
        content: 'Patience you must have, my young Padawan. The production line, stable it is. But a disturbance in the energy grid, I feel.', 
        type: 'Voice', 
        priority: 'Normal', 
        status: 'Unread', 
        tags: ['Jedi', 'Announcement'],
        metadata: JSON.stringify({ audio_url: 'https://www.soundboard.com/handler/DownLoadTrack.ashx?cliptitle=Patience+you+must+have&filename=mt/MTI5NzY0MTI5NzY0MTY0_Patience_you_must_have.mp3', duration: '0:15' })
      },
      { 
        id: '6', 
        sender: 'Maintenance Bot', 
        title: 'Weekly Health Check', 
        content: 'All systems operational. Minor wear detected on Conveyor Belt 4. Scheduled for replacement in 14 days.', 
        type: 'System', 
        priority: 'Low', 
        status: 'Read', 
        tags: ['Maintenance', 'Routine'],
        metadata: JSON.stringify({ file_type: 'PDF', file_name: 'weekly_health_report.pdf' })
      },
      { 
        id: '7', 
        sender: 'Jedi Master Obi-Wan', 
        title: 'Voice Directive', 
        content: 'The Force will be with you, always. Remember to check the cooling systems in Sector 7G. I sense a disturbance in the thermal readings.', 
        type: 'Voice', 
        priority: 'High', 
        status: 'Unread', 
        tags: ['Jedi', 'Thermal'],
        metadata: JSON.stringify({ audio_url: 'https://www.soundboard.com/handler/DownLoadTrack.ashx?cliptitle=The+Force+will+be+with+you&filename=mt/MTI5NzY0MTI5NzY0MTY0_The_Force_will_be_with_you.mp3', duration: '0:12' })
      },
      { 
        id: '8', 
        sender: 'Quality Control AI', 
        title: 'Batch Analysis Dashboard', 
        content: 'Batch #992 analysis complete. 99.8% accuracy achieved. View the real-time quality metrics on the dashboard.', 
        type: 'Data Bridge', 
        priority: 'Normal', 
        status: 'Read', 
        tags: ['Quality', 'Batch'],
        metadata: JSON.stringify({ dashboard_url: 'https://dashboard.yodaedge.ai/quality/batch992', machine_id: 'QC-01' })
      },
      { 
        id: '9', 
        sender: 'Energy Grid Monitor', 
        title: 'Critical Power Alert', 
        content: 'Voltage drop detected in Substation Alpha. Switching to backup generators. Estimated runtime: 4 hours.', 
        type: 'Alert', 
        priority: 'High', 
        status: 'Unread', 
        tags: ['Power', 'Emergency'],
        metadata: JSON.stringify({ alert_type: 'Voltage Drop', location: 'Substation Alpha' })
      },
      { 
        id: '10', 
        sender: 'Inventory System', 
        title: 'Stock Level Excel', 
        content: 'Raw material stock levels for April are attached. Reorder required for Silicon Wafers.', 
        type: 'System', 
        priority: 'Normal', 
        status: 'Read', 
        tags: ['Inventory', 'Stock'],
        metadata: JSON.stringify({ file_type: 'Excel', file_name: 'inventory_levels_april.xlsx' })
      }
    ];

    const insert = db.prepare(`
      INSERT INTO reports (id, sender, title, content, type, priority, status, tags, metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const r of initialReports) {
      insert.run(r.id, r.sender, r.title, r.content, r.type, r.priority, r.status, JSON.stringify(r.tags), r.metadata || null);
    }
  }

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
