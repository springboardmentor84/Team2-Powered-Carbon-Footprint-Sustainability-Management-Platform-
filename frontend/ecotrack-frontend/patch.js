const fs = require('fs');
const file = '/Users/fahadfurquan/Desktop/EcoTrack/frontend/ecotrack-frontend/src/app/features/reports/components/reports-history/reports-history.ts';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(
  'next: (history) => {',
  "next: (history) => {\n        console.log('HISTORY RECEIVED IN COMPONENT:', history);"
);
fs.writeFileSync(file, content);
