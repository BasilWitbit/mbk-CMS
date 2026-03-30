require('dotenv').config();
const url = process.env.VITE_SUPABASE_URL + '/functions/v1/manage-users';
const key = process.env.VITE_SUPABASE_ANON_KEY;

fetch(url, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${key}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ action: 'delete' }) // testing
})
.then(res => {
  console.log("Status:", res.status);
  return res.text();
})
.then(text => console.log("Body:", text))
.catch(console.error);
