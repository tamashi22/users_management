/**
 * Database backup script
 * Creates SQL dump from PostgreSQL Docker container
 */

require('dotenv').config();
const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');

const execAsync = promisify(exec);

// Configuration
const CONTAINER_NAME = process.env.POSTGRES_CONTAINER || 'user_management_db';
const DB_USER = process.env.POSTGRES_USER || 'postgres';
const DB_NAME = process.env.POSTGRES_DB || 'user_management';
const BACKUP_DIR = path.join(__dirname, '../backups');

/**
 * Create database backup
 */
async function createBackup() {
  try {
    // Create backups directory if it doesn't exist
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
      console.log(`Created backups directory: ${BACKUP_DIR}`);
    }

    // Generate filename with timestamp
    const date = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const time = new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
    const filename = `backup_${date}_${time}.sql`;
    const filepath = path.join(BACKUP_DIR, filename);

    console.log('Creating database backup...');
    console.log(`Container: ${CONTAINER_NAME}`);
    console.log(`Database: ${DB_NAME}`);
    console.log(`User: ${DB_USER}`);

    // Create backup command
    const command = `docker exec -t ${CONTAINER_NAME} pg_dump -U ${DB_USER} ${DB_NAME} --clean --if-exists --no-owner --no-acl`;

    // Execute command and write to file
    const { stdout, stderr } = await execAsync(command);

    if (stderr && !stderr.includes('password')) {
      console.error('Error:', stderr);
      return false;
    }

    // Write dump to file
    fs.writeFileSync(filepath, stdout, 'utf8');

    // Get file size
    const stats = fs.statSync(filepath);
    const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);

    console.log(`Backup created successfully: ${filename}`);
    console.log(`Size: ${fileSizeInMB} MB`);
    console.log(`Location: ${filepath}`);

    return true;
  } catch (error) {
    console.error('Error creating backup:', error.message);
    console.error('Make sure Docker container is running:');
    console.error(`docker ps | grep ${CONTAINER_NAME}`);
    return false;
  }
}

/**
 * Clean old backups (keep only last N backups)
 */
async function cleanOldBackups(keepCount = 10) {
  try {
    if (!fs.existsSync(BACKUP_DIR)) {
      return;
    }

    const files = fs
      .readdirSync(BACKUP_DIR)
      .filter((file) => file.endsWith('.sql'))
      .map((file) => {
        const filepath = path.join(BACKUP_DIR, file);
        return {
          name: file,
          path: filepath,
          mtime: fs.statSync(filepath).mtime,
        };
      })
      .sort((a, b) => b.mtime - a.mtime); // Sort by modification time, newest first

    // Remove old backups
    if (files.length > keepCount) {
      const filesToDelete = files.slice(keepCount);
      filesToDelete.forEach((file) => {
        fs.unlinkSync(file.path);
        console.log(`Deleted old backup: ${file.name}`);
      });
    }
  } catch (error) {
    console.error('Error cleaning old backups:', error.message);
  }
}

// Main execution
if (require.main === module) {
  (async () => {
    const success = await createBackup();
    if (success) {
      await cleanOldBackups(5); // Keep last 5 backups
    }
    process.exit(success ? 0 : 1);
  })();
}

module.exports = { createBackup, cleanOldBackups };
