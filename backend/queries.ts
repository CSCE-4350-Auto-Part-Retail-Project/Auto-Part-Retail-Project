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
    const result = await client.query(
      `
      SELECT
        part_number AS part_number,
        part_name AS part_name,
        (price::numeric)::float AS price,
        img_url
      FROM parts
      WHERE part_name ILIKE $1
      `,
      [`%${searchTerm}%`]
    );

    // Ensure JS types
    const parts: AutoPart[] = result.rows.map(row => ({
      part_number: row.part_number,
      part_name: row.part_name,
      price: Number(row.price), // safe conversion to number
      img_url: row.img_url,
    }));

    return parts;
  } finally {
    client.release();
  }
}
