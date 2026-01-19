#!/usr/bin/env node

/**
 * TASK MANAGEMENT API - COMPREHENSIVE TEST REPORT
 * Tests all endpoints and generates a detailed report
 */

const http = require('http');
const querystring = require('querystring');

const BASE_URL = 'http://localhost:5000';
let testCount = 0;
let passCount = 0;
let failCount = 0;

// Make HTTP request wrapper
async function request(method, path, body = null, headers = {}) {
    return new Promise((resolve) => {
        const url = new URL(path, BASE_URL);
        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname + url.search,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            },
            timeout: 10000
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                resolve({
                    status: res.statusCode,
                    body: data ? JSON.parse(data).catch ? data : JSON.parse(data) : null
                });
            });
        });

        req.on('error', (err) => resolve({ status: 0, error: err.message }));
        req.on('timeout', () => { req.destroy(); resolve({ status: 0, error: 'Timeout' }); });

        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

// Test function
async function test(name, method, path, body = null, expectedStatus = 200, expectSuccess = true) {
    testCount++;
    const result = await request(method, path, body);

    if (result.status === expectedStatus) {
        if (!expectSuccess || (result.body && result.body.success !== false)) {
            console.log(`  ✅ ${name}`);
            passCount++;
            return result;
        } else {
            console.log(`  ❌ ${name} (unexpected response structure)`);
            failCount++;
            return result;
        }
    } else {
        console.log(`  ❌ ${name} (expected ${expectedStatus}, got ${result.status})`);
        if (result.error) console.log(`     Error: ${result.error}`);
        failCount++;
        return result;
    }
}

