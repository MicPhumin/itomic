import "./App.css";
import { Route, Routes } from "react-router";
import MainScreen from "./screen/MainScreen";
function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<MainScreen />} />
      </Routes>
    </>
  );
}

export default App;
