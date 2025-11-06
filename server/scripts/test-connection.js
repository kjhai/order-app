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

// 간단한 연결 테스트
async function testConnection() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'postgres',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    ssl: isProduction ? {
      rejectUnauthorized: false // Render PostgreSQL의 경우
    } : false,
    connectionTimeoutMillis: 10000, // Render는 더 긴 시간 필요
  });

  console.log('PostgreSQL 연결 테스트 중...');
  console.log(`호스트: ${client.host}`);
  console.log(`포트: ${client.port}`);
  console.log(`사용자: ${client.user}`);
  console.log(`비밀번호 길이: ${client.password ? client.password.length : 0}자\n`);

  try {
    await client.connect();
    console.log('✅ 연결 성공!');
    
    const result = await client.query('SELECT version(), current_database(), current_user');
    console.log('\n연결 정보:');
    console.log(`  PostgreSQL 버전: ${result.rows[0].version.split(',')[0]}`);
    console.log(`  현재 데이터베이스: ${result.rows[0].current_database}`);
    console.log(`  현재 사용자: ${result.rows[0].current_user}`);
    
    await client.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ 연결 실패:', error.message);
    console.error('\n가능한 해결 방법:');
    console.error('1. PostgreSQL이 실행 중인지 확인');
    console.error('2. .env 파일의 DB_PASSWORD가 실제 PostgreSQL 비밀번호와 일치하는지 확인');
    console.error('3. PostgreSQL 비밀번호를 재설정하려면:');
    console.error('   psql -U postgres -c "ALTER USER postgres WITH PASSWORD \'새비밀번호\';"');
    console.error('4. 또는 pgAdmin을 사용하여 비밀번호를 확인/변경하세요');
    process.exit(1);
  }
}

testConnection();

