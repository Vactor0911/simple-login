import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Login, Register } from "./assets/pages";
import styled from "@emotion/styled";

const Style = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;

  #attribution-freepik {
    display: flex;
    position: absolute;
    bottom: 10px;
    right: 10px;
    color: #b0b0b0;
    gap: 5px;
  }

  #attribution-freepik a {
    color: #00a8fc;
    text-decoration: none;
    pointer: cursor;
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
