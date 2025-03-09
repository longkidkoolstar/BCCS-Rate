export default async function handler(req, res) {
    if (req.method !== 'PUT') {
      return res.status(405).json({ message: 'Method not allowed' });
    }
  
    const apiUrl = 'https://api.jsonbin.io/v3/b/67cd9070acd3cb34a8f798f6';
    const apiKey = process.env.JSONBIN_API_KEY;
  
    try {
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Access-Key': apiKey,
        },
        body: JSON.stringify(req.body),
      });
  
      const result = await response.json();
      res.status(response.status).json(result);
    } catch (err) {
      res.status(500).json({ message: 'Error updating data', error: err.message });
    }
  }
  