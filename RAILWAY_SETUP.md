# 🚀 Railway Setup Guide - StillLearning

## 📋 **Langkah-langkah Setup Railway:**

### 1. **Buka Railway Dashboard**
- Buka [Railway.app](https://railway.app)
- Login dengan GitHub
- Pilih project `stilllearning`

### 2. **Pilih Service Utama (Bukan MySQL)**
- Di project, pilih service yang berisi kode aplikasi
- **JANGAN** pilih service MySQL

### 3. **Buka Tab Variables**
- Klik tab **"Variables"** di service utama
- Atau klik **"Environment"** di sidebar

### 4. **Tambahkan Environment Variables**
Klik **"New Variable"** dan tambahkan satu per satu:

```
DB_HOST=shortline.proxy.rlwy.net
DB_PORT=51846
DB_USER=root
DB_PASSWORD=rUgVruqkniZedtBpMSgzNpqfmtTzHrBU
DB_NAME=railway
NODE_ENV=production
PORT=4000
```

### 5. **Save dan Redeploy**
- Setelah semua variables ditambahkan
- Klik **"Save"**
- Railway akan otomatis redeploy

## 🔍 **Test Setup:**

### Test Environment Variables:
```
https://stilllearning-production-3b76.up.railway.app/api/env-check
```

### Test Database Connection:
```
https://stilllearning-production-3b76.up.railway.app/api/test-db
```

### Test Health Check:
```
https://stilllearning-production-3b76.up.railway.app/health
```

## ⚠️ **Troubleshooting:**

### Jika Environment Variables "NOT SET":
1. Pastikan menambahkan di **service utama** (bukan MySQL)
2. Pastikan nama variable benar (DB_HOST, bukan DBHOST)
3. Pastikan tidak ada spasi ekstra
4. Redeploy setelah menambahkan variables

### Jika Database Connection Failed:
1. Cek apakah MySQL service running
2. Cek environment variables sudah benar
3. Cek logs Railway untuk error detail

## 📱 **Lokasi di Railway Dashboard:**

```
Railway Dashboard
├── stilllearning (Project)
│   ├── stilllearning-production-3b76 (Service Utama) ← KLIK INI
│   │   ├── Variables ← TAMBAHKAN ENV VARS DI SINI
│   │   ├── Deployments
│   │   └── Logs
│   └── MySQL Database (Service Database)
```

## 🎯 **Setelah Setup Berhasil:**

- Login: `admin@stilllearning.com` / `password`
- Register: Bisa daftar user baru
- Upload Course: Bisa upload file
- Admin Approve: Bisa approve course
- Comments: Bisa tambah komentar
- File Playback: Video/audio/images bisa diputar 