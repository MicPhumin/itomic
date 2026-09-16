import "./App.css";
import { Route, Routes } from "react-router";
import MainScreen from "./screen/MainScreen";
import SingleOrderScreen from "./screen/SingleOrderScreen";
import SpyOnMicScreen from "./screen/SpyOnMicScreen";
import FunFactScreen from "./screen/FunFactScreen";
import ITOMICGame from "./screen/ITOMICGame";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<MainScreen />} />
        <Route path="/itomic" element={<SingleOrderScreen />} />
        <Route path="/itomicFact" element={<FunFactScreen />} />
        <Route path="/spyonmic" element={<SpyOnMicScreen />} />
        <Route path="/test" element={<ITOMICGame />} />
      </Routes>
    </>
  );
}

export default App;
