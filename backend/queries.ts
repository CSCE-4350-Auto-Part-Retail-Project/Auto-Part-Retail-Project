// queries.ts
import pool from './database';

export interface AutoPart {
  part_number: number;
  part_name: string;
  price: number;
  img_url: string;
}

export async function QueryForPart(searchTerm: string): Promise<AutoPart[]> {
  const client = await pool.connect();
  try {
    const isNumeric = !isNaN(Number(searchTerm));
    const query = `
      SELECT
        part_number,
        part_name,
        (price::numeric)::float AS price,
        img_url
      FROM parts
      WHERE part_name ILIKE $1
      ${isNumeric ? 'OR part_number = $2' : ''}
    `;
    const params = isNumeric ? [`%${searchTerm}%`, Number(searchTerm)] : [`%${searchTerm}%`];
    const result = await client.query(query, params);
    return result.rows;
  } catch (err) {
    console.error('Error fetching parts:', err);
    return [];
  } finally {
    client.release();
  }
}

export async function QueryAllParts(): Promise<AutoPart[]> {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT 
        part_number,
        part_name,
        (price::numeric)::float AS price,
        img_url
      FROM parts
      ORDER BY part_name;
    `);

    return result.rows.map((row) => ({
      part_number: row.part_number,
      part_name: row.part_name,
      price: row.price,
      img_url: row.img_url,
    }));
  } finally {
    client.release();
  }
}

export async function createCustomer({
  username,
  password,
  customer_name,
  credit_card_number,
  billing_address,
  shipping_address,
  preferred_branch,
  owned_car,
}: {
  username: string;
  password: string;
  customer_name: string;
  credit_card_number: string;
  billing_address: string;
  shipping_address: string;
  preferred_branch: string;
  owned_car?: string;
}) {
  const result = await pool.query(
    `INSERT INTO customers (
       username,
       credit_card_number,
       billing_address,
       shipping_address,
       customer_name,
       password,
       preferred_branch${owned_car ? ', owned_car' : ''}
     )
     VALUES (
       $1, $2, $3, $4, $5, $6, $7${owned_car ? ', $8' : ''}
     )
     RETURNING username, customer_name, preferred_branch`,
    owned_car
      ? [
          username,
          credit_card_number,
          billing_address,
          shipping_address,
          customer_name,
          password,
          preferred_branch,
          owned_car,
        ]
      : [
          username,
          credit_card_number,
          billing_address,
          shipping_address,
          customer_name,
          password,
          preferred_branch,
        ]
  );

  return result.rows[0];
}


export async function findCustomerByCredentials(
  username: string,
  password: string
) {
  const result = await pool.query(
    `SELECT username, customer_name
     FROM customers
     WHERE username = $1 AND password = $2`,
    [username, password]
  );

  return result.rows[0] || null;
}

export async function findEmployeeByCredentials(
  username: string,
  password: string
) {
  const result = await pool.query(
    `SELECT employee_id, username, employee_name, employee_role
     FROM employee
     WHERE username = $1 AND password = $2`,
    [username, password]
  );

  return result.rows[0] || null;
}

export async function makeCustomerOrder(
  payment_id: number,
  order_id: number,
  amount: number,
  card_number: string,
  date: string
) {

  const result = await pool.query(
    `INSERT INTO payments(payment_id, order_id, amount, card_number, date)
     VALUES ($1, $2, $3, $4, $5)`,
    [payment_id, order_id, amount, card_number, date]
  );

  return result.rows[0] || null;
}
