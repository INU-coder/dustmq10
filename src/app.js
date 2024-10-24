import express from 'express';
import signRoutes from './sign.js';
import playerRoutes from './player.js';
import cors from 'cors'; // CORS 설정

const app = express();

app.use(cors()); // 모든 도메인에서 접근 허용
app.use(express.json()); // JSON 요청 파싱

// 라우터 통합
app.use('/auth', signRoutes); // 인증 관련 경로
app.use('/player', playerRoutes); // 플레이어 관련 경로 추가

// 오류 핸들링 미들웨어
app.use((err, req, res, next) => {
  console.error('오류가 발생했습니다:', err.stack);
  res
    .status(500)
    .json({ message: '서버 내부 오류가 발생했습니다.', error: err.message });
});

// 서버 실행
app.listen(8080, () => {
  console.log('서버가 8080 포트에서 실행 중입니다.');
});
