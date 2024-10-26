import styled from "@emotion/styled";
import TextField from "../components/TextField";
import Button from "../components/Button";

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
  return (
    <Style>
      <h2>계정 생성하기</h2>
      <TextField label="이메일" required />
      <TextField label="사용자명" required />
      <TextField label="비밀번호" required />
      <TextField label="비밀번호 확인" required />
      <Button text="계속하기" />
      <a href="/login">이미 계정이 있으신가요?</a>
    </Style>
  );
};

export default Register;
