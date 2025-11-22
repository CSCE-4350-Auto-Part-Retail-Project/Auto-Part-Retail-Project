// server.ts
import express from 'express';
import cors from 'cors';
import {
  QueryForPart,
  QueryAllParts,
  findCustomerByCredentials,
  findEmployeeByCredentials
} from './queries';

const app = express();

// Allow your React app to call the backend
app.use(cors());
app.use(express.json());

// Login route
app.post('/api/login', async (req, res) => {
  const { username, password, mode } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  const loginMode = mode === 'employee' ? 'employee' : 'customer';

  try {
    let user;

    if (loginMode === 'employee') {
      user = await findEmployeeByCredentials(username, password);
    } else {
      user = await findCustomerByCredentials(username, password);
    }

    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password.' });
    }

    res.json({
      username: user.username,
      displayName: user.customer_name || user.employee_name,
      role: loginMode,
      employeeRole: user.employee_role || null
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

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
