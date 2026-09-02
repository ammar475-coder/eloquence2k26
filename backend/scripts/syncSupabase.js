const fs = require('fs');
const path = require('path');
const supabase = require('../config/supabase');

const DATA_DIR = path.join(__dirname, '../data');

function camelToSnakeKey(key) {
  return key.replace(/([A-Z])/g, '_$1').toLowerCase();
}

function convertObjectKeys(obj) {
  if (Array.isArray(obj)) {
    return obj.map(convertObjectKeys);
  } else if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      const snakeKey = camelToSnakeKey(key);
      acc[snakeKey] = convertObjectKeys(obj[key]);
      return acc;
    }, {});
  }
  return obj;
}

async function syncTable(tableName, jsonFileName, idField = 'id', sanitizeFn = null) {
  const filePath = path.join(DATA_DIR, jsonFileName);
  if (!fs.existsSync(filePath)) {
    console.log(`[SYNC] Skipping ${tableName}: ${jsonFileName} not found.`);
    return;
  }

  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    let items = JSON.parse(raw || '[]');
    if (!Array.isArray(items) || items.length === 0) {
      console.log(`[SYNC] No records in ${jsonFileName}.`);
      return;
    }

    console.log(`[SYNC] Syncing ${items.length} records into table '${tableName}'...`);

    // Check table existence
    const { error: testError } = await supabase.from(tableName).select('*').limit(1);
    if (testError) {
      console.error(`❌ Table '${tableName}' error:`, testError.message);
      return;
    }

    let successCount = 0;
    for (let item of items) {
      let convertedItem = convertObjectKeys(item);
      if (sanitizeFn) {
        convertedItem = sanitizeFn(convertedItem);
      }
      const { error } = await supabase.from(tableName).upsert([convertedItem], { onConflict: idField });
      if (error) {
        console.warn(`⚠️ Warning item in '${tableName}' (${item[idField] || 'no-id'}):`, error.message);
      } else {
        successCount++;
      }
    }
    console.log(`✅ Table '${tableName}': synced ${successCount}/${items.length} records.`);
  } catch (err) {
    console.error(`❌ Failed syncing '${tableName}':`, err.message);
  }
}

async function runSync() {
  console.log("==================================================");
  console.log(" ELOQUENCE '26 SUPABASE LIVE SYNC & DIAGNOSTIC ");
  console.log("==================================================");
  console.log("Target Database URL:", process.env.SUPABASE_URL);

  const tables = ['events', 'registrations', 'registration_members', 'coordinators', 'sponsors', 'users', 'roles'];
  console.log("\n--- Checking Table Accessibility ---");
  for (const t of tables) {
    const { error } = await supabase.from(t).select('*').limit(1);
    if (error) {
      console.log(`❌ Table '${t}' is MISSING or restricted: ${error.message}`);
    } else {
      console.log(`✅ Table '${t}' is LIVE & accessible.`);
    }
  }

  console.log("\n--- Data Sync Status ---");

  // Sync events
  await syncTable('events', 'events.json', 'id', (item) => {
    delete item.coordinators;
    return item;
  });

  // Sync coordinators
  await syncTable('coordinators', 'coordinators.json', 'id');

  await syncTable('sponsors', 'sponsors.json', 'id');
  await syncTable('users', 'users.json', 'id');
  await syncTable('roles', 'roles.json', 'id');

  console.log("\n==================================================");
  console.log(" DIAGNOSTIC COMPLETE ");
  console.log("==================================================");
}

runSync();
