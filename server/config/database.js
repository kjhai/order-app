import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Render PostgreSQL은 SSL 연결이 필요합니다
const isProduction = process.env.NODE_ENV === 'production' || process.env.DB_HOST?.includes('render.com');

// PostgreSQL 연결 풀 생성
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'order_app',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  max: 20, // 최대 연결 수
  idleTimeoutMillis: 30000, // 유휴 연결 타임아웃
  connectionTimeoutMillis: 10000, // 연결 타임아웃 (Render는 더 긴 시간 필요)
  ssl: isProduction ? {
    rejectUnauthorized: false // Render PostgreSQL의 경우
  } : false,
});

// 연결 이벤트 핸들러
pool.on('connect', () => {
  console.log('✅ PostgreSQL 데이터베이스에 연결되었습니다.');
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL 연결 오류:', err);
  process.exit(-1);
});

// 데이터베이스 연결 테스트 함수
export async function testConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW(), version()');
    console.log('✅ 데이터베이스 연결 테스트 성공:', result.rows[0].now);
    console.log(`   PostgreSQL 버전: ${result.rows[0].version.split(',')[0]}`);
    client.release();
    return true;
  } catch (error) {
    console.error('❌ 데이터베이스 연결 테스트 실패:', error.message);
    return false;
  }
}

export default pool;

