# Frontend (Vite + React)

## Run Locally

1. Install dependencies:

```bash
npm install
```

2. Ensure local environment variables exist in frontend/.env:

```dotenv
VITE_API_URL=http://127.0.0.1:8000/api
VITE_BACKEND_URL=http://127.0.0.1:8000
```

3. Start dev server:

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Azure Static Web Apps

Set this production variable in Azure Static Web Apps:

```dotenv
VITE_API_URL=https://yourapi.azurewebsites.net/api
VITE_BACKEND_URL=https://yourapi.azurewebsites.net
```

The frontend will use VITE_API_URL for API calls and VITE_BACKEND_URL for storage assets.
