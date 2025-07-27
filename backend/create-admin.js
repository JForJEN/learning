require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'stilllearning_db',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
};

async function createAdmin() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Terhubung ke database');

    // Hapus admin lama (opsional)
    await connection.execute('DELETE FROM users WHERE role = "admin"');
    console.log('✅ Admin lama dihapus');

    // Hash password untuk admin baru
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Tambah admin baru
    await connection.execute(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      ['JEN', 'jendriSL@email.com', hashedPassword, 'admin']
    );
    
    console.log('✅ Admin baru berhasil dibuat!');
    console.log('📋 Login Info:');
    console.log('Email: jendriSL@email.com');
    console.log('Password: admin123');
    console.log('Role: admin');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

createAdmin(); 