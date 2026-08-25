import "./App.css";
import { Route, Routes } from "react-router";
import MainScreen from "./screen/MainScreen";
// import SingleOrderScreen from "./screen/SingleOrderScreen";
import RumbleOrderScreen from "./screen/RumbleOrderScreen";
import SingleOrderScreen from "./screen/SingleOrderScreen";
import SpyOnMicScreen from "./screen/SpyOnMicScreen";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<MainScreen />} />
        <Route path="/itomic" element={<SingleOrderScreen />} />
        <Route path="/itomicRumble" element={<RumbleOrderScreen />} />
        <Route path="/spyonmic" element={<SpyOnMicScreen />} />
      </Routes>
    </>
  );
}

export default App;
