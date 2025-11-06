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

async function updateMenuImages() {
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

    // 이미지 URL 업데이트
    const updates = [
      { name: '아메리카노(ICE)', image: '/images/americano-ice.jpg' },
      { name: '아메리카노(HOT)', image: '/images/americano-hot.jpg' },
      { name: '카페라떼', image: '/images/caffe-latte.jpg' },
    ];

    for (const update of updates) {
      const result = await client.query(
        'UPDATE menus SET image = $1 WHERE name = $2 RETURNING id, name, image',
        [update.image, update.name]
      );
      
      if (result.rows.length > 0) {
        console.log(`✅ ${update.name} 이미지 업데이트 완료: ${update.image}`);
      } else {
        console.log(`⚠️  ${update.name} 메뉴를 찾을 수 없습니다.`);
      }
    }

    await client.query('COMMIT');
    console.log('\n✅ 모든 이미지 업데이트가 완료되었습니다.');
    await client.end();
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ 이미지 업데이트 중 오류 발생:', error.message);
    console.error(error);
    await client.end();
    process.exit(1);
  }
}

updateMenuImages();
