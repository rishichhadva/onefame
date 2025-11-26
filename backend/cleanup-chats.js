import pool from './db.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

async function cleanupSampleChats() {
  try {
    console.log('Starting cleanup of sample chats...\n');
    
    // List of common test/sample names
    const testNames = [
      'Jane Doe', 'John Smith', 'John Doe', 'Jane Smith',
      'Test User', 'Sample User', 'Demo User',
      'Sample Photographer', 'Sample Influencer', 'Sample Fitness Coach', 'Sample Musician'
    ];
    
    let totalDeleted = 0;
    
    // Delete chats that have no messages (likely sample/test chats)
    const emptyChatsResult = await pool.query(`
      DELETE FROM chats 
      WHERE id IN (
        SELECT c.id 
        FROM chats c
        LEFT JOIN messages m ON m.chat_id = c.id
        WHERE m.id IS NULL
      )
      RETURNING id
    `);
    
    const emptyDeletedCount = emptyChatsResult.rows.length;
    if (emptyDeletedCount > 0) {
      console.log(`✅ Deleted ${emptyDeletedCount} sample chats with no messages`);
      totalDeleted += emptyDeletedCount;
    }
    
    // Delete chats with test/sample names
    const testNamesCondition = testNames.map(name => `'${name}'`).join(', ');
    const testNamesResult = await pool.query(`
      DELETE FROM chats 
      WHERE user1_name IN (${testNamesCondition})
         OR user2_name IN (${testNamesCondition})
      RETURNING id, user1_name, user2_name
    `);
    
    const testNamesDeletedCount = testNamesResult.rows.length;
    if (testNamesDeletedCount > 0) {
      console.log(`✅ Deleted ${testNamesDeletedCount} chats with test/sample names:`);
      testNamesResult.rows.forEach(chat => {
        console.log(`   - ${chat.user1_name} <-> ${chat.user2_name}`);
      });
      totalDeleted += testNamesDeletedCount;
    }
    
    // Delete chats with test/sample email patterns
    const testEmailsResult = await pool.query(`
      DELETE FROM chats 
      WHERE user1_email LIKE '%test%' 
         OR user1_email LIKE '%sample%'
         OR user2_email LIKE '%test%'
         OR user2_email LIKE '%sample%'
         OR user1_email LIKE '%example%'
         OR user2_email LIKE '%example%'
      RETURNING id
    `);
    
    const testEmailsDeletedCount = testEmailsResult.rows.length;
    if (testEmailsDeletedCount > 0) {
      console.log(`✅ Deleted ${testEmailsDeletedCount} chats with test/sample email patterns`);
      totalDeleted += testEmailsDeletedCount;
    }
    
    if (totalDeleted === 0) {
      console.log('✅ No sample chats found to delete. All chats appear to be real.');
    } else {
      console.log(`\n🎉 Cleanup complete! Total deleted: ${totalDeleted} sample chats`);
    }
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error cleaning up sample chats:', err);
    process.exit(1);
  }
}

cleanupSampleChats();

