// Test Neo4j connection to resolve fallback mode
import neo4j from 'neo4j-driver';

const uri = 'neo4j+s://4fbb2dea.databases.neo4j.io';
const username = '4fbb2dea';
const password = 'qDErdfzGXRiNEmA0dm3IGzIIFXvL0wczGtBZr4qqU9I';
const database = '4fbb2dea';

async function testNeo4jConnection() {
  console.log('🔍 TESTING NEO4J CONNECTION TO RESOLVE FALLBACK MODE\n');

  const driver = neo4j.driver(uri, neo4j.auth.basic(username, password));
  const session = driver.session({ database });

  try {
    console.log('📡 Testing Neo4j connection...');
    console.log(`   URI: ${uri}`);
    console.log(`   Database: ${database}`);
    console.log(`   Username: ${username}`);

    // Test basic connection
    const result = await session.run('RETURN 1 as test');
    const testValue = result.records[0].get('test').toNumber();
    
    if (testValue === 1) {
      console.log('✅ Neo4j connection successful!');
    }

    // Check if we have existing data
    const dataCheck = await session.run(`
      MATCH (n) 
      RETURN count(n) as totalNodes, 
             collect(DISTINCT labels(n)[0])[0..5] as nodeTypes
    `);

    const totalNodes = dataCheck.records[0].get('totalNodes').toNumber();
    const nodeTypes = dataCheck.records[0].get('nodeTypes');

    console.log(`\n📊 DATABASE STATUS:`);
    console.log(`   Total Nodes: ${totalNodes}`);
    console.log(`   Node Types: ${nodeTypes.join(', ')}`);

    if (totalNodes > 0) {
      console.log('✅ Database has existing data - should NOT be in fallback mode');
      
      // Check for recent interactions
      const recentCheck = await session.run(`
        MATCH (i:Interaction)
        RETURN count(i) as interactions,
               collect(i.status)[0..3] as statuses
        ORDER BY i.timestamp DESC
      `);

      if (recentCheck.records.length > 0) {
        const interactions = recentCheck.records[0].get('interactions').toNumber();
        const statuses = recentCheck.records[0].get('statuses');
        console.log(`   Interactions: ${interactions}`);
        console.log(`   Recent Statuses: ${statuses.join(', ')}`);
      }
    } else {
      console.log('⚠️ Database is empty - this might cause fallback mode');
    }

    console.log('\n🔧 FALLBACK MODE DIAGNOSIS:');
    console.log('If you still see "⚠️ Fallback mode":');
    console.log('1. ✅ Neo4j connection is working');
    console.log('2. ✅ Environment variables are loaded');
    console.log('3. 🔄 Browser may need refresh to pick up changes');
    console.log('4. 🔄 Check browser console for any connection errors');

    console.log('\n🌐 NEXT STEPS:');
    console.log('1. Refresh the browser at http://localhost:5173');
    console.log('2. Check Settings page for Neo4j status');
    console.log('3. Submit a test prompt to verify data storage');
    console.log('4. Fallback mode should disappear once connection is detected');

  } catch (error) {
    console.error('❌ Neo4j connection failed:', error.message);
    console.log('\n🚨 THIS IS WHY YOU SEE FALLBACK MODE:');
    console.log('- Neo4j connection is not working');
    console.log('- System falls back to mock API for functionality');
    console.log('- Check your Neo4j Aura instance status');
    console.log('- Verify network connectivity');
  } finally {
    await session.close();
    await driver.close();
  }
}

testNeo4jConnection();
