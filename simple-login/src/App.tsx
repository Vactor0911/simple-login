import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Login, Register } from "./assets/pages";
import styled from "@emotion/styled";
import Background from "./assets/background.jpg";

const Style = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100vw;
  height: 100vh;

  &::before {
    content: "";
    display: flex;
    position: fixed;
    width: 100%;
    height: 100%;
    background-image: url(${Background});
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    filter: blur(3px);
    overflow: hidden;
    transform: scale(1.05);
    z-index: -1;
  }

  #attribution-freepik {
    display: flex;
    position: absolute;
    bottom: 10px;
    right: 10px;
    color: #b0b0b0;
    gap: 5px;
    z-index: -1;
  }

  #attribution-freepik a {
    color: #00a8fc;
    text-decoration: none;
  }
`;

function App() {
  return (
    <BrowserRouter>
      <Style>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        <p id="attribution-freepik">
          Designed by
          <a href="https://www.freepik.com/" target="_blank" tabIndex={-1}>
            Freepik
          </a>
        </p>
      </Style>
    </BrowserRouter>
  );
}

export default App;
