const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());

// JSON 형식 POST 요청 처리
app.use(express.json());

//  MySQL 연결 설정
const db = mysql.createConnection({
  host: 'localhost',           // 또는 railway 주소
  user: 'root',                // 사용자명
  password: '1234',   // 비밀번호
  database: 'test'             // DB 이름
});

//  DB 연결 테스트
db.connect((err) => {
  if (err) {
    console.error(' DB 연결 실패:', err);
    process.exit(1);
  }
  console.log(' MySQL 연결 성공!');
});


//  [GET] 특정 날짜 일정 목록 가져오기
app.get('/todos', (req, res) => {
  const date = req.query.date;

  if (!date) {
    return res.status(400).send('날짜 (date) 파라미터가 필요합니다.');
  }

  const sql = 'SELECT hour, task FROM todo WHERE date = ? ORDER BY hour';
  db.query(sql, [date], (err, results) => {
    if (err) {
      console.error(' DB 조회 실패:', err);
      return res.status(500).send('DB 조회 오류');
    }
    res.json(results); // [{ hour: 8, task: "수업" }, ...]
  });
});


//  [POST] 일정 저장 or 수정
app.post('/todos', (req, res) => {
  const { date, hour, task } = req.body;

  if (!date || hour === undefined || task === undefined) {
    return res.status(400).send('date, hour, task 필드가 필요합니다.');
  }

  const sql = `
    INSERT INTO todo (date, hour, task)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE task = VALUES(task)
  `;

  db.query(sql, [date, hour, task], (err) => {
    if (err) {
      console.error(' DB 저장 실패:', err);
      return res.status(500).send('DB 저장 오류');
    }
    res.send(' 저장 완료');
  });
});

//  서버 실행
app.listen(port, () => {
  console.log(`🚀 API 서버 실행 중: http://localhost:${port}`);
});
