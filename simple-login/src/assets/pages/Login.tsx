import styled from "@emotion/styled";
import Button from "../components/Button";
import TextField from "../components/TextField";
import ReactIcon from "../../assets/react-icon.svg";
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router";
import { Link } from "react-router-dom";

const Style = styled.div`
  display: flex;
  justify-content: space-between;
  width: 780px;
  padding: 35px 40px;
  background-color: #313338;
  border-radius: 10px;
  box-shadow: 5px 5px 10px rgba(0, 0, 0, 0.3);
  animation: fadeIn 0.25s ease-in-out;
  z-index: 1;

  .container {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    gap: 20px;
  }

  .container.left {
    width: 60%;
  }
  .container.right {
    width: 30%;
  }

  .text-wrapper {
    display: flex;
    flex-direction: column;
    gap: 8px;
    color: white;
    text-align: center;
  }
  .text-wrapper p {
    color: #b0b0b0;
  }

  Button {
    height: 3.5em;
  }

  #hidden-register {
    display: none;
    align-self: flex-start;
    gap: 5px;
    color: #b0b0b0;
  }

  a {
    display: flex;
    color: #00a8fc;
    text-decoration: none;
    align-self: center;
  }
  a:focus-visible {
    outline: 4px solid #00a8fc;
    outline-offset: 2px;
    border-radius: 5px;
  }

  #react-icon {
    animation: spin 10s linear infinite;
    aspect-ratio: 1/1;
    height: 50%;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
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

  @media (max-width: 800px) {
    width: 500px;

    .container.left {
      width: 100%;
    }
    .container.right {
      display: none;
    }

    #hidden-register {
      display: flex;
    }
  }
`;

const Login = () => {
  const [email, setEmail] = useState("");
  const [passwd, setPasswd] = useState("");
  const navigateTo = useNavigate();

  const dologin = () => {
    axios.post("http://localhost:3000/login", {
        email: email,
        password: passwd,
      })
      .then((response) => {
        console.log(response);
        if (response.status !== 200) {
          navigateTo("/login"); //로그인 실패시 다시 로그인 페이지로 이동
          alert(
            "등록되지 않은 아이디이거나, 아이디 또는 비밀번호를 잘못 입력하셨습니다."
          );
          return;
        }
        alert(`로그인 성공! [${response.data.name}]님 환영합니다!`);
      })
      .catch((error) => {
        switch (error.response.status) {
          case 400:
            alert("아이디 또는 비밀번호가 올바르지 않습니다.");
            break;
          case 500:
            alert("서버 오류가 발생했습니다.");
            break;
        }
      });
  };

  return (
    <Style>
      <div className="container left">
        <div className="text-wrapper">
          <h2>돌아오신 것을 환영해요!</h2>
          <p>놀라운 기능을 경험해보세요!</p>
        </div>
        <TextField
          label="이메일"
          required
          onChange={(e) => {
            setEmail(e.target.value);
          }}
        />
        <TextField
          label="비밀번호"
          type="password"
          required
          onChange={(e) => {
            setPasswd(e.target.value);
          }}
        />
        <Button
          text="로그인"
          onClick={() => {
            if (email === "") {
              alert("아이디를 입력해주세요.");
              return;
            }

            if (passwd === "") {
              alert("비밀번호를 입력해주세요.");
              return;
            }

            dologin();
          }}
        />
        <p id="hidden-register">
          계정이 필요하신가요?
          <Link to="/register">가입하기</Link>
        </p>
      </div>
      <div className="container right">
        <img id="react-icon" src={ReactIcon} />
        <div className="text-wrapper">
          <h2>계정 생성하기</h2>
          <p>간단한 과정을 통해 새로운 계정을 생성해보세요.</p>
          <Link to="/register">가입하기</Link>
        </div>
      </div>
    </Style>
  );
};

export default Login;
