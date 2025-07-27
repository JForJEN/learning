# StillLearning - Platform Kursus Terbuka

Platform pembelajaran online yang memungkinkan pengguna untuk berbagi dan mengakses kursus.

## 🚀 Deployment ke Railway

### Persiapan

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Setup Database**
   - Buat database MySQL di Railway atau provider lain
   - Jalankan script setup database:
   ```bash
   npm run setup-db
   ```

### Environment Variables

Buat file `.env` dengan variabel berikut:

```env
# Database Configuration
DB_HOST=your-database-host
DB_USER=your-database-user
DB_PASSWORD=your-database-password
DB_NAME=your-database-name
DB_PORT=3306

# Server Configuration
PORT=4000
NODE_ENV=production
```

### Railway Deployment

1. **Connect ke Railway**
   - Install Railway CLI: `npm i -g @railway/cli`
   - Login: `railway login`
   - Link project: `railway link`

2. **Setup Environment Variables di Railway**
   - Buka dashboard Railway
   - Tambahkan environment variables yang diperlukan
   - Pastikan `NODE_ENV=production`

3. **Deploy**
   ```bash
   railway up
   ```

### Scripts

- `npm run dev` - Development mode (frontend only)
- `npm run dev:full` - Development mode (frontend + backend)
- `npm run build` - Build React app untuk production
- `npm run start` - Start production server
- `npm run setup-db` - Setup database

### Struktur Project

```
stilllearning/
├── server.js          # Unified Express server
├── package.json       # Dependencies & scripts
├── vite.config.js     # Vite configuration
├── railway.json       # Railway configuration
├── dist/              # Built React app (generated)
├── uploads/           # Uploaded files
├── components/        # React components
├── pages/            # React pages
├── context/          # React context
└── backend/          # Database setup scripts
```

### Fitur

- ✅ User authentication (login/register)
- ✅ Course management
- ✅ File uploads
- ✅ Comments system
- ✅ Admin dashboard
- ✅ Responsive design

### Database Schema

Pastikan database memiliki tabel berikut:
- `users` - User accounts
- `courses` - Course data
- `comments` - Course comments

Jalankan `npm run setup-db` untuk membuat tabel secara otomatis. 