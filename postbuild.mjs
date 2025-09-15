// postbuild.mjs
import fs from 'fs-extra';
import path from 'path';

console.log('Starting postbuild script...');

const sourceDir = path.join(process.cwd(), 'starters');
const functionsDir = path.join(process.cwd(), '.vercel/output/functions');

// Check if the functions directory exists
if (!fs.existsSync(functionsDir)) {
  console.log('Functions output directory not found. Skipping copy.');
  process.exit(0);
}

// Find the directory that matches the dynamic route pattern for /api/template/[id]
const allFunctions = fs.readdirSync(functionsDir);
const targetFuncDir = allFunctions.find((dir) =>
  dir.startsWith('api_template_') && dir.endsWith('.func')
);

if (targetFuncDir) {
  const destDir = path.join(functionsDir, targetFuncDir, 'starters');
  console.log(`Source directory: ${sourceDir}`);
  console.log(`Found target function: ${targetFuncDir}`);
  console.log(`Destination directory: ${destDir}`);

  // Copy the starters directory into the found function directory
  fs.copySync(sourceDir, destDir, { overwrite: true });
  console.log('✅ Successfully copied template files to serverless function.');
} else {
  console.log(
    '⚠️ Warning: Could not find a compiled function directory for the template API route.'
  );
}

console.log('Postbuild script finished.');