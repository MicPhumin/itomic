import { Button, Card, Col, Divider, Row } from "antd";
import React, { useState } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";

import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";

import SortableCard from "../component/SortableCard";

const initialCards = [
  { id: "1", title: "Apple", value: 3 },
  { id: "2", title: "Orange", value: 16 },
  { id: "3", title: "Banana", value: 35 },
  { id: "4", title: "Grape", value: 50 },
  { id: "5", title: "Melon", value: 67 },
  { id: "6", title: "Cherry", value: 89 },
  { id: "7", title: "Mango", value: 95 },
];

const MainScreen = () => {
  const [cards, setCards] = useState(initialCards);
  const [showVal, setShowVal] = useState<boolean>(false);
  console.log("Card=>", cards);

  function handleDragEnd(event: any) {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = cards.findIndex((i) => i.id === active.id);
    const newIndex = cards.findIndex((i) => i.id === over.id);

    setCards(arrayMove(cards, oldIndex, newIndex));
  }

  return (
    <div style={{ margin: "0px 50px 0px 50px" }}>
      <h3 style={{ fontSize: "50px", color: "magenta" }}>iTOMIC</h3>
      <Row justify={"center"}>
        <Col xs={24} sm={24} md={4} lg={4} xl={2}>
          <Row>
            <h2 style={{ fontSize: "30px", color: "gray" }}>Topic :</h2>
          </Row>
        </Col>

        <Col xs={24} sm={24} md={20} lg={16} xl={18}>
          <Row>
            <h2 style={{ fontSize: "30px" }}>iTOMIC Topic</h2>
          </Row>
        </Col>

        <Col xs={20} sm={20} md={6} lg={4} xl={4}>
          <Row justify={"center"}>
            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
              {" "}
              <h2 style={{ fontSize: "20px" }}>Your Number is :</h2>
            </Col>
            <Col xs={12} sm={12} md={24} lg={24} xl={24}>
              <Card title={"Username"}>
                <div
                  style={{
                    color: "black",
                    fontSize: "80px",
                    fontWeight: "bold",
                  }}
                >
                  2
                </div>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>

      <Divider style={{ backgroundColor: "green" }} />
      <Row justify={"center"}>
        <h1 style={{ fontSize: "30px" }}>
          Arrange the numbers from smallest to largest .{" "}
        </h1>
      </Row>
      <Row style={{ margin: "0px 50px 0px 50px" }}>
        <Col xs={24} sm={24} md={24} lg={24} xl={24}>
          <DndContext
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={cards}
              strategy={verticalListSortingStrategy}
            >
              <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }} align={"middle"}>
                {cards.map((card, index) => (
                  <>
                    <Col
                      className="gutter-row"
                      xs={24}
                      sm={12}
                      md={8}
                      lg={6}
                      xl={4}
                      span={4}
                    >
                      <h2 style={{ fontSize: "50px" }}>{index + 1}</h2>
                      <SortableCard
                        key={card.id}
                        id={card.id}
                        title={card.title}
                        value={card.value}
                        showVal={showVal}
                      />
                    </Col>
                  </>
                ))}
              </Row>
            </SortableContext>
          </DndContext>
        </Col>
      </Row>
      <Row justify={"center"}>
        <Button
          variant="solid"
          color="purple"
          onClick={() => {
            setShowVal(!showVal);
          }}
          style={{
            fontSize: "30px",
            width: "300px",
            height: "50px",
          }}
        >
          Show
        </Button>
      </Row>
    </div>
  );
};

export default MainScreen;
