import fs from 'fs';

const files = [
  'src/pages/Companies.tsx',
  'src/pages/Pipeline.tsx',
  'src/pages/Dashboard.tsx',
  'src/pages/Reports.tsx',
  'src/components/Layout.tsx',
  'src/App.tsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/customers/g, 'companies');
  content = content.replace(/Customers/g, 'Companies');
  content = content.replace(/Customer/g, 'Company');
  content = content.replace(/customer/g, 'company');
  fs.writeFileSync(file, content);
}
console.log('Done');
