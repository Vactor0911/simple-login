import styled from "@emotion/styled";
import TextField from "../components/TextField";
import Button from "../components/Button";
import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const Style = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  width: 500px;
  padding: 35px 40px;
  background-color: #313338;
  border-radius: 10px;
  box-shadow: 5px 5px 10px rgba(0, 0, 0, 0.3);
  animation: fadeIn 0.25s ease-in-out;
  color: white;
  z-index: 1;

  Button {
    margin-top: 20px;
  }

  a {
    color: #00a8fc;
    text-decoration: none;
    align-self: flex-start;
  }

  @keyframes fadeIn {
    from {
      transform: translateY(-20%) scale(1.1);
      opacity: 0;
    }
    75% {
      opacity: 1;
      transform: translateY(2%) scale(1);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const Register = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  const navigateTo = useNavigate();

  return (
    <Style>
      <h2>계정 생성하기</h2>
      <TextField
        className="email"
        label="이메일"
        required
        onChange={(e) => {
          setEmail(e.target.value);
        }}
      />
      <TextField
        className="name"
        label="사용자명"
        required
        onChange={(e) => {
          setName(e.target.value);
        }}
      />
      <TextField
        className="password"
        label="비밀번호"
        required
        onChange={(e) => {
          setPassword(e.target.value);
        }}
      />
      <TextField className="password-check" label="비밀번호 확인" required />
      <Button
        text="계속하기"
        onClick={() => {
          const passwordCheck = document.querySelector(
            ".password-check"
          ) as HTMLInputElement;
          if (password !== passwordCheck.value) {
            alert("비밀번호가 일치하지 않습니다.");
            return;
          }

          axios
            .post("http://localhost:3000/register", {
              email: email,
              name: name,
              password: password,
            })
            .then((response) => {
              console.log(response);
              if (response.status !== 200) {
                alert("회원가입에 실패하였습니다.");
                return;
              }
              alert("회원가입에 성공하였습니다.");
              navigateTo("/login"); //로그인 실패시 다시 로그인 페이지로 이동
            })
            .catch((error) => {
              switch(error.response.status) {
                case 400:
                  alert("이미 존재하는 이메일입니다.");
                  break;
                case 500:
                  alert("서버 오류가 발생했습니다.");
                  break;
              }
            });
        }}
      />
      <Link to="/login">이미 계정이 있으신가요?</Link>
    </Style>
  );
};

export default Register;
