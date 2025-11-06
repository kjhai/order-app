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

// Render PostgreSQL은 SSL 연결이 필요합니다
const isProduction = process.env.NODE_ENV === 'production' || process.env.DB_HOST?.includes('render.com');

async function initDatabase() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'order_app',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    ssl: isProduction ? {
      rejectUnauthorized: false // Render PostgreSQL의 경우
    } : false,
    connectionTimeoutMillis: 10000, // Render는 더 긴 시간 필요
  });

  try {
    await client.connect();
    console.log('✅ 데이터베이스에 연결되었습니다.');

    await client.query('BEGIN');

    // 1. 테이블 생성
    console.log('📋 테이블 생성 중...');
    const tableQueries = [
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
      `CREATE TABLE IF NOT EXISTS options (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        price INTEGER DEFAULT 0,
        menu_id INTEGER REFERENCES menus(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        order_number VARCHAR(50) UNIQUE NOT NULL,
        order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'received', 'preparing', 'completed')),
        total_amount INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        menu_id INTEGER NOT NULL REFERENCES menus(id) ON DELETE RESTRICT,
        quantity INTEGER NOT NULL CHECK (quantity > 0),
        unit_price INTEGER NOT NULL,
        options JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
    ];

    for (const query of tableQueries) {
      await client.query(query);
    }

    // 인덱스 생성
    const indexQueries = [
      `CREATE INDEX IF NOT EXISTS idx_orders_order_date ON orders(order_date DESC)`,
      `CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)`,
      `CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id)`,
      `CREATE INDEX IF NOT EXISTS idx_order_items_menu_id ON order_items(menu_id)`,
      `CREATE INDEX IF NOT EXISTS idx_options_menu_id ON options(menu_id)`,
    ];

    for (const query of indexQueries) {
      await client.query(query);
    }

    // 트리거 함수 및 트리거 생성
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    await client.query(`
      DROP TRIGGER IF EXISTS update_menus_updated_at ON menus;
      CREATE TRIGGER update_menus_updated_at BEFORE UPDATE ON menus
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);

    await client.query(`
      DROP TRIGGER IF EXISTS update_options_updated_at ON options;
      CREATE TRIGGER update_options_updated_at BEFORE UPDATE ON options
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);

    await client.query(`
      DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
      CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);

    console.log('✅ 테이블 생성 완료');

    // 2. 초기 데이터 삽입 (이미 존재하면 건너뛰기)
    console.log('📊 초기 데이터 삽입 중...');
    
    const menuQueries = [
      `INSERT INTO menus (name, description, price, image, stock) VALUES 
       ('아메리카노(ICE)', '시원한 아메리카노', 4000, '/images/americano-ice.jpg', 10)
       ON CONFLICT DO NOTHING`,
      `INSERT INTO menus (name, description, price, image, stock) VALUES 
       ('아메리카노(HOT)', '따뜻한 아메리카노', 4000, '/images/americano-hot.jpg', 10)
       ON CONFLICT DO NOTHING`,
      `INSERT INTO menus (name, description, price, image, stock) VALUES 
       ('카페라떼', '부드러운 라떼', 5000, '/images/caffe-latte.jpg', 10)
       ON CONFLICT DO NOTHING`,
      `INSERT INTO menus (name, description, price, image, stock) VALUES 
       ('카푸치노', '향긋한 카푸치노', 5000, 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop', 10)
       ON CONFLICT DO NOTHING`,
      `INSERT INTO menus (name, description, price, image, stock) VALUES 
       ('에스프레소', '진한 에스프레소', 3500, 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=400&h=300&fit=crop', 10)
       ON CONFLICT DO NOTHING`,
      `INSERT INTO menus (name, description, price, image, stock) VALUES 
       ('바닐라라떼', '달콤한 바닐라라떼', 5500, 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=300&fit=crop', 10)
       ON CONFLICT DO NOTHING`,
    ];

    for (const query of menuQueries) {
      await client.query(query);
    }

    const optionQueries = [
      `INSERT INTO options (name, price, menu_id) VALUES 
       ('샷 추가', 500, NULL)
       ON CONFLICT DO NOTHING`,
      `INSERT INTO options (name, price, menu_id) VALUES 
       ('시럽 추가', 0, NULL)
       ON CONFLICT DO NOTHING`,
    ];

    for (const query of optionQueries) {
      await client.query(query);
    }

    // 이미지 URL 업데이트 (이미 업데이트된 경우 다시 업데이트)
    await client.query(
      `UPDATE menus SET image = '/images/americano-ice.jpg' WHERE name = '아메리카노(ICE)'`
    );
    await client.query(
      `UPDATE menus SET image = '/images/americano-hot.jpg' WHERE name = '아메리카노(HOT)'`
    );
    await client.query(
      `UPDATE menus SET image = '/images/caffe-latte.jpg' WHERE name = '카페라떼'`
    );

    await client.query('COMMIT');
    console.log('✅ 초기 데이터 삽입 완료');
    console.log('\n✅ 데이터베이스 초기화가 완료되었습니다!');
    await client.end();
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ 데이터베이스 초기화 중 오류 발생:', error.message);
    console.error(error);
    await client.end();
    process.exit(1);
  }
}

initDatabase();

