'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const port = process.env.PORT || 1337;
const contentTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    // Add image file content types
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};
http.createServer(function (req, res) {
    console.log(`Request received: ${req.url}`);
    // Handle root request
    let filePath = req.url === '/' ? './index.html' : '.' + req.url;
    // Remove any query parameters
    filePath = filePath.split('?')[0];
    // Get file extension
    const extname = path.extname(filePath).toLowerCase();
    const contentType = contentTypes[extname] || 'text/plain';
    // Read the file
    fs.readFile(filePath, function (error, content) {
        if (error) {
            if (error.code === 'ENOENT') {
                console.error(`File not found: ${filePath}`);
                res.writeHead(404);
                res.end('File not found');
            } else {
                console.error(`Server error: ${error.code}`);
                res.writeHead(500);
                res.end(`Server error: ${error.code}`);
            }
        } else {
            console.log(`Serving: ${filePath} as ${contentType}`);
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
}).listen(port);
console.log(`Server running at http://localhost:${port}/`);