// Main test runner
async function runTests() {
    console.log('\n');
    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║   TASK MANAGEMENT API - COMPREHENSIVE TEST REPORT        ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');

    let userId = null;
    let taskId = null;
    let token = null;

    // ========== HEALTH CHECKS ==========
    console.log('📋 HEALTH & DOCUMENTATION CHECKS');
    console.log('─'.repeat(60));

    await test('Welcome Endpoint', 'GET', '/', null, 200);
    await test('Swagger API Documentation', 'GET', '/api-docs', null, 200);

    // ========== USER REGISTRATION ==========
    console.log('\n👤 USER REGISTRATION & AUTHENTICATION');
    console.log('─'.repeat(60));

    let regRes = await test(
        'Register User 1 (john@example.com)',
        'POST',
        '/users',
        { name: 'John Doe', email: 'john@example.com', password: 'password123' },
        201
    );
    if (regRes.body && regRes.body.data) {
        userId = regRes.body.data._id;
        token = regRes.body.token;
        console.log(`     → User ID: ${userId}`);
    }

    let regRes2 = await test(
        'Register User 2 (jane@example.com)',
        'POST',
        '/users',
        { name: 'Jane Smith', email: 'jane@example.com', password: 'password456' },
        201
    );

    await test(
        'Duplicate Email Error',
        'POST',
        '/users',
        { name: 'Another John', email: 'john@example.com', password: 'pass123' },
        400,
        false
    );

    await test(
        'Weak Password Error',
        'POST',
        '/users',
        { name: 'Weak Pass User', email: 'weak@example.com', password: '123' },
        400,
        false
    );

    // ========== USER LOGIN ==========
    console.log('\n🔐 LOGIN & AUTHENTICATION');
    console.log('─'.repeat(60));

    let loginRes = await test(
        'Login with Valid Credentials',
        'POST',
        '/users/login',
        { email: 'john@example.com', password: 'password123' },
        200
    );
    if (loginRes.body && loginRes.body.token) {
        token = loginRes.body.token;
        console.log(`     → Token received: ${token.substring(0, 20)}...`);
    }

    await test(
        'Login with Invalid Password',
        'POST',
        '/users/login',
        { email: 'john@example.com', password: 'wrongpassword' },
        401,
        false
    );

    // ========== USER MANAGEMENT ==========
    console.log('\n👥 USER MANAGEMENT');
    console.log('─'.repeat(60));

    await test('Get All Users', 'GET', '/users', null, 200);

    if (userId) {
        await test('Get Specific User', 'GET', `/users/${userId}`, null, 200);

        await test(
            'Update User',
            'PUT',
            `/users/${userId}`,
            { name: 'John Updated' },
            200
        );

        if (token) {
            await test(
                'Get My Profile (Authenticated)',
                'GET',
                '/users/me',
                null,
                200,
                true,
                { 'Authorization': `Bearer ${token}` }
            );

            await test(
                'Verify Token',
                'GET',
                '/users/verify-token',
                null,
                200,
                true,
                { 'Authorization': `Bearer ${token}` }
            );
        }
    }

    // ========== TASK MANAGEMENT ==========
    console.log('\n📝 TASK MANAGEMENT');
    console.log('─'.repeat(60));

    if (userId) {
        let taskRes = await test(
            'Create Task 1',
            'POST',
            '/tasks',
            {
                title: 'Complete documentation',
                description: 'Write comprehensive API docs',
                status: 'pending',
                user: userId
            },
            201
        );
        if (taskRes.body && taskRes.body.data) {
            taskId = taskRes.body.data._id;
            console.log(`     → Task ID: ${taskId}`);
        }

        await test(
            'Create Task 2',
            'POST',
            '/tasks',
            {
                title: 'Setup CI/CD pipeline',
                description: 'Configure GitHub Actions',
                status: 'pending',
                user: userId
            },
            201
        );

        await test('Get All Tasks', 'GET', '/tasks', null, 200);

        await test(
            'Get Tasks for User',
            'GET',
            `/tasks?user=${userId}`,
            null,
            200
        );

        if (taskId) {
            await test('Get Specific Task', 'GET', `/tasks/${taskId}`, null, 200);

            await test(
                'Update Task',
                'PUT',
                `/tasks/${taskId}`,
                {
                    title: 'Complete documentation - UPDATED',
                    status: 'in-progress'
                },
                200
            );

            await test(
                'Mark Task Complete',
                'PATCH',
                `/tasks/${taskId}/complete`,
                null,
                200
            );
        }
    }

    // ========== ERROR HANDLING ==========
    console.log('\n⚠️  ERROR HANDLING & VALIDATION');
    console.log('─'.repeat(60));

    await test(
        'Missing Required Fields',
        'POST',
        '/users',
        { name: 'No Email User' },
        400,
        false
    );

    await test(
        'Invalid User ID',
        'GET',
        '/users/invalid-id-123',
        null,
        500,
        false
    );

    await test(
        'Invalid Task ID',
        'GET',
        '/tasks/invalid-id-123',
        null,
        500,
        false
    );

    await test(
        'Nonexistent User',
        'GET',
        '/users/999999999999999999999999',
        null,
        404,
        false
    );

    // ========== TEST CLEANUP ==========
    console.log('\n🧹 CLEANUP');
    console.log('─'.repeat(60));

    if (taskId) {
        await test('Delete Task', 'DELETE', `/tasks/${taskId}`, null, 200);
    }

    if (userId) {
        await test('Delete User', 'DELETE', `/users/${userId}`, null, 200);
    }

    // ========== SUMMARY REPORT ==========
    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║                  TEST SUMMARY REPORT                      ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');

    const successRate = testCount > 0 ? ((passCount / testCount) * 100).toFixed(2) : 0;

    console.log(`📊 Total Tests Run:    ${testCount}`);
    console.log(`✅ Tests Passed:       ${passCount}`);
    console.log(`❌ Tests Failed:       ${failCount}`);
    console.log(`📈 Success Rate:       ${successRate}%\n`);

    if (failCount === 0) {
        console.log('🎉 ALL TESTS PASSED! API is fully operational.\n');
        console.log('✨ Features Verified:');
        console.log('  • User Registration and Authentication');
        console.log('  • JWT Token Generation and Verification');
        console.log('  • User Profile Management');
        console.log('  • Task Creation and Management');
        console.log('  • Task Status Updates');
        console.log('  • Error Handling and Validation');
        console.log('  • API Documentation (Swagger)');
        console.log('\n');
    } else {
        console.log(`⚠️  ${failCount} test(s) failed. Review output above.\n`);
    }

    process.exit(failCount === 0 ? 0 : 1);
}

// Run tests
setTimeout(runTests, 1000);
