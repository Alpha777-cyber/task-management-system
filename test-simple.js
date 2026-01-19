const http = require('http');

async function testAPI() {
  const tests = [
    { method: 'GET', path: '/', name: 'Welcome' },
  ];

  for (const test of tests) {
    try {
      const data = await new Promise((resolve, reject) => {
        const options = {
          hostname: 'localhost',
          port: 5000,
          path: test.path,
          method: test.method
        };

        console.log(`Testing ${test.method} ${test.path}...`);

        const req = http.request(options, (res) => {
          let body = '';
          res.on('data', chunk => body += chunk);
          res.on('end', () => {
            console.log(`✅ ${test.name} - Status: ${res.statusCode}`);
            try {
              console.log(JSON.stringify(JSON.parse(body), null, 2));
            } catch (e) {
              console.log(body);
            }
            console.log('');
            resolve();
          });
        });

        req.on('error', (err) => {
          console.log(`❌ Error: ${err.message}\n`);
          reject(err);
        });

        req.end();
      });
    } catch (e) {
      console.log(`Failed: ${e.message}\n`);
    }
  }
}

testAPI();
