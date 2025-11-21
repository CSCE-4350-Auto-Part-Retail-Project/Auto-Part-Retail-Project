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

