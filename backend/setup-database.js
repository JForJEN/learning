require("dotenv").config();
const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");

async function setupDatabase() {
  let connection;
  try {
    console.log("🔧 Setting up database...");
    console.log("📋 Environment variables:");
    console.log("   DB_HOST:", process.env.DB_HOST);
    console.log("   DB_PORT:", process.env.DB_PORT);
    console.log("   DB_USER:", process.env.DB_USER);
    console.log("   DB_NAME:", process.env.DB_NAME);
    console.log("   DB_PASSWORD:", process.env.DB_PASSWORD ? "***SET***" : "***NOT SET***");

    // Connect to MySQL server (without specifying database)
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD
    });

    console.log("✅ Connected to MySQL server");

    // Create database if not exists
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
    console.log(`✅ Database '${process.env.DB_NAME}' created/verified`);

    // Use the database
    await connection.execute(`USE ${process.env.DB_NAME}`);
    console.log(`✅ Using database '${process.env.DB_NAME}'`);

    // Read and execute SQL setup script
    const sqlPath = path.join(__dirname, "../database_setup.sql");
    const sqlContent = fs.readFileSync(sqlPath, "utf8");
    
    // Split SQL by semicolon and execute each statement
    const statements = sqlContent
      .split(";")
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith("--"));

    console.log(`📝 Executing ${statements.length} SQL statements...`);

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      if (stmt.trim()) {
        try {
          await connection.execute(stmt);
          console.log(`✅ Statement ${i + 1} executed`);
        } catch (err) {
          console.log(`⚠️ Statement ${i + 1} failed (might be duplicate):`, err.message);
        }
      }
    }

    // Verify tables
    const [tables] = await connection.execute("SHOW TABLES");
    console.log("📊 Tables in database:");
    tables.forEach(table => {
      console.log(`   - ${Object.values(table)[0]}`);
    });

    // Check data
    const [users] = await connection.execute("SELECT COUNT(*) as count FROM users");
    const [courses] = await connection.execute("SELECT COUNT(*) as count FROM courses");
    const [comments] = await connection.execute("SELECT COUNT(*) as count FROM comments");

    console.log("📈 Data summary:");
    console.log(`   Users: ${users[0].count}`);
    console.log(`   Courses: ${courses[0].count}`);
    console.log(`   Comments: ${comments[0].count}`);

    console.log("🎉 Database setup completed successfully!");

  } catch (err) {
    console.error("❌ Database setup failed:", err.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run setup if this file is executed directly
if (require.main === module) {
  setupDatabase();
}

module.exports = setupDatabase;
