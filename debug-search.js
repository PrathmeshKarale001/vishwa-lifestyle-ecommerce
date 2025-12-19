const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'your_project_id', // I need to find this from sanity/env.ts or .env
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
});

// Wait, I can't easily run this without the env vars.
// I'll use a simpler approach: add logging to the search function in lib/sanity.ts temporarily or just inspect the code.
