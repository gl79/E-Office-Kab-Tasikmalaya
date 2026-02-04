# E-Office Kabupaten Tasikmalaya

Aplikasi E-Office untuk pemerintahan Kabupaten Tasikmalaya.

## Tech Stack

### Backend
- **Framework**: Laravel 12.x
- **Language**: PHP 8.4+
- **Database**: PostgreSQL (with Compoships for complex relationships)
- **Cache/Queue**: Redis (using Predis)

### Frontend
- **Framework**: Inertia.js 2.x
- **Library**: React 18.x with TypeScript
- **Styling**: Tailwind CSS 4.0
- **Build Tool**: Vite 7.x
- **UI Components**:
  - Headless UI
  - Lucide React (Icons)
  - FullCalendar (Scheduling)

## Requirements

- PHP ^8.4
- Node.js & NPM
- PostgreSQL
- Redis

## Installation

1. **Clone Repository (Client)**:
   ```bash
   git clone <repository_url>
   cd e-office-kab-tasikmalaya
   ```

2. **Install Dependencies**:
   ```bash
   composer install
   npm install
   ```

3. **Environment Setup**:
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```
   Configure your `DB_*` and `REDIS_*` settings in `.env`.

4. **Database & Migration**:
   ```bash
   php artisan migrate --seed
   ```

5. **Build Assets**:
   ```bash
   npm run build
   ```

## Development

Start the development server (runs Laravel, Queue, and Vite concurrently):
```bash
npm run dev
```

## License

Private / Proprietary
