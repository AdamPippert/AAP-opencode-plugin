#!/usr/bin/env bun
// Test script to verify AAP connection

import { AAPClient } from './src/client';

const client = new AAPClient({
  baseUrl: 'https://AAP_BASE_URL_PLACEHOLDER',
  username: 'adam',
  password: 'REDACTED',
  verifySsl: false,
});

async function testConnection(): Promise<void> {
  try {
    console.log('Connecting to AAP cluster...');
    client.authenticate();
    
    console.log('Testing API versions endpoint...');
    const versions = await client.getApiVersions();
    console.log('Raw response:', JSON.stringify(versions, null, 2));
    
    console.log('\n✅ Successfully connected to AAP cluster!');
    
    // Test listing job templates
    console.log('\nFetching job templates...');
    const templates = await client.getJobTemplates({}, undefined, undefined);
    console.log(`Found ${templates.count} job templates`);
    if (templates.results.length > 0) {
      console.log('\nFirst few templates:');
      templates.results.slice(0, 5).forEach(t => {
        console.log(`  - ${t.name} (ID: ${t.id})`);
      });
    }
    
    // Test listing inventories
    console.log('\nFetching inventories...');
    const inventories = await client.getInventories({}, undefined, undefined);
    console.log(`Found ${inventories.count} inventories`);
    if (inventories.results.length > 0) {
      inventories.results.slice(0, 3).forEach(i => {
        console.log(`  - ${i.name} (ID: ${i.id})`);
      });
    }
    
    // Test listing projects
    console.log('\nFetching projects...');
    const projects = await client.getProjects({}, undefined, undefined);
    console.log(`Found ${projects.count} projects`);
    if (projects.results.length > 0) {
      projects.results.slice(0, 3).forEach(p => {
        console.log(`  - ${p.name} (ID: ${p.id}) - Status: ${p.status}`);
      });
    }
    
    console.log('\n✅ All tests passed! Plugin is working correctly.');
    
  } catch (error) {
    console.error('❌ Connection failed:', error instanceof Error ? error.message : String(error));
    console.error('Stack:', error instanceof Error ? error.stack : '');
    process.exit(1);
  }
}

testConnection();
