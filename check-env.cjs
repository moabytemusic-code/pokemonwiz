const fs = require('fs');
const envText = fs.readFileSync('/Users/kmtwarrior/projects2026/pokemon-wiz/.env.local', 'utf-8');
// Just print the keys without the values
const lines = envText.split('\n').filter(l => l.trim() && !l.startsWith('#'));
for (const line of lines) {
  const [key, val] = line.split('=');
  console.log(key + '=' + (val ? val.substring(0, 15) + '...' : ''));
}
