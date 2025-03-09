// pages/api/getData.js
export default async function handler(req, res) {
    console.log('Request Received at /api/getData');
    
    if (req.method !== 'GET') {
      return res.status(405).json({ message: 'Method not allowed' });
    }
  
    const apiUrl = 'https://api.jsonbin.io/v3/b/67cd9070acd3cb34a8f798f6';
    const apiKey = process.env.JSONBIN_API_KEY;
  
    // Log the API URL and API key
    console.log('API URL:', apiUrl);
    console.log('API Key:', apiKey);
  
    try {
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Access-Key': apiKey,
        },
      });
  
      const data = await response.json();
  
      // Log the fetched data
      console.log('Fetched Data:', data);
  
      res.status(200).json(data);
    } catch (err) {
      console.error('Error:', err.message);
      res.status(500).json({ message: 'Failed to fetch data', error: err.message });
    }
  }
  