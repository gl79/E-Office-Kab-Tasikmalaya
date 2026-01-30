# E-Office Kabupaten Tasikmalaya

Aplikasi E-Office untuk pemerintahan Kabupaten Tasikmalaya.

## Tech Stack

- **Backend**: Laravel 12
- **Frontend**: Inertia.js + React 18
- **Database**: PostgreSQL
- **Cache/Queue**: Redis

## Requirements

- PHP ^8.4
- Node.js & NPM
- PostgreSQL
- Redis

## Installation

1. Client Repository:

   ```bash
   git clone <repository_url>
   cd e-office-kab-tasikmalaya
   ```

2. Install Dependencies:

   ```bash
   composer install
   npm install
   ```

3. Environment Setup:

   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

   Configure your database and redis settings in `.env`.

4. Database Migration:

   ```bash
   php artisan migrate --seed
   ```

5. Build Frontend:

   ```bash
   npm run build
   ```

## Development

Start the development server:

```bash
npm run dev
```

## License

Private / Proprietary
