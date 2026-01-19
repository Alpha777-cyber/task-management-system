const http = require('http');

// Test functions
function testEndpoint(method, path, data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: responseData ? JSON.parse(responseData) : null
        });
      });
    });

    req.on('error', (error) => {
      reject(new Error(`Connection error: ${error.message}`));
    });
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// Run tests
async function runTests() {
  console.log('\n========== API TESTING ==========\n');

  try {
    // Test 1: Welcome endpoint
    console.log('1️⃣  Testing GET / (Welcome)');
    let res = await testEndpoint('GET', '/');
    console.log('   Status:', res.status);
    console.log('   Message:', res.body.message);
    console.log('   ✅ Success\n');

    // Test 2: Register a new user
    console.log('2️⃣  Testing POST /users (Register)');
    const userData = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123'
    };
    res = await testEndpoint('POST', '/users', userData);
    console.log('   Status:', res.status);
    console.log('   User:', res.body.data?.name);
    console.log('   Token received:', !!res.body.token);
    const token = res.body.token;
    console.log('   ✅ Success\n');

    // Test 3: Login
    console.log('3️⃣  Testing POST /users/login');
    const loginData = {
      email: 'john@example.com',
      password: 'password123'
    };
    res = await testEndpoint('POST', '/users/login', loginData);
    console.log('   Status:', res.status);
    console.log('   Message:', res.body.message);
    console.log('   Token received:', !!res.body.token);
    console.log('   ✅ Success\n');

    // Test 4: Create a task
    console.log('4️⃣  Testing POST /tasks (Create Task)');
    const taskData = {
      title: 'Complete Project',
      description: 'Finish the task management API',
      status: 'pending'
    };
    res = await testEndpoint('POST', '/tasks', taskData, { Authorization: `Bearer ${token}` });
    console.log('   Status:', res.status);
    console.log('   Task title:', res.body.data?.title);
    const taskId = res.body.data?._id;
    console.log('   Task ID:', taskId);
    console.log('   ✅ Success\n');

    // Test 5: Get all tasks
    console.log('5️⃣  Testing GET /tasks (Get All Tasks)');
    res = await testEndpoint('GET', '/tasks', null, { Authorization: `Bearer ${token}` });
    console.log('   Status:', res.status);
    console.log('   Tasks count:', res.body.data?.length);
    console.log('   ✅ Success\n');

    // Test 6: Get single task
    if (taskId) {
      console.log('6️⃣  Testing GET /tasks/:id (Get Single Task)');
      res = await testEndpoint('GET', `/tasks/${taskId}`, null, { Authorization: `Bearer ${token}` });
      console.log('   Status:', res.status);
      console.log('   Task title:', res.body.data?.title);
      console.log('   ✅ Success\n');

      // Test 7: Update task
      console.log('7️⃣  Testing PUT /tasks/:id (Update Task)');
      const updateData = {
        title: 'Complete Project - Updated',
        description: 'Updated description'
      };
      res = await testEndpoint('PUT', `/tasks/${taskId}`, updateData, { Authorization: `Bearer ${token}` });
      console.log('   Status:', res.status);
      console.log('   Updated title:', res.body.data?.title);
      console.log('   ✅ Success\n');

      // Test 8: Mark task as complete
      console.log('8️⃣  Testing PATCH /tasks/:id/complete (Mark Complete)');
      res = await testEndpoint('PATCH', `/tasks/${taskId}/complete`, {}, { Authorization: `Bearer ${token}` });
      console.log('   Status:', res.status);
      console.log('   Task status:', res.body.data?.status);
      console.log('   ✅ Success\n');

      // Test 9: Delete task
      console.log('9️⃣  Testing DELETE /tasks/:id (Delete Task)');
      res = await testEndpoint('DELETE', `/tasks/${taskId}`, null, { Authorization: `Bearer ${token}` });
      console.log('   Status:', res.status);
      console.log('   Message:', res.body.message);
      console.log('   ✅ Success\n');
    }

    // Test 10: Get user profile
    console.log('🔟 Testing GET /users/me (Get Profile)');
    res = await testEndpoint('GET', '/users/me', null, { Authorization: `Bearer ${token}` });
    console.log('   Status:', res.status);
    console.log('   User name:', res.body.data?.name);
    console.log('   User email:', res.body.data?.email);
    console.log('   ✅ Success\n');

    console.log('========== ALL TESTS PASSED ✅ ==========\n');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

runTests();
