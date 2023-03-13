import { createServer, IncomingMessage, ServerResponse } from 'http';
import { promises, createReadStream } from 'fs';
import * as path from 'path';

interface MimeTypes {
    [key: string]: string;
}

const mimeTypes: MimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml'
};

const fileMW = (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    let url = req.url;
    if (url === '/') {
        url = '/index.html';
    }
    const fPath = path.resolve("public" + url);
    promises.access(fPath)
        .then(() => {
            const ext = path.extname(fPath);
            res.writeHead(200, { 'Content-Type': mimeTypes[ext] });
            createReadStream(fPath).pipe(res);
        })
        .catch(() => {
            next();
        });
};

createServer((req: IncomingMessage, res: ServerResponse) => {
    fileMW(req, res, () => { });
}).listen(3000, '127.0.0.1', () => {
    console.log("Server running at http://127.0.0.1:3000/");
});