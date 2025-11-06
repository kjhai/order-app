import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// .env 파일 경로 설정
const envPath = join(__dirname, '..', '.env');
if (existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

const { Client } = pg;

async function createTables() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'order_app',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
  });

  try {
    await client.connect();
    console.log('✅ 데이터베이스에 연결되었습니다.');

    // 테이블 생성 쿼리들
    const queries = [
      // Menus 테이블
      `CREATE TABLE IF NOT EXISTS menus (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price INTEGER NOT NULL,
        image VARCHAR(500),
        stock INTEGER DEFAULT 10 CHECK (stock >= 0),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      // Options 테이블
      `CREATE TABLE IF NOT EXISTS options (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        price INTEGER DEFAULT 0,
        menu_id INTEGER REFERENCES menus(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      // Orders 테이블
      `CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        order_number VARCHAR(50) UNIQUE NOT NULL,
        order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'received', 'preparing', 'completed')),
        total_amount INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      // OrderItems 테이블
      `CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        menu_id INTEGER NOT NULL REFERENCES menus(id) ON DELETE RESTRICT,
        quantity INTEGER NOT NULL CHECK (quantity > 0),
        unit_price INTEGER NOT NULL,
        options JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      // 인덱스 생성
      `CREATE INDEX IF NOT EXISTS idx_orders_order_date ON orders(order_date DESC)`,
      `CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)`,
      `CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id)`,
      `CREATE INDEX IF NOT EXISTS idx_order_items_menu_id ON order_items(menu_id)`,
      `CREATE INDEX IF NOT EXISTS idx_options_menu_id ON options(menu_id)`,

      // updated_at 자동 업데이트 트리거 함수
      `CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';`,

      // 트리거 생성
      `DROP TRIGGER IF EXISTS update_menus_updated_at ON menus;
       CREATE TRIGGER update_menus_updated_at BEFORE UPDATE ON menus
       FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();`,

      `DROP TRIGGER IF EXISTS update_options_updated_at ON options;
       CREATE TRIGGER update_options_updated_at BEFORE UPDATE ON options
       FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();`,

      `DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
       CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
       FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();`,
    ];

    for (const query of queries) {
      await client.query(query);
    }

    console.log('✅ 모든 테이블이 생성되었습니다.');
    await client.end();
  } catch (error) {
    console.error('❌ 테이블 생성 중 오류 발생:', error.message);
    console.error(error);
    await client.end();
    process.exit(1);
  }
}

createTables();

