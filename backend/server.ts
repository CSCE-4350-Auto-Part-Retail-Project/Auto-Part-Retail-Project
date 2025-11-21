// server.ts
import express from 'express';
import cors from 'cors';
import { QueryForPart, QueryAllParts } from './queries';

const app = express();

// Allow your React app to call the backend
app.use(cors());
app.use(express.json());

// API route your React app will hit
app.get('/api/parts', async (req, res) => {
  const search = (req.query.search as string) || '';

  try {
    let results;

    if (!search.trim()) {
      // No search term → return ALL parts
      results = await QueryAllParts();
    } else {
      // Search term → filtered search
      results = await QueryForPart(search);
    }

    res.json(results);
  } catch (err) {
    console.error('Error fetching parts:', err);
    res.status(500).json({ error: 'Database query failed' });
  }
});

// Start server
app.listen(3001, () => {
  console.log('API server running on http://localhost:3001');
});
