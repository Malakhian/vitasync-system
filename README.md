# VitaSync-Nxt

Build and deployment helper instructions.

Build locally:

```bash
npm install
npm run build
```

Serve with Docker:

```bash
docker build -t vitasync-nxt .
docker run -p 8080:80 vitasync-nxt
# then open http://localhost:8080
```

Deploy to GitHub Pages:

- Push to `main` branch. The included GitHub Actions workflow will build and publish the `dist` folder to GitHub Pages.
