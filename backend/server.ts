// server.ts
import express from 'express';
import cors from 'cors';
import {
  QueryForPart,
  QueryAllParts,
  findCustomerByCredentials,
  findEmployeeByCredentials,
  createCustomer,
  makeCustomerOrder,
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

app.post('/api/checkout', async (req, res) => {
  try {
    const { payment_id, order_id, amount, card_number, date } = req.body;

    if (!payment_id || !order_id || !amount || !card_number || !date) {
      return res.status(400).json({ error: 'Missing payment data' });
    }

    const payment = await makeCustomerOrder(payment_id, order_id, amount, card_number, date);
    res.json({ success: true, payment });
  } catch (err) {
    console.error('Error processing payment:', err);
    res.status(500).json({ error: 'Database insert failed' });
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

app.get('/api/parts/manage', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT part_id, part_number, part_name, price, img_url
      FROM parts
      ORDER BY part_id;
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error loading parts:', err);
    res.status(500).json({ message: 'Failed to load parts.' });
  }
});

// CREATE part
app.post('/api/parts/manage', async (req, res) => {
  const { part_number, part_name, price, img_url } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO parts (part_number, part_name, price, img_url)
       VALUES ($1, $2, $3, $4)
       RETURNING part_id, part_number, part_name, price, img_url`,
      [part_number, part_name, price, img_url]
    );

    res.status(201).json(result.rows[0]);
  } catch (err: any) {
    console.error('Error creating part:', err);

    if (err.code === '23505') {
      return res.status(400).json({ message: 'Part number already exists.' });
    }

    res.status(500).json({ message: 'Failed to create part.' });
  }
});

// UPDATE part
app.put('/api/parts/manage/:id', async (req, res) => {
  const id = Number(req.params.id);
  const { part_number, part_name, price, img_url } = req.body;

  try {
    const result = await pool.query(
      `UPDATE parts
       SET part_number = $1,
           part_name = $2,
           price = $3,
           img_url = $4
       WHERE part_id = $5
       RETURNING part_id, part_number, part_name, price, img_url`,
      [part_number, part_name, price, img_url, id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating part:', err);
    res.status(500).json({ message: 'Failed to update part.' });
  }
});

// DELETE part
app.delete('/api/parts/manage/:id', async (req, res) => {
  const id = Number(req.params.id);

  try {
    await pool.query(`DELETE FROM parts WHERE part_id = $1`, [id]);
    res.status(204).send();
  } catch (err) {
    console.error('Error deleting part:', err);
    res.status(500).json({ message: 'Failed to delete part.' });
  }
});
// GET all orders (one row per order item)
app.get('/api/orders', async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT 
        o.order_id,
        o.customer_name,
        o.order_date,
        oi.order_item_id,
        oi.quantity,
        p.part_id,
        p.part_number,
        p.part_name
      FROM orders o
      JOIN order_items oi ON o.order_id = oi.order_id
      JOIN parts p ON oi.part_id = p.part_id
      ORDER BY o.order_id DESC, oi.order_item_id;
      `
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Error loading orders:', err);
    res.status(500).json({ message: 'Failed to load orders.' });
  }
});

// create a new order
app.post('/api/orders', async (req, res) => {
  const { customer_name, part_number, quantity } = req.body;

  if (!customer_name || !part_number || !quantity) {
    return res.status(400).json({
      message: 'customer_name, part_number, and quantity are required.',
    });
  }

  try {
    // look up part by part_number
    const partResult = await pool.query(
      `SELECT part_id FROM parts WHERE part_number = $1`,
      [part_number]
    );

    if (partResult.rowCount === 0) {
      return res.status(400).json({ message: 'Part not found for that number.' });
    }

    const part = partResult.rows[0];

    // create order
    const orderResult = await pool.query(
      `
      INSERT INTO orders (customer_name)
      VALUES ($1)
      RETURNING order_id, customer_name, order_date
      `,
      [customer_name]
    );

    const order = orderResult.rows[0];

    // create order_item
    const itemResult = await pool.query(
      `
      INSERT INTO order_items (order_id, part_id, quantity)
      VALUES ($1, $2, $3)
      RETURNING order_item_id, quantity
      `,
      [order.order_id, part.part_id, quantity]
    );

    const item = itemResult.rows[0];

    res.status(201).json({
      order_id: order.order_id,
      customer_name: order.customer_name,
      order_date: order.order_date,
      order_item_id: item.order_item_id,
      quantity: item.quantity,
      part_id: part.part_id,
      part_number,
    });
  } catch (err) {
    console.error('Error creating order:', err);
    res.status(500).json({ message: 'Failed to create order.' });
  }
});

// delete an order
app.delete('/api/orders/:id', async (req, res) => {
  const id = Number(req.params.id);

  try {
    const result = await pool.query(
      `DELETE FROM orders WHERE order_id = $1`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    res.status(204).send();
  } catch (err) {
    console.error('Error deleting order:', err);
    res.status(500).json({ message: 'Failed to delete order.' });
  }
});

// Start server
app.listen(3001, () => {
  console.log('API server running on http://localhost:3001');
});
