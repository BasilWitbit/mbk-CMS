import fs from 'fs';
import fetch from 'node-fetch'; // if needed, but native fetch works in Node 18+
import 'dotenv/config';

async function test() {
  const url = process.env.VITE_SUPABASE_URL + '/functions/v1/manage-users';
  const key = process.env.VITE_SUPABASE_ANON_KEY;
  console.log("Testing URL:", url);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ action: 'delete' }) // Simulate delete payload without user ID to see if we get our custom 400 error
    });
    console.log("Status:", res.status);
    console.log("Headers:", res.headers.raw());
    const body = await res.text();
    console.log("Response Body:", body);
  } catch(e) {
    console.error("Fetch failed:", e);
  }
}
test();
