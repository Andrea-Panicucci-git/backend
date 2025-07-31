const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mysql = require('mysql2/promise');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const {
  DB_HOST,
  DB_USER,
  DB_PASSWORD,
  DB_NAME,
  PORT = 3000
} = process.env;

const pool = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: {
    rejectUnauthorized: false
  }
});
app.get('/contatti', async (req, res) => {
  const search = req.query.query || '';
  try {
    const [rows] = await pool.query(
      'SELECT * FROM contatti WHERE nome LIKE ? OR email LIKE ?',
      [`%${search}%`, `%${search}%`]

    );

    res.json(rows);
  } catch (error) {
    console.error('Errore DB:', error);
    res.status(500).json({ error: 'Errore interno del server', details: error.message });
  }
});

app.post('/contatti', async (req, res) => {
  const { nome, email, telefono } = req.body;
  if (!nome || !email || !telefono) {
    return res.status(400).json({ error: 'Nome, email e telefono sono richiesti' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO contatti (nome, email, telefono) VALUES (?, ?, ?)',
      [nome, email, telefono]
    );
    res.json({ id: result.insertId, nome, email, telefono });
  } catch (error) {
    console.error('Errore DB:', error);
    res.status(500).json({ error: 'Errore interno del server', details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server avviato su http://localhost:${PORT}`);
});
