# StillLearning - Platform Edukasi Terbuka

StillLearning adalah platform edukasi berbasis web yang memungkinkan pengguna untuk berbagi dan mengakses materi pembelajaran dalam berbagai format. Platform ini dibangun dengan React.js untuk frontend dan Node.js dengan Express untuk backend, menggunakan MySQL sebagai database.

## 🚀 Fitur Utama

### Untuk Pengguna Umum (Guest)
- ✅ Melihat thumbnail dan preview materi edukasi
- ✅ Mencari dan menjelajahi kursus yang tersedia
- ✅ Melihat komentar dan diskusi (tanpa bisa berkomentar)

### Untuk Pengguna Terdaftar
- ✅ Register dan Login dengan sistem autentikasi
- ✅ Upload materi edukasi (artikel, video, audio, gambar, PDF)
- ✅ Berpartisipasi dalam diskusi dengan sistem komentar hierarkis
- ✅ Melihat riwayat upload materi
- ✅ Update profil pengguna

### Untuk Admin
- ✅ Panel admin terpadu dengan statistik
- ✅ Approval/rejection sistem untuk materi yang diupload
- ✅ Manajemen pengguna (view, delete)
- ✅ Dashboard dengan statistik real-time

## 🛠️ Teknologi yang Digunakan

### Frontend
- **React.js 19.1.0** - Framework UI
- **React Router DOM 7.7.1** - Routing
- **Tailwind CSS** - Styling
- **Vite** - Build tool

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MySQL** - Database
- **bcrypt** - Password hashing
- **multer** - File upload handling

### Deployment
- **Railway.app** - Platform deployment
- **MySQL** - Database hosting

## 📋 Persyaratan Sistem

- Node.js 18+ 
- MySQL 8.0+
- NPM atau Yarn

## 🚀 Cara Menjalankan Proyek

### 1. Clone Repository
```bash
git clone <repository-url>
cd stilllearning
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Database
```bash
# Import database schema
mysql -u root -p < database_setup.sql
```

### 4. Konfigurasi Environment
Buat file `.env` di root directory:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=stilllearning_db
DB_PORT=3306
PORT=4000
NODE_ENV=development
```

### 5. Jalankan Development Server
```bash
# Development mode (frontend + backend)
npm run dev

# Atau jalankan terpisah:
# Terminal 1 - Frontend
npm run dev

# Terminal 2 - Backend  
npm start
```

### 6. Build untuk Production
```bash
npm run build
npm start
```

## 📁 Struktur Proyek

```
stilllearning/
├── components/          # React components
│   ├── Header.js       # Navigation header
│   ├── Footer.js       # Footer component
│   ├── CourseCard.js   # Course display card
│   ├── Comment.js      # Comment component
│   ├── CommentSection.js # Comment section
│   ├── ProtectedRoute.js # Route protection
│   └── Icons.js        # SVG icons
├── pages/              # Page components
│   ├── HomePage.jsx    # Homepage
│   ├── LoginPage.jsx   # Login page
│   ├── RegisterPage.jsx # Register page
│   ├── CourseDetailPage.jsx # Course detail
│   ├── SubmitCoursePage.jsx # Submit course
│   ├── AdminDashboardPage.jsx # Admin dashboard
│   └── ProfilePage.jsx # User profile
├── context/            # React context
│   └── AuthContext.js  # Authentication context
├── uploads/            # Uploaded files
├── database/           # Database files
├── server.js           # Express server
├── database_setup.sql  # Database schema
├── package.json        # Dependencies
├── vite.config.js      # Vite configuration
└── README.md           # Documentation
```

## 🔐 Sistem Autentikasi

### Default Login Credentials
- **Admin**: admin@stilllearning.com / password
- **User**: john@example.com / password
- **User**: jane@example.com / password
- **User**: bob@example.com / password

### Role-based Access Control
- **Guest**: Hanya bisa melihat materi
- **User**: Bisa upload, komentar, update profil
- **Admin**: Akses penuh ke semua fitur

## 📊 Database Schema

### Tabel Users
- `id` - Primary key
- `name` - Nama pengguna
- `email` - Email (unique)
- `password` - Password (hashed)
- `role` - Role (user/admin)
- `phone` - Nomor telepon
- `address` - Alamat
- `created_at` - Timestamp

### Tabel Courses
- `id` - Primary key
- `title` - Judul kursus
- `description` - Deskripsi
- `content` - Konten artikel
- `contentType` - Tipe konten (article/video/audio/image/pdf)
- `author_id` - Foreign key ke users
- `isPublished` - Status approval
- `fileName` - Nama file
- `fileSize` - Ukuran file
- `fileType` - Tipe file
- `filePath` - Path file

### Tabel Comments
- `id` - Primary key
- `text` - Teks komentar
- `author_id` - Foreign key ke users
- `course_id` - Foreign key ke courses
- `parent_id` - Foreign key untuk reply
- `created_at` - Timestamp

## 🌐 API Endpoints

### Authentication
- `POST /api/login` - User login
- `POST /api/register` - User registration
- `PUT /api/users/:id` - Update profile

### Courses
- `GET /api/courses` - Get published courses
- `GET /api/courses/pending` - Get pending courses (admin)
- `GET /api/courses/:id` - Get single course with comments
- `POST /api/courses` - Create new course
- `PUT /api/courses/:id/approve` - Approve course (admin)
- `DELETE /api/courses/:id` - Reject course (admin)

### Comments
- `POST /api/courses/:courseId/comments` - Add comment

### Admin
- `GET /api/admin/users` - Get all users
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/stats` - Get statistics

## 🎨 UI/UX Features

### Responsive Design
- ✅ Mobile-first approach
- ✅ Responsive untuk semua device
- ✅ Dark theme yang nyaman di mata

### User Experience
- ✅ Loading states
- ✅ Error handling
- ✅ Form validation
- ✅ File upload preview
- ✅ Real-time feedback

### Accessibility
- ✅ Semantic HTML
- ✅ Keyboard navigation
- ✅ Screen reader friendly
- ✅ High contrast colors

## 🚀 Deployment di Railway

### 1. Setup Railway Project
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login ke Railway
railway login

# Link ke project Railway
railway link
```

### 2. Environment Variables
Set environment variables di Railway dashboard:
- `DB_HOST` - MySQL host
- `DB_USER` - MySQL username
- `DB_PASSWORD` - MySQL password
- `DB_NAME` - Database name
- `DB_PORT` - MySQL port
- `NODE_ENV` - production

### 3. Deploy
```bash
railway up
```

## 🔧 Development

### Scripts Available
- `npm run dev` - Development server
- `npm run build` - Build production
- `npm run preview` - Preview build
- `npm start` - Start production server
- `npm run setup-db` - Setup database

### Code Style
- ESLint untuk linting
- Prettier untuk formatting
- Consistent naming conventions
- Component-based architecture

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **StillLearning Team** - *Initial work*

## 🙏 Acknowledgments

- React.js team untuk framework yang luar biasa
- Tailwind CSS untuk styling yang powerful
- Railway.app untuk platform deployment yang mudah
- MySQL untuk database yang reliable

## 📞 Support

Jika ada pertanyaan atau masalah, silakan buat issue di repository ini atau hubungi:
- Email: admin@stilllearning.com
- Platform: Railway.app

---

**StillLearning** - Platform edukasi terbuka untuk semua 🎓
