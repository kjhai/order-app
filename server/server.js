import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool, { testConnection } from './config/database.js';

// 환경 변수 로드
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 미들웨어 설정
app.use(cors()); // CORS 허용
app.use(express.json()); // JSON 파싱
app.use(express.urlencoded({ extended: true })); // URL 인코딩된 데이터 파싱

// 기본 라우트
app.get('/', (req, res) => {
  res.json({
    message: '커피 주문 앱 API 서버',
    version: '1.0.0',
    endpoints: {
      menus: '/api/menus',
      options: '/api/options',
      orders: '/api/orders'
    }
  });
});

// API 라우트
import apiRouter from './routes/index.js';
app.use('/api', apiRouter);

// 404 핸들러
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: '요청한 리소스를 찾을 수 없습니다.'
  });
});

// 에러 핸들러
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: '서버 내부 오류가 발생했습니다.'
  });
});

// 서버 시작
const server = app.listen(PORT, async () => {
  console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
  
  // 데이터베이스 연결 테스트
  await testConnection();
});

// 서버 종료 시 데이터베이스 연결 정리
process.on('SIGINT', async () => {
  console.log('\n서버를 종료합니다...');
  await pool.end();
  server.close(() => {
    console.log('서버가 종료되었습니다.');
    process.exit(0);
  });
});

process.on('SIGTERM', async () => {
  console.log('\n서버를 종료합니다...');
  await pool.end();
  server.close(() => {
    console.log('서버가 종료되었습니다.');
    process.exit(0);
  });
});

export default app;
