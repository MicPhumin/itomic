import { Button, Card } from "antd";
import React, { useState } from "react";

const MainScreen = () => {
  const [count, setCount] = useState<number>(0);

  return (
    <>
      <div>Itomic</div>
      <Button
        color="purple"
        variant="solid"
        onClick={() => setCount(Math.floor(Math.random() * (100 - 1 + 1)) + 1)}
      >
        Random
      </Button>
      <Card variant="borderless" style={{ width: 300 }}>
        <p style={{ fontSize: 20, fontWeight: "bold" }}>{count}</p>
      </Card>
    </>
  );
};

export default MainScreen;
