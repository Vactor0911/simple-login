const express = require("express");
const axios = require("axios");
const cors = require("cors");
const mysql2 = require("mysql2");
const port = 3000; // 서버가 실행될 포트 번호
const Secret = require("./secret.json");

const app = express();
app.use(express.json());
app.use(cors());

// 기본 라우트 설정
app.get("/", (req, res) => {
  res.send("Hello, World!");
});

// 서버 시작
app.listen(port, () => {
  console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`);
});

//db 생성
var db = mysql2.createConnection({
  user: "root",
  host: "localhost",
  password: Secret.dbPasswd,
  database: Secret.dbName,
});
db.connect(); // db 연결

// 회원가입
app.post("/register", (req, res) => {
  // 사용자가 입력한 정보 추출
  const email = req.body.email;
  const name = req.body.name;
  const password = req.body.password;

  // SQL문 작성
  const sql = `INSERT INTO user (email, name, passwd) VALUES (?, ?, ?)`;

  // 값 배열로 변환
  const values = [email, name, password];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send("DB Error");
      return;
    }
    res.status(200).send("Success");
  });
});

// 로그인
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  // db에서 사용자 정보 조회
  const sql = `SELECT * FROM user WHERE email = ? AND passwd = ?`;

  // 값 배열로 변환
  const values = [email, password];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send("DB Error");
      return;
    }

    if (result.length === 0) {
      res.status(400).send("Invalid User");
      return;
    }

    const name = result[0].name;
    res.status(200).send({name: name});
  });
});
