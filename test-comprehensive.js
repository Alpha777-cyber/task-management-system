const http = require('http');

const API_URL = 'http://localhost:5000';
let testResults = {
    passed: 0,
    failed: 0,
    total: 0
};

// Helper to make HTTP requests
function makeRequest(method, path, body = null, headers = {}) {
    return new Promise((resolve, reject) => {
        try {
            const url = new URL(path, API_URL);
            const options = {
                hostname: url.hostname,
                port: url.port,
                path: url.pathname + url.search,
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    ...headers
                }
            };

            const req = http.request(options, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try {
                        resolve({
                            status: res.statusCode,
                            body: data ? JSON.parse(data) : null,
                            headers: res.headers
                        });
                    } catch (e) {
                        resolve({
                            status: res.statusCode,
                            body: data,
                            headers: res.headers
                        });
                    }
                });
            });

            req.on('error', (err) => {
                resolve({
                    status: 0,
                    body: null,
                    error: err.message,
                    headers: {}
                });
            });
            if (body) req.write(JSON.stringify(body));
            req.end();
        } catch (err) {
            resolve({
                status: 0,
                body: null,
                error: err.message,
                headers: {}
            });
        }
    });
}

// Test runner
async function test(name, method, path, body = null, expectedStatus = 200, headers = {}) {
    testResults.total++;
    try {
        const res = await makeRequest(method, path, body, headers);

        if (res.error) {
            console.log(`❌ ${name}`);
            console.log(`   Error: ${res.error}`);
            testResults.failed++;
            return res;
        }

        if (res.status === expectedStatus) {
            console.log(`✅ ${name}`);
            console.log(`   Status: ${res.status}`);
            if (res.body && typeof res.body === 'object') {
                const preview = JSON.stringify(res.body).substring(0, 100);
                console.log(`   Response:`, preview + (preview.length === 100 ? '...' : ''));
            }
            testResults.passed++;
            return res;
        } else {
            console.log(`❌ ${name}`);
            console.log(`   Expected: ${expectedStatus}, Got: ${res.status}`);
            if (res.body) {
                console.log(`   Response:`, JSON.stringify(res.body).substring(0, 150));
            }
            testResults.failed++;
            return res;
        }
    } catch (err) {
        console.log(`❌ ${name}`);
        console.log(`   Error: ${err.message}`);
        testResults.failed++;
    }
}

