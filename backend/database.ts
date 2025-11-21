import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config(); // load .env

const user = process.env.USER
const hostname = process.env.HOSTNAME
const database_name = process.env.DATABASE_NAME
const password = process.env.PASSWORD


const pool = new Pool({
    user: user,
    host: hostname,
    database: database_name,
    password: password,
    port: 5432, // default PostgreSQL port
});

export default pool;