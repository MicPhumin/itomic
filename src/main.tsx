import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter } from "react-router";
import { ConfigProvider } from "antd";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <ConfigProvider
      theme={{
        token: {
          fontFamily: "Kanit, sans-serif",
        },
      }}
    >
      <StrictMode>
        <App />
      </StrictMode>
    </ConfigProvider>
  </BrowserRouter>,
);
