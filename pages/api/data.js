export default async function handler(req, res) {
    const apiKey = process.env.JSONBIN_API_KEY;
  
    try {
      const response = await fetch('https://api.jsonbin.io/v3/b/67cd9070acd3cb34a8f798f6', {
        headers: {
          'X-Master-Key': apiKey,
        },
      });
  
      const data = await response.json();
      res.status(200).json(data);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch data' });
    }
  }
  