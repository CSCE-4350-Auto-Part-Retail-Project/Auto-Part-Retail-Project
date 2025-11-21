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
    const isNumeric = !isNaN(Number(searchTerm)); // check if searchTerm is a number
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

//query all parts
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
