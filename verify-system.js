#!/usr/bin/env node

/**
 * SYSTEM VERIFICATION & HEALTH CHECK
 * Verifies all files, dependencies, and configurations
 */

const fs = require('fs');
const path = require('path');

console.log('\n╔═══════════════════════════════════════════════════════════╗');
console.log('║      TASK MANAGEMENT API - SYSTEM VERIFICATION            ║');
console.log('╚═══════════════════════════════════════════════════════════╝\n');

const projectRoot = __dirname;
let checksPassed = 0;
let checksFailed = 0;

function checkFile(filePath, name) {
    const fullPath = path.join(projectRoot, filePath);
    if (fs.existsSync(fullPath)) {
        console.log(`✅ ${name}`);
        checksPassed++;
    } else {
        console.log(`❌ ${name} - NOT FOUND`);
        checksFailed++;
    }
}

function checkDirectory(dirPath, name) {
    const fullPath = path.join(projectRoot, dirPath);
    if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
        console.log(`✅ ${name}`);
        checksPassed++;
    } else {
        console.log(`❌ ${name} - NOT FOUND`);
        checksFailed++;
    }
}

// === CONFIGURATION FILES ===
console.log('📋 CONFIGURATION FILES');
console.log('─'.repeat(60));
checkFile('.env', '.env file');
checkFile('package.json', 'package.json');
checkFile('package-lock.json', 'package-lock.json');

// === PROJECT STRUCTURE ===
console.log('\n📁 PROJECT DIRECTORIES');
console.log('─'.repeat(60));
checkDirectory('node_modules', 'node_modules');
checkDirectory('routes', 'routes/');
checkDirectory('models', 'models/');
checkDirectory('middlewares', 'middlewares/');
checkDirectory('utils', 'utils/');

// === CORE SERVER FILES ===
console.log('\n🚀 CORE SERVER FILES');
console.log('─'.repeat(60));
checkFile('server.js', 'server.js');
checkFile('swagger.js', 'swagger.js');

// === ROUTE FILES ===
console.log('\n🛣️  ROUTE FILES');
console.log('─'.repeat(60));
checkFile('routes/users.js', 'routes/users.js');
checkFile('routes/tasks.js', 'routes/tasks.js');

// === MODEL FILES ===
console.log('\n📊 DATA MODEL FILES');
console.log('─'.repeat(60));
checkFile('models/users.js', 'models/users.js');
checkFile('models/tasks.js', 'models/tasks.js');

// === MIDDLEWARE FILES ===
console.log('\n🔐 MIDDLEWARE FILES');
console.log('─'.repeat(60));
checkFile('middlewares/auth.js', 'middlewares/auth.js');

// === UTILITY FILES ===
console.log('\n🔧 UTILITY FILES');
console.log('─'.repeat(60));
checkFile('utils/jwt.js', 'utils/jwt.js');

// === TEST FILES ===
console.log('\n🧪 TEST FILES');
console.log('─'.repeat(60));
checkFile('test-simple.js', 'test-simple.js');
checkFile('test-comprehensive.js', 'test-comprehensive.js');
checkFile('test-full-report.js', 'test-full-report.js');
checkFile('test-api.js', 'test-api.js');

// === DOCUMENTATION ===
console.log('\n📚 DOCUMENTATION');
console.log('─'.repeat(60));
checkFile('README.md', 'README.md');
checkFile('SWAGGER_DOCUMENTATION.md', 'SWAGGER_DOCUMENTATION.md');

// === DEPENDENCIES CHECK ===
console.log('\n📦 NPM DEPENDENCIES');
console.log('─'.repeat(60));

try {
    const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf8'));
    const deps = packageJson.dependencies || {};

    const requiredDeps = [
        'express',
        'mongoose',
        'bcryptjs',
        'jsonwebtoken',
        'dotenv',
        'swagger-jsdoc',
        'swagger-ui-express'
    ];

    requiredDeps.forEach(dep => {
        if (deps[dep]) {
            console.log(`✅ ${dep} - v${deps[dep]}`);
            checksPassed++;
        } else {
            console.log(`❌ ${dep} - NOT INSTALLED`);
            checksFailed++;
        }
    });
} catch (err) {
    console.log(`❌ Error reading package.json: ${err.message}`);
    checksFailed++;
}

// === NPM SCRIPTS CHECK ===
console.log('\n🎯 NPM SCRIPTS');
console.log('─'.repeat(60));

try {
    const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf8'));
    const scripts = packageJson.scripts || {};

    const requiredScripts = ['start', 'test', 'test:comprehensive', 'dev'];

    requiredScripts.forEach(script => {
        if (scripts[script]) {
            console.log(`✅ npm ${script} configured`);
            checksPassed++;
        } else {
            console.log(`⚠️  npm ${script} not configured`);
        }
    });
} catch (err) {
    console.log(`❌ Error reading scripts: ${err.message}`);
    checksFailed++;
}

// === ENVIRONMENT VARIABLES ===
console.log('\n🔑 ENVIRONMENT VARIABLES');
console.log('─'.repeat(60));

try {
    const envFile = fs.readFileSync(path.join(projectRoot, '.env'), 'utf8');
    const envVars = envFile.split('\n').filter(line => line.trim() && !line.startsWith('#'));

    if (envFile.includes('PORT')) console.log('✅ PORT configured');
    else console.log('⚠️  PORT not configured');

    if (envFile.includes('MONGO_URI')) console.log('✅ MONGO_URI configured');
    else console.log('⚠️  MONGO_URI not configured');

    if (envFile.includes('JWT_SECRET')) console.log('✅ JWT_SECRET configured');
    else console.log('⚠️  JWT_SECRET not configured');

    if (envFile.includes('JWT_EXPIRE')) console.log('✅ JWT_EXPIRE configured');
    else console.log('⚠️  JWT_EXPIRE not configured');

    checksPassed += 4;
} catch (err) {
    console.log(`❌ Error reading .env: ${err.message}`);
    checksFailed++;
}

// === SUMMARY ===
console.log('\n╔═══════════════════════════════════════════════════════════╗');
console.log('║                  VERIFICATION SUMMARY                      ║');
console.log('╚═══════════════════════════════════════════════════════════╝\n');

const totalChecks = checksPassed + checksFailed;
const passRate = totalChecks > 0 ? ((checksPassed / totalChecks) * 100).toFixed(2) : 0;

console.log(`✅ Checks Passed:     ${checksPassed}`);
console.log(`❌ Checks Failed:     ${checksFailed}`);
console.log(`📊 Pass Rate:         ${passRate}%\n`);

if (checksFailed === 0) {
    console.log('🎉 ALL SYSTEMS GO! Project is properly configured.\n');
    console.log('📝 Next Steps:');
    console.log('  1. Start the server: npm start');
    console.log('  2. Run tests: npm test');
    console.log('  3. View API docs: http://localhost:5000/api-docs\n');
    process.exit(0);
} else {
    console.log('⚠️  Some checks failed. Please review and fix issues.\n');
    process.exit(1);
}
