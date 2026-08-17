import "./App.css";
import { Route, Routes } from "react-router";
import MainScreen from "./screen/MainScreen";
import SingleOrderScreen from "./screen/SingleOrderScreen";
import RumbleOrderScreen from "./screen/RumbleOrderScreen";
function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<MainScreen />} />
        <Route path="/single" element={<SingleOrderScreen />} />
        <Route path="/rumble" element={<RumbleOrderScreen />} />
      </Routes>
    </>
  );
}

export default App;
