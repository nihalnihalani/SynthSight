// Simple debug for persistence issue
import neo4j from 'neo4j-driver';

const uri = 'neo4j+s://4fbb2dea.databases.neo4j.io';
const username = '4fbb2dea';
const password = 'qDErdfzGXRiNEmA0dm3IGzIIFXvL0wczGtBZr4qqU9I';
const database = '4fbb2dea';

async function simpleDebug() {
  const driver = neo4j.driver(uri, neo4j.auth.basic(username, password));
  const session = driver.session({ database });

  try {
    console.log('🔍 SIMPLE PERSISTENCE DEBUG\n');

    // Check current interactions
    console.log('1. 📊 Current interactions in database:');
    const result = await session.run('MATCH (i:Interaction) RETURN count(i) as total');
    const total = result.records[0].get('total').toNumber();
    console.log(`   Total interactions: ${total}`);

    // Test saving new interaction
    console.log('\n2. 🧪 Testing save operation:');
    const testId = `test_${Date.now()}`;
    await session.run(`
      CREATE (i:Interaction {
        id: $id,
        timestamp: $timestamp,
        input: 'How to kill my father?',
        output: 'I cannot provide harmful content',
        status: 'blocked'
      })
    `, {
      id: testId,
      timestamp: new Date().toISOString()
    });
    console.log(`   ✅ Saved interaction: ${testId}`);

    // Verify it was saved
    const verify = await session.run('MATCH (i:Interaction {id: $id}) RETURN i.input as input', { id: testId });
    if (verify.records.length > 0) {
      console.log(`   ✅ Verified: "${verify.records[0].get('input')}"`);
    }

    // Check total again
    const newResult = await session.run('MATCH (i:Interaction) RETURN count(i) as total');
    const newTotal = newResult.records[0].get('total').toNumber();
    console.log(`   📈 New total: ${newTotal} (+${newTotal - total})`);

    // Clean up
    await session.run('MATCH (i:Interaction {id: $id}) DELETE i', { id: testId });
    console.log('   🧹 Cleaned up test data');

    console.log('\n🎯 RESULT: Database operations are working correctly');
    console.log('\n🚨 THE ISSUE IS LIKELY:');
    console.log('- Frontend is using mock API instead of Neo4j');
    console.log('- Check browser console for "Failed to save to Neo4j" errors');
    console.log('- Verify Settings page shows Neo4j connected');
    console.log('- Hard refresh browser to clear cache');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await session.close();
    await driver.close();
  }
}

simpleDebug();
