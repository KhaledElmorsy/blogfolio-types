const fs = require('node:fs');
const path = require('node:path');

fs.rmSync(path.resolve(process.cwd(), './build/'), {
  recursive: true,
  force: true,
});
