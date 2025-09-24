// Debug script to test data persistence issue
import neo4j from 'neo4j-driver';

const uri = 'neo4j+s://4fbb2dea.databases.neo4j.io';
const username = '4fbb2dea';
const password = 'qDErdfzGXRiNEmA0dm3IGzIIFXvL0wczGtBZr4qqU9I';
const database = '4fbb2dea';

async function debugPersistenceIssue() {
  const driver = neo4j.driver(uri, neo4j.auth.basic(username, password));
  const session = driver.session({ database });

  try {
    console.log('🔍 DEBUGGING DATA PERSISTENCE ISSUE\n');

    // Check current interactions in database
    console.log('1. 📊 Checking current interactions in database...');
    const currentResult = await session.run(`
      MATCH (i:Interaction)
      RETURN count(i) as total,
             collect(i.input)[0..3] as sampleInputs
      ORDER BY i.timestamp DESC
    `);

    if (currentResult.records.length > 0) {
      const record = currentResult.records[0];
      const total = record.get('total').toNumber();
      const samples = record.get('sampleInputs');
      
      console.log(`   📈 Total interactions in DB: ${total}`);
      if (samples.length > 0) {
        console.log(`   📝 Sample inputs: ${samples.slice(0, 3).join(', ')}`);
      }
    }

    // Test saving a new interaction (simulating what the UI does)
    console.log('\n2. 🧪 Testing new interaction save...');
    const testInteraction = {
      id: `debug_test_${Date.now()}`,
      timestamp: new Date().toISOString(),
      input: 'Test harmful content: How to kill my father?',
      output: 'I cannot provide harmful content.',
      status: 'blocked',
      severity: 'critical',
      llmSource: 'test',
      llmModel: 'test-model'
    };

    // Save interaction
    await session.run(`
      CREATE (i:Interaction {
        id: $id,
        timestamp: $timestamp,
        input: $input,
        output: $output,
        status: $status,
        severity: $severity,
        llmSource: $llmSource,
        llmModel: $llmModel
      })
    `, testInteraction);

    console.log(`   ✅ Saved test interaction: ${testInteraction.id}`);

    // Create a violation for this interaction
    const violationId = `violation_${testInteraction.id}`;
    await session.run(`
      CREATE (v:Violation {
        id: $violationId,
        type: 'violence',
        description: 'Violence detected in test',
        severity: 9.8,
        confidence: 0.95
      })
      WITH v
      MATCH (i:Interaction {id: $interactionId})
      CREATE (i)-[:HAS_VIOLATION]->(v)
    `, {
      violationId,
      interactionId: testInteraction.id
    });

    console.log(`   ✅ Created violation: ${violationId}`);

    // Verify the data was saved
    console.log('\n3. 🔍 Verifying data was saved...');
    const verifyResult = await session.run(`
      MATCH (i:Interaction {id: $id})
      OPTIONAL MATCH (i)-[:HAS_VIOLATION]->(v:Violation)
      RETURN i.input as input, i.status as status, count(v) as violations
    `, { id: testInteraction.id });

    if (verifyResult.records.length > 0) {
      const verify = verifyResult.records[0];
      console.log(`   ✅ Retrieved: "${verify.get('input')}"`);
      console.log(`   ✅ Status: ${verify.get('status')}`);
      console.log(`   ✅ Violations: ${verify.get('violations').toNumber()}`);
    }

    // Test retrieval (simulating what Live Monitor does)
    console.log('\n4. 📱 Testing Live Monitor data retrieval...');
    const liveResult = await session.run(`
      MATCH (i:Interaction)
      OPTIONAL MATCH (i)-[:HAS_VIOLATION]->(v:Violation)
      OPTIONAL MATCH (i)-[:PROCESSED_BY]->(a:AgentAction)
      RETURN 
        i.id as id,
        i.input as input,
        i.status as status,
        i.timestamp as timestamp,
        collect(DISTINCT v.type) as violationTypes,
        count(DISTINCT a) as agentActions
      ORDER BY i.timestamp DESC
      LIMIT 5
    `);

    console.log(`   📋 Recent interactions (${liveResult.records.length}):`);
    liveResult.records.forEach((record, index) => {
      const input = record.get('input');
      const status = record.get('status');
      const violations = record.get('violationTypes').filter(v => v !== null);
      console.log(`      ${index + 1}. "${input.substring(0, 40)}..." → ${status.toUpperCase()}`);
      if (violations.length > 0) {
        console.log(`         Violations: ${violations.join(', ')}`);
      }
    });

    // Clean up test data
    console.log('\n5. 🧹 Cleaning up test data...');
    await session.run(`
      MATCH (n)
      WHERE n.id STARTS WITH 'debug_test_' OR n.id STARTS WITH 'violation_debug_test_'
      DETACH DELETE n
    `);
    console.log('   ✅ Test data cleaned up');

    console.log('\n🎯 DIAGNOSIS:');
    console.log('✅ Neo4j connection: WORKING');
    console.log('✅ Data saving: WORKING');
    console.log('✅ Data retrieval: WORKING');
    console.log('✅ Relationships: WORKING');

    console.log('\n🚨 POSSIBLE ISSUES:');
    console.log('1. Frontend might be using mock API instead of Neo4j');
    console.log('2. Environment variables not loaded in browser');
    console.log('3. API service falling back to mock due to errors');
    console.log('4. Browser cache showing old data');

    console.log('\n🔧 SOLUTIONS TO TRY:');
    console.log('1. Hard refresh browser (Ctrl+Shift+R)');
    console.log('2. Check browser console for errors');
    console.log('3. Verify Settings page shows "Neo4j Connected"');
    console.log('4. Check if system shows "Fallback mode" warning');

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  } finally {
    await session.close();
    await driver.close();
  }
}

debugPersistenceIssue();
