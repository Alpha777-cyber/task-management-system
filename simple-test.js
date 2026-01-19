const http = require('http');

const tests = [
    { name: 'GET /', method: 'GET', path: '/' },
    { name: 'GET /api-docs', method: 'GET', path: '/api-docs' },
    { name: 'GET /users', method: 'GET', path: '/users' },
    { name: 'GET /tasks', method: 'GET', path: '/tasks' },
];

let completed = 0;

tests.forEach(test => {
    const req = http.request({
        hostname: 'localhost',
        port: 5000,
        path: test.path,
        method: test.method
    }, (res) => {
        console.log(`✅ ${test.name} - Status: ${res.statusCode}`);
        completed++;
        if (completed === tests.length) {
            console.log(`\nAll ${tests.length} tests completed!`);
            process.exit(0);
        }
    });

    req.on('error', (err) => {
        console.log(`❌ ${test.name} - Error: ${err.message}`);
        completed++;
        if (completed === tests.length) {
            process.exit(1);
        }
    });

    req.end();
});
