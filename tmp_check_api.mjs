const AGENT_ID = '015b4339-bdb2-45e5-abe7-88a09f0bc91a';
const API_KEY = '63bcf35c-9c27-4bb8-8f82-8680ae2ae85e';
const API_URL = 'https://web-chat-xi-five.vercel.app/api'; // Based on user script

async function check() {
  const r = await fetch(`${API_URL}/agents/${AGENT_ID}/config`, {
    headers: { 'X-Api-Key': API_KEY }
  });
  const data = await r.json();
  console.log(JSON.stringify(data, null, 2));
}

check().catch(console.error);
