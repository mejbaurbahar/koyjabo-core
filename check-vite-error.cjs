const http = require('http');

function get(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body }));
    }).on('error', reject);
  });
}

async function main() {
  const r = await get('http://localhost:3001/intercity/offlineService.ts');
  console.log('Status:', r.status);
  console.log('Body length:', r.body.length);
  console.log('Body start:', r.body.slice(0, 500));
}
main().catch(console.error);
