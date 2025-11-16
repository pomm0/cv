# Static server

This is a tiny Node.js static file server that serves files from the `frontend/` directory.

Usage:

Set the `PORT` environment variable (optional, defaults to 3000) and run:

```bash
cd server
PORT=3000 node index.js
```

Then open http://localhost:3000/ in your browser. The server will return files from the project's `frontend/` directory.

Notes:

- Simple Content-Type handling for common file extensions.
- Adds a Cache-Control header (1 hour).
- Prevents path traversal outside the `frontend/` directory.
