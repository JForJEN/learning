# StillLearning - Platform Kursus Terbuka

Platform pembelajaran online yang memungkinkan pengguna untuk berbagi dan mengakses kursus.

## 🚀 Deployment di Railway

### Struktur Service:
- **1 Service Utama**: Frontend + Backend (terpadu)
- **1 Service Database**: MySQL (terpisah)

### Langkah-langkah Deployment:

1. **Fork/Clone repository ini ke GitHub**

2. **Setup di Railway:**
   - Buka [Railway.app](https://railway.app)
   - Login dengan GitHub
   - Klik "New Project"
   - Pilih "Deploy from GitHub repo"
   - Pilih repository ini

3. **Setup Database Service:**
   - Di Railway dashboard, klik "New"
   - Pilih "Database" → "MySQL"
   - Setelah database dibuat, copy connection details

4. **Setup Environment Variables di Service Utama:**
   Di Railway project settings, tambahkan environment variables:
   ```
   DB_HOST=mysql.railway.internal
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=rUgVruqkniZedtBpMSgzNpqfmtTzHrBU
   DB_NAME=railway
   NODE_ENV=production
   PORT=4000
   ```

5. **Setup Database Schema:**
   - Buka Railway MySQL database
   - Jalankan script dari file `database_setup.sql`

6. **Deploy:**
   - Railway akan otomatis build dan deploy
   - Tunggu hingga status "Deployed"

### 🔧 Troubleshooting:

**Jika website tidak muncul:**
1. Cek Railway logs untuk error
2. Pastikan environment variables sudah benar
3. Pastikan database sudah ter-setup
4. Cek apakah port sudah benar (Railway akan set PORT otomatis)

**Jika API error:**
1. Cek database connection
2. Pastikan semua tables sudah dibuat
3. Cek CORS settings

### 📁 File Konfigurasi Penting:

- `nixpacks.toml` - Konfigurasi build Railway
- `railway.json` - Konfigurasi deployment
- `Procfile` - Command start production
- `backend/index.js` - Server utama
- `vite.config.js` - Konfigurasi Vite

### 🌐 URL Production:

Setelah deploy berhasil, Railway akan memberikan URL seperti:
`https://your-app-name.up.railway.app`

## 🛠️ Development Local

```bash
# Install semua dependencies
npm run install:all

# Setup database
# Import database_setup.sql ke MySQL

# Setup .env di root directory
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=stilllearning

# Run development (frontend + backend)
npm run dev
```

## 📝 Fitur:

- ✅ User Authentication (Login/Register)
- ✅ Course Management
- ✅ File Upload (Audio/Video)
- ✅ Admin Dashboard
- ✅ Comments System
- ✅ Responsive Design
- ✅ Railway Deployment Ready (Service Terpadu)
