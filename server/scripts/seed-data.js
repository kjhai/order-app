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

async function seedData() {
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

    await client.query('BEGIN');

    // 메뉴 데이터 삽입
    const menuQueries = [
      `INSERT INTO menus (name, description, price, image, stock) VALUES 
       ('아메리카노(ICE)', '시원한 아메리카노', 4000, 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&h=300&fit=crop', 10)
       ON CONFLICT DO NOTHING`,
      `INSERT INTO menus (name, description, price, image, stock) VALUES 
       ('아메리카노(HOT)', '따뜻한 아메리카노', 4000, 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop', 10)
       ON CONFLICT DO NOTHING`,
      `INSERT INTO menus (name, description, price, image, stock) VALUES 
       ('카페라떼', '부드러운 라떼', 5000, 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=300&fit=crop', 10)
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

    // 옵션 데이터 삽입
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

    await client.query('COMMIT');
    console.log('✅ 초기 데이터가 생성되었습니다.');
    await client.end();
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ 데이터 생성 중 오류 발생:', error.message);
    console.error(error);
    await client.end();
    process.exit(1);
  }
}

seedData();

