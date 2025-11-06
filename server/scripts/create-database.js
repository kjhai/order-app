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

// PostgreSQL에 데이터베이스 생성 스크립트
async function createDatabase() {
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: 'postgres', // 기본 데이터베이스에 연결
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
  };

  console.log('데이터베이스 연결 설정:');
  console.log(`  호스트: ${dbConfig.host}`);
  console.log(`  포트: ${dbConfig.port}`);
  console.log(`  사용자: ${dbConfig.user}`);
  console.log(`  비밀번호: ${dbConfig.password ? `*** (길이: ${dbConfig.password.length}자)` : '(설정되지 않음)'}`);
  console.log('');

  const client = new Client(dbConfig);

  try {
    await client.connect();
    console.log('✅ PostgreSQL 서버에 연결되었습니다.');

    const dbName = process.env.DB_NAME || 'order_app';
    
    // 데이터베이스 존재 여부 확인
    const checkDbQuery = `
      SELECT 1 FROM pg_database WHERE datname = $1
    `;
    const dbExists = await client.query(checkDbQuery, [dbName]);

    if (dbExists.rows.length > 0) {
      console.log(`ℹ️  데이터베이스 '${dbName}'가 이미 존재합니다.`);
    } else {
      // 데이터베이스 생성
      await client.query(`CREATE DATABASE ${dbName}`);
      console.log(`✅ 데이터베이스 '${dbName}'가 생성되었습니다.`);
    }

    await client.end();
    
    // 생성된 데이터베이스에 연결하여 테스트
    const testClient = new Client({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: dbName,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
    });

    await testClient.connect();
    const result = await testClient.query('SELECT NOW(), version()');
    console.log('✅ 데이터베이스 연결 테스트 성공!');
    console.log(`  현재 시간: ${result.rows[0].now}`);
    console.log(`  PostgreSQL 버전: ${result.rows[0].version.split(',')[0]}`);
    await testClient.end();

    console.log('\n✅ 모든 작업이 완료되었습니다!');

  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
    console.error('\n데이터베이스 생성 중 오류가 발생했습니다.');
    console.error('다음 사항을 확인해주세요:');
    console.error('1. PostgreSQL이 실행 중인지 확인');
    console.error('2. .env 파일의 DB_USER와 DB_PASSWORD가 올바른지 확인');
    console.error('3. PostgreSQL 사용자에게 데이터베이스 생성 권한이 있는지 확인');
    console.error('\n오류 상세:');
    console.error(error);
    process.exit(1);
  }
}

createDatabase();