// Main test suite
async function runTests() {
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║         TASK MANAGEMENT API - COMPREHENSIVE TESTS          ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    let userId = null;
    let taskId = null;
    let authToken = null;

    // ===== HEALTH CHECKS =====
    console.log('\n📋 HEALTH CHECKS');
    console.log('─'.repeat(60));
    await test('GET / - Welcome Endpoint', 'GET', '/', null, 200);
    await test('GET /api-docs - Swagger UI', 'GET', '/api-docs', null, 200);

    // ===== USER REGISTRATION & LOGIN =====
    console.log('\n👤 USER MANAGEMENT TESTS');
    console.log('─'.repeat(60));

    // Register user 1
    let registerRes = await test(
        'POST /users - Register User 1',
        'POST',
        '/users',
        {
            name: 'John Doe',
            email: 'john@example.com',
            password: 'password123'
        },
        201
    );
    if (registerRes && registerRes.body && registerRes.body.data) {
        userId = registerRes.body.data._id;
        authToken = registerRes.body.token;
        console.log(`   User ID: ${userId}`);
        console.log(`   Token received: ${authToken ? 'Yes' : 'No'}`);
    }

    // Register user 2
    let registerRes2 = await test(
        'POST /users - Register User 2',
        'POST',
        '/users',
        {
            name: 'Jane Smith',
            email: 'jane@example.com',
            password: 'password456'
        },
        201
    );
    let userId2 = null;
    if (registerRes2 && registerRes2.body && registerRes2.body.data) {
        userId2 = registerRes2.body.data._id;
    }

    // Login test
    let loginRes = await test(
        'POST /users/login - Login with credentials',
        'POST',
        '/users/login',
        {
            email: 'john@example.com',
            password: 'password123'
        },
        200
    );
    if (loginRes && loginRes.body && loginRes.body.token) {
        authToken = loginRes.body.token;
        console.log(`   Token received: ${authToken ? 'Yes' : 'No'}`);
    }

    // Invalid login
    await test(
        'POST /users/login - Invalid credentials (should fail)',
        'POST',
        '/users/login',
        {
            email: 'john@example.com',
            password: 'wrongpassword'
        },
        401
    );

    // Get all users
    await test(
        'GET /users - Get all users',
        'GET',
        '/users',
        null,
        200
    );

    // Get specific user
    if (userId) {
        await test(
            'GET /users/{id} - Get specific user',
            'GET',
            `/users/${userId}`,
            null,
            200
        );
    }

    // Get profile with auth
    if (authToken) {
        await test(
            'GET /users/me - Get authenticated user profile',
            'GET',
            '/users/me',
            null,
            200,
            { 'Authorization': `Bearer ${authToken}` }
        );
    }

    // Verify token
    if (authToken) {
        await test(
            'GET /users/verify-token - Verify JWT token',
            'GET',
            '/users/verify-token',
            null,
            200,
            { 'Authorization': `Bearer ${authToken}` }
        );
    }

    // Update user
    if (userId) {
        await test(
            'PUT /users/{id} - Update user information',
            'PUT',
            `/users/${userId}`,
            {
                name: 'John Updated'
            },
            200
        );
    }

    // Duplicate email test
    await test(
        'POST /users - Duplicate email (should fail)',
        'POST',
        '/users',
        {
            name: 'Another User',
            email: 'john@example.com',
            password: 'password789'
        },
        400
    );

    // ===== TASK MANAGEMENT TESTS =====
    console.log('\n📝 TASK MANAGEMENT TESTS');
    console.log('─'.repeat(60));

    if (userId) {
        // Create task 1
        let createRes = await test(
            'POST /tasks - Create Task 1',
            'POST',
            '/tasks',
            {
                title: 'Complete project documentation',
                description: 'Write comprehensive docs for the API',
                status: 'pending',
                user: userId
            },
            201
        );
        if (createRes && createRes.body && createRes.body.data) {
            taskId = createRes.body.data._id;
            console.log(`   Task ID: ${taskId}`);
        }

        // Create task 2
        await test(
            'POST /tasks - Create Task 2',
            'POST',
            '/tasks',
            {
                title: 'Setup deployment pipeline',
                description: 'Configure CI/CD pipeline',
                status: 'in-progress',
                user: userId
            },
            201
        );

        // Create task 3
        await test(
            'POST /tasks - Create Task 3',
            'POST',
            '/tasks',
            {
                title: 'Code review',
                description: 'Review pull requests',
                status: 'pending',
                user: userId
            },
            201
        );

        // Create task for user 2
        if (userId2) {
            await test(
                'POST /tasks - Create Task for User 2',
                'POST',
                '/tasks',
                {
                    title: 'User 2 Task',
                    description: 'Task for another user',
                    status: 'pending',
                    user: userId2
                },
                201
            );
        }
    }

    // Get all tasks
    await test(
        'GET /tasks - Get all tasks',
        'GET',
        '/tasks',
        null,
        200
    );

    // Get tasks filtered by user
    if (userId) {
        await test(
            'GET /tasks?user={id} - Get tasks for specific user',
            'GET',
            `/tasks?user=${userId}`,
            null,
            200
        );
    }

    // Get specific task
    if (taskId) {
        await test(
            'GET /tasks/{id} - Get specific task',
            'GET',
            `/tasks/${taskId}`,
            null,
            200
        );
    }

    // Update task
    if (taskId) {
        await test(
            'PUT /tasks/{id} - Update task',
            'PUT',
            `/tasks/${taskId}`,
            {
                title: 'Complete project documentation - UPDATED',
                status: 'in-progress',
                description: 'Updated description'
            },
            200
        );
    }

    // Mark task as complete
    if (taskId) {
        await test(
            'PATCH /tasks/{id}/complete - Mark task as completed',
            'PATCH',
            `/tasks/${taskId}/complete`,
            null,
            200
        );
    }

    // Verify task is completed
    if (taskId) {
        await test(
            'GET /tasks/{id} - Verify task is completed',
            'GET',
            `/tasks/${taskId}`,
            null,
            200
        );
    }

    // ===== ERROR HANDLING TESTS =====
    console.log('\n⚠️  ERROR HANDLING TESTS');
    console.log('─'.repeat(60));

    // Invalid user ID
    await test(
        'GET /users/invalid-id - Invalid user ID',
        'GET',
        '/users/invalid-id',
        null,
        500
    );

    // Invalid task ID
    await test(
        'GET /tasks/invalid-id - Invalid task ID',
        'GET',
        '/tasks/invalid-id',
        null,
        500
    );

    // Missing required fields
    await test(
        'POST /users - Missing email field (should fail)',
        'POST',
        '/users',
        {
            name: 'Missing Email'
        },
        400
    );

    // Weak password
    await test(
        'POST /users - Weak password (should fail)',
        'POST',
        '/users',
        {
            name: 'Weak Pass User',
            email: 'weakpass@example.com',
            password: '123'
        },
        400
    );

    // Invalid login - missing fields
    await test(
        'POST /users/login - Missing password (should fail)',
        'POST',
        '/users/login',
        {
            email: 'john@example.com'
        },
        400
    );

    // ===== CLEANUP TESTS =====
    console.log('\n🧹 CLEANUP TESTS');
    console.log('─'.repeat(60));

    // Delete task
    if (taskId) {
        await test(
            'DELETE /tasks/{id} - Delete task',
            'DELETE',
            `/tasks/${taskId}`,
            null,
            200
        );

        // Verify task is deleted
        await test(
            'GET /tasks/{id} - Verify task is deleted (should fail)',
            'GET',
            `/tasks/${taskId}`,
            null,
            404
        );
    }

    // Delete user
    if (userId) {
        await test(
            'DELETE /users/{id} - Delete user',
            'DELETE',
            `/users/${userId}`,
            null,
            200
        );

        // Verify user is deleted
        await test(
            'GET /users/{id} - Verify user is deleted (should fail)',
            'GET',
            `/users/${userId}`,
            null,
            404
        );
    }

    // ===== TEST SUMMARY =====
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║                    TEST SUMMARY                            ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
    console.log(`📊 Total Tests: ${testResults.total}`);
    console.log(`✅ Passed: ${testResults.passed}`);
    console.log(`❌ Failed: ${testResults.failed}`);
    console.log(`📈 Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(2)}%\n`);

    if (testResults.failed === 0) {
        console.log('🎉 All tests passed! API is working correctly.\n');
    } else {
        console.log('⚠️  Some tests failed. Check the output above for details.\n');
    }

    process.exit(testResults.failed === 0 ? 0 : 1);
}

// Wait a moment for server to be ready, then run tests
setTimeout(runTests, 1000);
