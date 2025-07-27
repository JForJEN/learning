# Railway Deployment Guide - 2 Services

## Overview
Deploy StillLearning sebagai 2 service terpisah:
1. **Backend Service** - Node.js API dengan MySQL database
2. **Frontend Service** - Static React app

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

## Backend Service Setup

### 1. Deploy Backend
- Kembali ke project Railway
- Klik "New Service" → "GitHub Repo"
- Pilih repository `JForJEN/learning`
- **Root Directory**: `backend`

### 2. Configure Backend Environment Variables
- Klik service backend
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

# Frontend URL (akan diupdate setelah frontend deploy)
FRONTEND_URL=https://stilllearning-frontend-production.up.railway.app
```

### 3. Configure Backend Build Settings
- Buka tab "Settings"
- Pastikan:
  - **Build Command**: `npm install --only=production --no-package-lock`
  - **Start Command**: `npm start`
  - **Root Directory**: `backend`

## Frontend Service Setup

### 1. Deploy Frontend
- Kembali ke project Railway
- Klik "New Service" → "GitHub Repo"
- Pilih repository `JForJEN/learning`
- **Root Directory**: `frontend`

### 2. Configure Frontend Environment Variables
- Klik service frontend
- Buka tab "Variables"
- Tambahkan variables berikut:

```env
# Backend API URL
BACKEND_URL=https://stilllearning-backend-production.up.railway.app

# Port Configuration
PORT=3000
```

### 3. Configure Frontend Build Settings
- Buka tab "Settings"
- Pastikan:
  - **Build Command**: `npm install --only=production --no-package-lock`
  - **Start Command**: `npm start`
  - **Root Directory**: `frontend`

## Deployment Process

### Backend Service
1. **Database Setup**: Script akan otomatis membuat tabel dan admin user
2. **API Server**: Node.js server akan start dengan semua endpoints
3. **Health Check**: Endpoints `/`, `/test`, `/api/health` tersedia

### Frontend Service
1. **Static Files**: Serve React app dari CDN
2. **API Connection**: Connect ke backend service
3. **Health Check**: Test koneksi ke backend

## Service URLs

Setelah deployment, Anda akan mendapatkan 2 URL:
- **Backend**: `https://stilllearning-backend-production.up.railway.app`
- **Frontend**: `https://stilllearning-frontend-production.up.railway.app`

## Default Admin Login

- **Email**: admin@stilllearning.com
- **Password**: admin123

## Health Check Endpoints

### Backend Endpoints
- `/` - Root endpoint dengan status API
- `/test` - Test endpoint untuk Railway healthcheck
- `/api/health` - API health check endpoint

### Frontend Endpoints
- `/` - React app dengan koneksi ke backend
- Health check otomatis ke backend API

## Troubleshooting

### Backend Issues

#### __dirname Error
Jika mendapat error "Identifier '__dirname' has already been declared":
1. **File Conflicts**: Pastikan tidak ada file `index.js` di folder backend
2. **Module Type**: Pastikan `package.json` menggunakan `"type": "module"`
3. **Import Paths**: Pastikan semua import menggunakan ES6 syntax

#### Database Connection Issues
1. **Environment Variables**: Pastikan semua database variables sudah benar
2. **Database Service**: Pastikan MySQL service sudah running
3. **Connection**: Cek apakah bisa connect ke database

#### CORS Issues
1. **Frontend URL**: Pastikan FRONTEND_URL sudah benar
2. **CORS Configuration**: Pastikan backend mengizinkan frontend domain
3. **Port Issues**: Pastikan port 4000 tidak terblokir

### Frontend Issues
1. **Backend Connection**: Pastikan BACKEND_URL sudah benar
2. **CORS Errors**: Pastikan backend mengizinkan frontend domain
3. **Static Files**: Pastikan file index.html ada di frontend folder

### Service Communication
1. **Network Issues**: Pastikan kedua service bisa berkomunikasi
2. **Environment Variables**: Update URL setelah deployment
3. **Health Checks**: Test kedua service secara terpisah

## Monitoring

- Gunakan Railway dashboard untuk monitor:
  - **Backend**: CPU, Memory, Logs, Database connections
  - **Frontend**: CPU, Memory, Logs, Static file serving
  - **Database**: Connections, Queries, Performance

## Custom Domains (Optional)

### Backend Domain
- Di service backend, buka tab "Settings"
- Klik "Custom Domains"
- Tambahkan domain: `api.yourdomain.com`

### Frontend Domain
- Di service frontend, buka tab "Settings"
- Klik "Custom Domains"
- Tambahkan domain: `www.yourdomain.com`

## Update Environment Variables

Setelah kedua service deploy, update environment variables:

### Backend
```env
FRONTEND_URL=https://stilllearning-frontend-production.up.railway.app
```

### Frontend
```env
BACKEND_URL=https://stilllearning-backend-production.up.railway.app
```

## Benefits of 2-Service Architecture

✅ **Separation of Concerns**: Backend dan frontend terpisah  
✅ **Independent Scaling**: Bisa scale masing-masing service  
✅ **Better Performance**: Static files served lebih cepat  
✅ **Easier Debugging**: Logs terpisah untuk masing-masing service  
✅ **Flexible Deployment**: Bisa update backend tanpa frontend  
✅ **Cost Optimization**: Bisa optimize resource masing-masing service 