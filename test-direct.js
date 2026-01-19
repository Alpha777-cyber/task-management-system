#!/usr/bin/env node

// Simple direct HTTP test
const http = require('http');

const tests = [
    { method: 'GET', path: '/', name: 'Welcome' },
    { method: 'GET', path: '/users', name: 'Get Users' },
    { method: 'GET', path: '/tasks', name: 'Get Tasks' },
];

let completed = 0;

function runTest(test) {
    return new Promise((resolve) => {
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: test.path,
            method: test.method,
            timeout: 5000
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                console.log(`✅ ${test.method} ${test.path} - Status: ${res.statusCode}`);
                completed++;
                resolve();
            });
        });

        req.on('error', (err) => {
            console.log(`❌ ${test.method} ${test.path} - Error: ${err.message}`);
            completed++;
            resolve();
        });

        req.on('timeout', () => {
            console.log(`❌ ${test.method} ${test.path} - Timeout`);
            req.destroy();
            completed++;
            resolve();
        });

        req.end();
    });
}

async function main() {
    console.log('\n========== API TESTS ==========\n');

    for (const test of tests) {
        await runTest(test);
    }

    console.log('\n✅ Tests completed\n');
    process.exit(0);
}

main().catch(err => {
    console.error('Fatal error:', err.message);
    process.exit(1);
});
