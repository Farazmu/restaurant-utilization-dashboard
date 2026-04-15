import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

function xlsxReaderPlugin() {
  return {
    name: 'xlsx-reader',
    configureServer(server) {
      server.middlewares.use('/__read-xlsx', (req, res) => {
        try {
          const filePath = 'C:/Users/FarazMustafa/Downloads/Restaurant Health Framework.xlsx';
          const buf = fs.readFileSync(filePath);
          const base64 = buf.toString('base64');
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ ok: true, base64, size: buf.length }));
        } catch (e) {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ ok: false, error: e.message }));
        }
      });
    }
  }
}

export default defineConfig({
  plugins: [react(), xlsxReaderPlugin()],
})
