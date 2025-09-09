const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Enable CORS for development
app.use(cors());

// Serve static assets
app.use('/assets', express.static(path.join(__dirname, 'assets'), {
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  }
}));

// Serve other static files
app.use(express.static('.', {
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  }
}));

// Basic HTML page to display theme information and assets
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Dwell - Shopify Theme Development</title>
        <link rel="stylesheet" href="/assets/base.css">
        <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
            .container { max-width: 1200px; margin: 0 auto; }
            .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
            .assets-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
            .asset-card { background: white; border: 1px solid #ddd; border-radius: 8px; padding: 15px; }
            .asset-card h3 { margin-top: 0; color: #333; }
            .asset-link { color: #007bff; text-decoration: none; }
            .asset-link:hover { text-decoration: underline; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🏪 Dwell - Shopify Theme Development Server</h1>
                <p>This is a development server for the Dwell Shopify theme. The theme files are being served for development and preview purposes.</p>
                <p><strong>Theme Version:</strong> 2.0.0 | <strong>Author:</strong> Shopify</p>
            </div>
            
            <div class="section">
                <h2>Theme Structure</h2>
                <div class="assets-grid">
                    <div class="asset-card">
                        <h3>Assets</h3>
                        <p>Static files including CSS, JavaScript, and images</p>
                        <a href="/assets/" class="asset-link">Browse Assets →</a>
                    </div>
                    
                    <div class="asset-card">
                        <h3>Templates</h3>
                        <p>Liquid template files for different page types</p>
                        <a href="/templates/" class="asset-link">View Templates →</a>
                    </div>
                    
                    <div class="asset-card">
                        <h3>Sections</h3>
                        <p>Reusable theme sections</p>
                        <a href="/sections/" class="asset-link">Browse Sections →</a>
                    </div>
                    
                    <div class="asset-card">
                        <h3>Snippets</h3>
                        <p>Reusable code snippets</p>
                        <a href="/snippets/" class="asset-link">View Snippets →</a>
                    </div>
                    
                    <div class="asset-card">
                        <h3>Configuration</h3>
                        <p>Theme settings and configuration</p>
                        <a href="/config/" class="asset-link">View Config →</a>
                    </div>
                    
                    <div class="asset-card">
                        <h3>Locales</h3>
                        <p>Translation files for internationalization</p>
                        <a href="/locales/" class="asset-link">Browse Locales →</a>
                    </div>
                </div>
            </div>
            
            <div class="section" style="margin-top: 40px;">
                <h2>Development Notes</h2>
                <p>This server provides access to all theme files for development purposes. In a production environment, this theme would be deployed to Shopify's platform.</p>
                <p>Key files and directories:</p>
                <ul>
                    <li><strong>/assets/</strong> - CSS, JS, and image files</li>
                    <li><strong>/templates/</strong> - Page templates (JSON and Liquid)</li>
                    <li><strong>/sections/</strong> - Theme sections</li>
                    <li><strong>/snippets/</strong> - Reusable code snippets</li>
                    <li><strong>/layout/</strong> - Theme layout files</li>
                    <li><strong>/config/</strong> - Theme configuration and settings</li>
                </ul>
            </div>
        </div>
        
        <!-- JavaScript modules are handled by Shopify in production -->
        <script>
          console.log('Dwell Theme Development Server Ready');
          // Theme JavaScript files use ES6 modules and are intended for Shopify's platform
          // In development mode, we're focusing on file structure and asset serving
        </script>
    </body>
    </html>
  `);
});

// Directory listing middleware for development
app.use('/', (req, res, next) => {
  if (req.path.endsWith('/')) {
    const fs = require('fs');
    const requestedPath = path.join(__dirname, req.path);
    
    if (fs.existsSync(requestedPath) && fs.statSync(requestedPath).isDirectory()) {
      try {
        const files = fs.readdirSync(requestedPath);
        const fileList = files.map(file => {
          const filePath = path.join(requestedPath, file);
          const isDirectory = fs.statSync(filePath).isDirectory();
          return `<li><a href="${req.path}${file}${isDirectory ? '/' : ''}">${file}${isDirectory ? '/' : ''}</a></li>`;
        }).join('');
        
        res.send(`
          <!DOCTYPE html>
          <html>
          <head>
              <title>Directory: ${req.path}</title>
              <style>
                  body { font-family: Arial, sans-serif; margin: 40px; }
                  ul { list-style: none; padding: 0; }
                  li { margin: 5px 0; }
                  a { color: #007bff; text-decoration: none; }
                  a:hover { text-decoration: underline; }
                  .back { margin-bottom: 20px; }
              </style>
          </head>
          <body>
              <div class="back"><a href="/">&larr; Back to Theme Overview</a></div>
              <h1>Directory: ${req.path}</h1>
              <ul>${fileList}</ul>
          </body>
          </html>
        `);
      } catch (error) {
        next();
      }
    } else {
      next();
    }
  } else {
    next();
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Dwell Theme Development Server running on http://0.0.0.0:${PORT}`);
  console.log(`📁 Serving Shopify theme files from: ${__dirname}`);
  console.log(`🎨 Theme: Dwell v2.0.0 by Shopify`);
  console.log(`🔗 Visit: http://localhost:${PORT} to view the theme`);
});