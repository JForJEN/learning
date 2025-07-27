# Railway Deployment Guide

## Setup Railway Project

### 1. Create Railway Account
- Buka [railway.app](https://railway.app)
- Login dengan GitHub account (JForJEN)

### 2. Create New Project
- Klik "New Project"
- Pilih "Deploy from GitHub repo"
- Pilih repository `JForJEN/learning`

## Database Setup

### 1. Add MySQL Database
- Di project Railway, klik "New Service"
- Pilih "Database" → "MySQL"
- Railway akan otomatis membuat database MySQL

### 2. Get Database Variables
- Klik service MySQL
- Buka tab "Variables"
- Catat semua environment variables:
  - `MYSQL_HOST`
  - `MYSQL_USER`
  - `MYSQL_PASSWORD`
  - `MYSQL_DATABASE`
  - `MYSQL_PORT`

## Application Setup

### 1. Deploy Application
- Kembali ke project Railway
- Klik "New Service" → "GitHub Repo"
- Pilih repository `JForJEN/learning`

### 2. Configure Environment Variables
- Klik service aplikasi
- Buka tab "Variables"
- Tambahkan variables berikut:

```env
# Database Configuration
DB_HOST=${{MySQL.MYSQL_HOST}}
DB_USER=${{MySQL.MYSQL_USER}}
DB_PASSWORD=${{MySQL.MYSQL_PASSWORD}}
DB_NAME=${{MySQL.MYSQL_DATABASE}}
DB_PORT=${{MySQL.MYSQL_PORT}}

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-here

# Port Configuration
PORT=4000

# Node Environment
NODE_ENV=production
```

### 3. Configure Build Settings
- Buka tab "Settings"
- Pastikan:
  - **Build Command**: `npm install && npm run build`
  - **Start Command**: `npm start`
  - **Root Directory**: `/` (kosongkan)

## Deployment Process

1. **Database Setup**: Script akan otomatis membuat tabel dan admin user
2. **Build Process**: Vite akan build React app
3. **Start Process**: Node.js server akan start dengan database setup

## Default Admin Login

- **Email**: admin@stilllearning.com
- **Password**: admin123

## Troubleshooting

### Vite/Rollup Build Errors
Jika mendapat error "Cannot find module @rollup/rollup-linux-x64-musl":
1. **Solusi 1**: Gunakan Dockerfile deployment
   - Railway akan otomatis detect Dockerfile
   - Build process lebih reliable

2. **Solusi 2**: Manual build fix
   - Tambahkan `.npmrc` file dengan `optional=false`
   - Gunakan `npm ci` instead of `npm install`

3. **Solusi 3**: Switch to Docker deployment
   - Di Railway settings, pilih "Dockerfile" deployment
   - Redeploy project

### Nixpacks Build Errors
Jika mendapat error "undefined variable 'npm'":
1. Pastikan file `nixpacks.toml` ada dan benar
2. Coba redeploy project
3. Jika masih error, gunakan Dockerfile sebagai alternatif

### Database Connection Issues
- Pastikan environment variables database sudah benar
- Cek log Railway untuk error koneksi

### Build Issues
- Pastikan semua dependencies ada di package.json
- Cek log build untuk error
- Pastikan Node.js version compatible (20.x)

### Runtime Issues
- Cek log aplikasi untuk error
- Pastikan port configuration benar
- Pastikan database service running

## Alternative Deployment Methods

### Method 1: Nixpacks (Recommended)
- Gunakan file `nixpacks.toml` yang sudah disediakan
- Railway akan otomatis detect dan gunakan konfigurasi ini

### Method 2: Dockerfile (Most Reliable)
Jika ada build issues, gunakan Dockerfile:
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json .npmrc ./
RUN npm ci --only=production
RUN npm install --only=dev
COPY . .
RUN npm run build
RUN npm prune --production
RUN mkdir -p uploads
EXPOSE 4000
CMD ["npm", "start"]
```

## Monitoring

- Gunakan Railway dashboard untuk monitor:
  - CPU usage
  - Memory usage
  - Network traffic
  - Logs

## Custom Domain (Optional)

- Di service aplikasi, buka tab "Settings"
- Klik "Custom Domains"
- Tambahkan domain Anda
- Update DNS records sesuai instruksi Railway 