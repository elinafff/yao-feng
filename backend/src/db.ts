import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config();

const JSON_DB_PATH = path.join(process.cwd(), 'db.json');
const DB_NAME = process.env.MYSQL_DATABASE || process.env.DB_NAME || 'pet_adoption';
const TABLE_NAME = process.env.MYSQL_TABLE || 'collection_items';

const initialData: Record<string, any[]> = {
  users: [],
  pets: [
    {
      id: 'p_1',
      name: '雪莉',
      type: 'dog',
      breed: '柯基',
      age: '2岁',
      gender: '妹妹',
      province: '广东省',
      city: '广州市',
      district: '天河区',
      status: '开放申请',
      photos: ['https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=200'],
      views: 120,
      favorites: 45,
      ownerNickname: '大白铲屎官'
    },
    {
      id: 'p_2',
      name: '布丁',
      type: 'cat',
      breed: '英短蓝猫',
      age: '6个月',
      gender: '弟弟',
      province: '北京市',
      city: '北京市',
      district: '朝阳区',
      status: '开放申请',
      photos: ['https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=200'],
      views: 89,
      favorites: 23,
      ownerNickname: '猫奴一号'
    }
  ],
  applications: [],
  rescue_records: [],
  medical_records: [],
  end_of_life_records: [],
  feedback_plans: [],
  admins: [
    {
      id: 'admin_1',
      username: 'admin',
      password: 'admin123',
      role: 'superadmin'
    }
  ],
  logs: []
};

const connectionConfig = {
  host: process.env.MYSQL_HOST || process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.MYSQL_PORT || process.env.DB_PORT || 3306),
  user: process.env.MYSQL_USER || process.env.DB_USER || 'root',
  password: process.env.MYSQL_PASSWORD || process.env.DB_PASSWORD || '',
  charset: 'utf8mb4'
};

const pool = mysql.createPool({
  ...connectionConfig,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  namedPlaceholders: true
});

const parseJsonValue = (value: unknown) => {
  if (typeof value === 'string') {
    return JSON.parse(value);
  }
  return value;
};

const getSeedData = () => {
  if (!fs.existsSync(JSON_DB_PATH)) {
    return initialData;
  }

  const file = fs.readFileSync(JSON_DB_PATH, 'utf-8');
  return JSON.parse(file);
};

export const initDB = async () => {
  const bootstrap = await mysql.createConnection(connectionConfig);
  await bootstrap.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await bootstrap.end();

  await pool.query(`
    CREATE TABLE IF NOT EXISTS \`${TABLE_NAME}\` (
      collection_name VARCHAR(80) NOT NULL,
      item_id VARCHAR(160) NOT NULL,
      data JSON NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (collection_name, item_id),
      INDEX idx_collection_name (collection_name)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  const [rows] = await pool.query<mysql.RowDataPacket[]>(`SELECT COUNT(*) AS count FROM \`${TABLE_NAME}\``);
  if (Number(rows[0]?.count || 0) > 0) {
    return;
  }

  await writeDB(getSeedData());
};

export const readDB = async () => {
  const [rows] = await pool.query<mysql.RowDataPacket[]>(
    `SELECT collection_name, data FROM \`${TABLE_NAME}\` ORDER BY created_at ASC`
  );

  return rows.reduce<Record<string, any[]>>((db, row) => {
    const collectionName = row.collection_name as string;
    if (!db[collectionName]) {
      db[collectionName] = [];
    }
    db[collectionName].push(parseJsonValue(row.data));
    return db;
  }, {});
};

export const writeDB = async (data: Record<string, any[]>) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.query(`DELETE FROM \`${TABLE_NAME}\``);

    for (const [collectionName, items] of Object.entries(data)) {
      if (!Array.isArray(items)) {
        continue;
      }

      for (const item of items) {
        if (!item?.id) {
          continue;
        }

        await connection.query(
          `INSERT INTO \`${TABLE_NAME}\` (collection_name, item_id, data)
           VALUES (?, ?, ?)`,
          [collectionName, item.id, JSON.stringify(item)]
        );
      }
    }

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export const getCollection = async (name: string) => {
  const [rows] = await pool.query<mysql.RowDataPacket[]>(
    `SELECT data FROM \`${TABLE_NAME}\` WHERE collection_name = ? ORDER BY created_at ASC`,
    [name]
  );
  return rows.map((row) => parseJsonValue(row.data));
};

export const saveToCollection = async (name: string, item: any) => {
  await pool.query(
    `INSERT INTO \`${TABLE_NAME}\` (collection_name, item_id, data)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE data = VALUES(data)`,
    [name, item.id, JSON.stringify(item)]
  );
  return item;
};

export const deleteFromCollection = async (name: string, id: string) => {
  const [result] = await pool.query<mysql.ResultSetHeader>(
    `DELETE FROM \`${TABLE_NAME}\` WHERE collection_name = ? AND item_id = ?`,
    [name, id]
  );
  return result.affectedRows > 0;
};
