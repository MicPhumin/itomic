import "./App.css";
import { Route, Routes } from "react-router";
import MainScreen from "./screen/MainScreen";
// import SingleOrderScreen from "./screen/SingleOrderScreen";
import RumbleOrderScreen from "./screen/RumbleOrderScreen";
import SingleOrderScreen_realtime_dnd from "./screen/SingleOrderScreen_realtime_dnd";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<MainScreen />} />
        <Route path="/single" element={<SingleOrderScreen_realtime_dnd />} />
        <Route path="/rumble" element={<RumbleOrderScreen />} />
      </Routes>
    </>
  );
}

export default App;
