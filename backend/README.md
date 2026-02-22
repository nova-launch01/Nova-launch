# Nova Backend API

Backend API for the Nova token deployment platform. Built with Next.js 14+ App Router, Stellar SDK, and Prisma.

## Prerequisites

- **Node.js** 18+ (20+ recommended)
- **npm** 9+

## Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment**

   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` and fill in the required values. See [Environment Variables](#environment-variables) below.

3. **Initialize the database**

   ```bash
   npm run db:generate
   npm run db:push
   ```

4. **Run the development server**

   ```bash
   npm run dev
   ```

   The API will be available at [http://localhost:3001](http://localhost:3001).

## Scripts

| Script          | Description                          |
| --------------- | ------------------------------------ |
| `npm run dev`   | Start development server (port 3001) |
| `npm run build` | Build for production                 |
| `npm run start` | Start production server              |
| `npm run lint`  | Run ESLint                           |
| `npm run format`| Format code with Prettier            |
| `npm run format:check` | Check formatting with Prettier |
| `npm run test`  | Run tests                            |
| `npm run db:generate` | Generate Prisma Client           |
| `npm run db:push`     | Push schema to database          |
| `npm run db:studio`   | Open Prisma Studio              |

## Environment Variables

| Variable                | Description                         | Example                                  |
| ----------------------- | ----------------------------------- | ---------------------------------------- |
| `DATABASE_URL`          | Prisma database connection string   | `file:./dev.db`                           |
| `STELLAR_NETWORK`       | Stellar network (testnet/mainnet)   | `testnet`                                 |
| `STELLAR_HORIZON_URL`   | Stellar Horizon API URL             | `https://horizon-testnet.stellar.org`     |
| `STELLAR_SOROBAN_RPC_URL` | Soroban RPC URL                   | `https://soroban-testnet.stellar.org`     |
| `FACTORY_CONTRACT_ID`   | Token factory contract ID           |                                          |
| `IPFS_API_KEY`          | IPFS API key (optional)             |                                          |
| `IPFS_API_SECRET`       | IPFS API secret (optional)          |                                          |
| `PINATA_API_KEY`        | Pinata API key for IPFS             |                                          |
| `PINATA_API_SECRET`     | Pinata API secret for IPFS          |                                          |
| `JWT_SECRET`            | Secret for JWT signing              |                                          |
| `CORS_ORIGIN`           | Allowed CORS origin                 | `http://localhost:5173`                   |

## API Routes

| Endpoint      | Method | Description        |
| ------------- | ------ | ------------------ |
| `/api/health` | GET    | Health check       |
| `/api/tokens` | GET    | Token operations   |
| `/api/burn`   | POST   | Burn tokens        |
| `/api/metadata` | GET  | Token metadata     |
| `/api/metadata/upload` | POST | Upload metadata and image to IPFS |
| `/api/metadata/[cid]` | GET | Retrieve metadata from IPFS |

## Metadata API

### POST /api/metadata/upload

Upload metadata and image to IPFS.

**Body (FormData):**
- `name` (string, required): Token name
- `symbol` (string, required): Token symbol
- `decimals` (number, required): Token decimals
- `description` (string, optional): Token description
- `image` (File, optional): Token image (max 5MB, JPEG/PNG/GIF/WebP)
- `properties` (JSON string, optional): Additional metadata

**Response:**
```json
{
  "success": true,
  "cid": "QmXyZ..."
}
```

### GET /api/metadata/[cid]

Retrieve metadata from IPFS.

**Response:**
```json
{
  "success": true,
  "data": {
    "name": "Token Name",
    "symbol": "TKN",
    "description": "...",
    "image": "ipfs://...",
    "decimals": 18,
    "properties": {}
  }
}
```

## Features

- ✅ File size validation (max 5MB)
- ✅ Image type validation (JPEG, PNG, GIF, WebP)
- ✅ Metadata format validation
- ✅ IPFS upload via Pinata
- ✅ Response caching (1 hour)
- ✅ Error handling
- ✅ Stellar integration
- ✅ Database with Prisma

## Project Structure

```
backend/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── app/
│   │   └── api/          # API routes
│   │       ├── health/
│   │       ├── tokens/
│   │       ├── burn/
│   │       └── metadata/ # Metadata management
│   ├── lib/
│   │   ├── stellar/      # Stellar SDK integration
│   │   ├── database/     # Prisma client
│   │   ├── ipfs/         # IPFS/Pinata integration
│   │   ├── validation/   # Validators
│   │   └── utils/        # Shared utilities
│   ├── types/            # TypeScript types
│   └── middleware.ts
├── .env.example
└── package.json
```
