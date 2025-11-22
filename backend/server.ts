// server.ts
import express from 'express';
import cors from 'cors';
import {
  QueryForPart,
  QueryAllParts,
  findCustomerByCredentials,
  findEmployeeByCredentials,
  createCustomer,
} from './queries';
import pool from './database';

const app = express();

// Allow your React app to call the backend
app.use(cors());
app.use(express.json());

// Login route
app.post('/api/login', async (req, res) => {
  const { username, password, mode } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: 'Username and password are required.' });
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
      employeeRole: user.employee_role || null,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Customer registration route
app.post('/api/customers', async (req, res) => {
  const {
    username,
    password,
    customer_name,
    credit_card_number,
    billing_address,
    shipping_address,
    preferred_branch,
    owned_car,
  } = req.body;

  if (
    !username ||
    !password ||
    !customer_name ||
    !credit_card_number ||
    !billing_address ||
    !shipping_address ||
    !preferred_branch
  ) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    const newCustomer = await createCustomer({
      username,
      password,
      customer_name,
      credit_card_number,
      billing_address,
      shipping_address,
      preferred_branch,
      owned_car,
    });

    return res.status(201).json({
      username: newCustomer.username,
      displayName: newCustomer.customer_name,
      role: 'customer',
    });
  } catch (err: any) {
    console.error('Registration error:', err);

    if (err.code === '23505') {
      return res.status(409).json({ message: 'Username already exists.' });
    }

    return res.status(500).json({ message: 'Failed to create customer.' });
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

app.get('/api/employees', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT employee_id, employee_name, employee_role, username
       FROM employee
       ORDER BY employee_id`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching employees:', err);
    res.status(500).json({ message: 'Failed to load employees.' });
  }
});

app.post('/api/employees', async (req, res) => {
  const { employee_name, employee_role, username, password } = req.body;

  if (!employee_name || !username || !password) {
    return res.status(400).json({
      message: 'employee_name, username, and password are required.',
    });
  }

  try {
    const result = await pool.query(
      `INSERT INTO employee (employee_name, employee_role, username, password)
       VALUES ($1, $2, $3, $4)
       RETURNING employee_id, employee_name, employee_role, username`,
      [employee_name, employee_role, username, password]
    );

    res.status(201).json(result.rows[0]);
  } catch (err: any) {
    console.error('Error creating employee:', err);

    if (err.code === '23505') {
      return res.status(400).json({ message: 'Username already exists.' });
    }

    res.status(500).json({ message: 'Failed to create employee.' });
  }
});

app.put('/api/employees/:id', async (req, res) => {
  const id = Number(req.params.id);
  const { employee_name, employee_role, username, password } = req.body;

  if (!employee_name || !username) {
    return res.status(400).json({
      message: 'employee_name and username are required.',
    });
  }

  try {
    let query: string;
    let params: any[];

    if (password && password.trim() !== '') {
      query = `
        UPDATE employee
        SET employee_name = $1,
            employee_role = $2,
            username = $3,
            password = $4
        WHERE employee_id = $5
        RETURNING employee_id, employee_name, employee_role, username
      `;
      params = [employee_name, employee_role, username, password, id];
    } else {
      query = `
        UPDATE employee
        SET employee_name = $1,
            employee_role = $2,
            username = $3
        WHERE employee_id = $4
        RETURNING employee_id, employee_name, employee_role, username
      `;
      params = [employee_name, employee_role, username, id];
    }

    const result = await pool.query(query, params);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Employee not found.' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating employee:', err);
    res.status(500).json({ message: 'Failed to update employee.' });
  }
});

app.delete('/api/employees/:id', async (req, res) => {
  const id = Number(req.params.id);

  try {
    const result = await pool.query(
      `DELETE FROM employee WHERE employee_id = $1`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Employee not found.' });
    }

    res.status(204).send();
  } catch (err) {
    console.error('Error deleting employee:', err);
    res.status(500).json({ message: 'Failed to delete employee.' });
  }
});

// Start server
app.listen(3001, () => {
  console.log('API server running on http://localhost:3001');
});
