#!/usr/bin/env node

/**
 * Script para ejecutar migraciones automáticamente
 * Compatible con Render, Railway, Heroku, etc.
 * Se ejecuta después del build
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function runMigrations() {
  // Configuración SSL para diferentes plataformas
  const sslConfig = process.env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: false } 
    : false;

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: sslConfig
  });

  try {
    console.log('🔌 Conectando a la base de datos...');
    await client.connect();
    console.log('✅ Conectado exitosamente');

    // Leer y ejecutar migración inicial
    console.log('\n📄 Ejecutando 001_initial_schema.sql...');
    const migration1 = fs.readFileSync(
      path.join(__dirname, 'src', 'database', 'migrations', '001_initial_schema.sql'),
      'utf8'
    );
    await client.query(migration1);
    console.log('✅ Migración 001 completada');

    // Leer y ejecutar migración de estados
    console.log('\n📄 Ejecutando 002_add_order_statuses.sql...');
    const migration2 = fs.readFileSync(
      path.join(__dirname, 'src', 'database', 'migrations', '002_add_order_statuses.sql'),
      'utf8'
    );
    await client.query(migration2);
    console.log('✅ Migración 002 completada');

    console.log('\n🎉 Base de datos configurada exitosamente!');
    
  } catch (error) {
    console.error('❌ Error ejecutando migraciones:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigrations();

