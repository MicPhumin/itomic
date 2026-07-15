import { Button, Card, Col, Divider, Row, Modal, Input, Tabs } from "antd";
import React, { useEffect, useState } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { supabase } from "../supabase";

import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";

import SortableCard from "../component/SortableCard";
interface SortableCardProps {
  id: number;
  name: string;
  value: number;
  showVal: boolean;
  active: string;
}

const MainScreen = () => {
  const [cards, setCards] = useState<SortableCardProps[]>([]);
  const [myCards, setMyCards] = useState<SortableCardProps>();
  const [showVal, setShowVal] = useState<boolean>(false);
  const [name, setName] = useState("");
  const [topic, setTopic] = useState("");
  const [score, setScore] = useState(null);
  const [isNewGame, setIsNewGame] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(true);
  console.log("cards", cards);

  const getAllPlayer = async () => {
    const { data } = await supabase.from("itomic").select("*");
    const mycard = data?.find((item) => {
      return item.name === name;
    });

    const getTopic = data?.find((item) => {
      return item.topic !== "";
    });

    if (topic === "") {
      setTopic(getTopic.topic);
    }

    setMyCards(mycard);
    setCards(data);
  };
  useEffect(() => {
    getAllPlayer();
    console.log("run at first");
  }, []);

  const onChange = (key: string) => {
    console.log(key);
  };

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: "User",
      children: (
        <>
          <h3>Enter Name</h3>
          <Input
            placeholder="Enter Name"
            onChange={(e) => {
              setName(e.target.value);
            }}
          />

          <h3>Enter Topic</h3>
          <Input
            placeholder="Enter Topic"
            onChange={(e) => {
              setTopic(e.target.value);
            }}
          />
        </>
      ),
    },
    // {
    //   key: "2",
    //   label: "User",
    //   children: (
    //     <>
    //       <h3>Enter Name</h3>
    //       <Input
    //         placeholder="Enter Name"
    //         onChange={(e) => {
    //           setName(e.target.value);
    //         }}
    //       />
    //     </>
    //   ),
    // },
  ];

  const handleOk = async () => {
    const randomNumber = Math.floor(Math.random() * 100) + 1;

    const UserData = {
      id: cards.length + 1,
      name: name,
      value: Number(randomNumber),
      showVal: false,
      topic: topic,
    };

    await supabase.from("itomic").insert(UserData);

    getAllPlayer();
    setIsModalOpen(false);
  };

  function handleDragEnd(event: any) {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = cards.findIndex((i) => i.id === active.id);
    const newIndex = cards.findIndex((i) => i.id === over.id);

    setCards(arrayMove(cards, oldIndex, newIndex));
  }

  const handleOrder = () => {
    const isSorted = cards.every((item, index, arr) => {
      return index === arr.length - 1 || item.value < arr[index + 1].value;
    });

    const updatedData = cards.map((item, index, arr) => ({
      ...item,
      active:
        index === arr.length - 1
          ? isSorted
            ? "green"
            : "red"
          : item.value < arr[index + 1].value
            ? "green"
            : "red",
    }));

    const greenCount = updatedData.filter(
      (item) => item.active === "green",
    ).length;
    const allGreen =
      greenCount > 0 &&
      greenCount === updatedData.filter((item) => item.active !== "").length;

    const hasGreenThenRed = updatedData.some(
      (item, index) =>
        item.active === "green" && updatedData[index + 1]?.active === "red",
    );

    const score = allGreen ? greenCount : hasGreenThenRed ? 0 : greenCount;

    setScore(score);
    setCards(updatedData);
    setIsNewGame(true);
  };

  const deleteAllRows = async () => {
    const { error } = await supabase.from("itomic").delete().neq("id", 0);

    if (error) {
      console.error(error);
    } else {
      console.log("Deleted all rows");
    }
    window.location.reload();
    setIsNewGame(false);
  };

  return (
    <div style={{ margin: "0px 50px 0px 50px" }}>
      <h3 style={{ fontSize: "50px", color: "magenta" }}>iTOMIC ver.1.0</h3>

      <Modal
        title={
          <Row justify={"center"}>
            <h2 style={{ color: "magenta" }}>iTOMIC</h2>
          </Row>
        }
        closable={false}
        open={isModalOpen}
        footer={
          <>
            <Row justify={"center"}>
              <Button
                disabled={name && topic ? false : true}
                size="large"
                type="primary"
                onClick={handleOk}
                style={{
                  width: "100px",
                }}
              >
                Ok
              </Button>
            </Row>
          </>
        }
        width={{
          xs: "80%",
          sm: "80%",
          md: "70%",
          lg: "60%",
          xl: "50%",
          xxl: "40%",
        }}
      >
        <Tabs defaultActiveKey="1" items={items} onChange={onChange} />
      </Modal>
      <Row justify={"center"}>
        <Col xs={24} sm={24} md={4} lg={4} xl={2}>
          <Row>
            <h2 style={{ fontSize: "30px", color: "gray" }}>Topic :</h2>
          </Row>
        </Col>

        <Col xs={24} sm={24} md={20} lg={16} xl={18}>
          <Row>
            <h2 style={{ fontSize: "30px" }}>{topic}</h2>
          </Row>
        </Col>

        <Col xs={20} sm={20} md={10} lg={4} xl={4}>
          <Row justify={"center"}>
            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
              {" "}
              <h2 style={{ fontSize: "20px" }}>Your Number is :</h2>
            </Col>
            <Col xs={12} sm={12} md={24} lg={24} xl={24}>
              <Card title={myCards?.name}>
                <div
                  style={{
                    color: "black",
                    fontSize: "80px",
                    fontWeight: "bold",
                  }}
                >
                  {myCards?.value}
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
                        name={card.name}
                        value={card.value}
                        showVal={showVal}
                        active={card.active}
                      />
                    </Col>
                  </>
                ))}
              </Row>
            </SortableContext>
          </DndContext>
        </Col>
      </Row>
      {score != null && <h2 style={{ fontSize: "50px" }}>Score: {score}</h2>}

      {isNewGame === false ? (
        <Row justify={"center"}>
          <Button
            variant="solid"
            color="purple"
            onClick={() => {
              handleOrder();
              setShowVal(!showVal);
            }}
            style={{
              fontSize: "30px",
              width: "300px",
              height: "50px",
            }}
          >
            Finish
          </Button>
        </Row>
      ) : (
        <Row justify={"center"}>
          <Button
            variant="solid"
            color="green"
            onClick={() => {
              deleteAllRows();
            }}
            style={{
              fontSize: "30px",
              width: "300px",
              height: "50px",
            }}
          >
            New Game
          </Button>
        </Row>
      )}
    </div>
  );
};

export default MainScreen;
