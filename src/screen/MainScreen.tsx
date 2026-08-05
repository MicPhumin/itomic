import {
  Button,
  Card,
  Col,
  Divider,
  Row,
  Modal,
  Input,
  Switch,
  Form,
  Spin,
  Tooltip,
  message,
} from "antd";
import { useEffect, useState } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { supabase } from "../supabase";
import { AiFillAlert, AiOutlineReload } from "react-icons/ai";

import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";

import SortableCard from "../component/SortableCard";
import React from "react";
import { InstagramOutlined, TikTokOutlined } from "@ant-design/icons";
import topicGame from "../assets/topic.json";
interface SortableCardProps {
  id: number;
  name: string;
  value: number;
  showVal?: boolean;
  online: boolean;
  is_host: boolean;
  topic: string;
  active: string;
  player_order: number;
  score: number;
}

const MainScreen = () => {
  const [cards, setCards] = useState<SortableCardProps[]>([]);
  const [myCards, setMyCards] = useState<SortableCardProps>();
  const [showVal, setShowVal] = useState<boolean>(false);
  const [name, setName] = useState("");
  const [topic, setTopic] = useState("");
  const [score, setScore] = useState(0);
  const [hostBtn, setHostBtn] = useState(false);
  const [isHost, setIsHost] = useState<SortableCardProps>({
    id: 0,
    name: "",
    value: 0,
    topic: "",
    is_host: false,
    online: true,
    active: "",
    player_order: 0,
    score: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isNewGame, setIsNewGame] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [howToPlayModal, setHowToPlayModal] = useState(false);
  const [submittable, setSubmittable] = React.useState<boolean>(false);
  const [form] = Form.useForm();

  const values = Form.useWatch([], form);
  React.useEffect(() => {
    form
      .validateFields({ validateOnly: true })
      .then(() => setSubmittable(true))
      .catch(() => setSubmittable(false));
  }, [form, values]);

  const loadPlayers = async () => {
    const { data } = await supabase
      .from("itomic")
      .select("*")
      .order("player_order");
    const player = JSON.parse(localStorage.getItem("player") ?? "null");

    if (player) {
      const findHost = data?.find((item) => {
        return item.is_host === player.is_host;
      });
      if (findHost?.is_host == true) {
        setIsHost(findHost);
        setHostBtn(true);
      }
      if (findHost.id === player.id) {
        const findPlayer = data?.find((item) => {
          return item.id == player?.id;
        });
        setMyCards(findPlayer);
        setIsModalOpen(false);
      } else if (findHost.id !== player.id) {
        localStorage.clear();
        console.log("local storage cleared");
      }
    }

    if (data) {
      setCards(data);
      const findTopic = data.find((item) => {
        return item.topic !== "";
      });
      setTopic(findTopic.topic ? findTopic.topic : topic);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadPlayers();
    console.log("Run at First");
    const channel = supabase
      .channel("players")

      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "itomic",
        },
        (payload) => {
          console.log("Realtime event:", payload);
          loadPlayers();

          if (payload.eventType === "DELETE") {
            localStorage.clear();
            window.location.reload();
          } else if (payload.eventType === "UPDATE") {
            setIsLoading(true);
            const player = payload.new as SortableCardProps;
            setScore(player.score);

            if (player.showVal && player.showVal === true) {
              setShowVal(player.showVal);
              setIsNewGame(player.showVal);
            }
          }
        },
      )

      .subscribe((status) => {
        console.log("Status:", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // const handleRestart = async () => {
  //   const shuffled = Array.from({ length: 100 }, (_, i) => i + 1);

  //   for (let i = shuffled.length - 1; i > 0; i--) {
  //     const j = Math.floor(Math.random() * (i + 1));
  //     [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  //   }

  //   for (let i = 0; i < cards.length; i++) {
  //     const randomNumber = shuffled.pop();

  //     console.log("randomNumber", randomNumber);
  //     console.log("cards[i]", cards[i]);
  //     const { data, error } = await supabase
  //       .from("itomic")
  //       .update({
  //         value: Number(randomNumber),
  //         active: null,
  //         score: null,
  //         showVal: false,
  //       })
  //       .eq("id", cards[i].id);
  //   }
  // };

  const handleRandomTopic = () => {
    console.log("topic", topicGame);

    const index = Math.floor(Math.random() * topicGame.length);
    const item = topicGame.splice(index, 1)[0];
    setTopic(item.topic);
    console.log(item);
  };
  const handleOk = async () => {
    const shuffled = Array.from({ length: 100 }, (_, i) => i + 1);

    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    const randomNumber = shuffled.pop();

    const { data, error } = await supabase.rpc("join_game", {
      p_name: name,
      p_value: Number(randomNumber),
      p_online: true,
      p_is_host: hostBtn,
      p_topic: hostBtn ? topic : "",
      p_order: cards.length + 1,
    });

    if (!error) {
      if (data) {
        const userData = data.find((item: SortableCardProps) => {
          return item;
        });
        console.log("join success");
        localStorage.setItem("player", JSON.stringify(userData));
      }
    } else {
      console.log("join have error");
      message.error(error.message);
    }
    setIsModalOpen(false);
  };

  async function handleDragEnd(event: any) {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = cards.findIndex((i) => i.id === active.id);
    const newIndex = cards.findIndex((i) => i.id === over.id);

    const newCards = arrayMove(cards, oldIndex, newIndex);
    setCards(newCards);
    await Promise.all(
      newCards.map((card, index) =>
        supabase
          .from("itomic")
          .update({ player_order: index + 1 })
          .eq("id", card.id),
      ),
    );
  }

  const handleOrder = async () => {
    const result = cards.map((player, index) => {
      const next = cards[index + 1];

      if (index === cards.length - 1) {
        const prev = cards[index - 1];
        return {
          ...player,
          active: player.value >= prev.value ? "green" : "red",
        };
      }

      return {
        ...player,
        active: player.value <= next.value ? "green" : "red",
      };
    });

    for (let i = 0; i < result.length; i++) {
      if (result[i].active === "red") {
        for (let j = 0; j < i; j++) {
          result[j].active = "red";
        }
      }
    }
    const score = result.filter((item) => item.active === "green").length;
    await Promise.all(
      result.map((card) =>
        supabase
          .from("itomic")
          .update({ active: card.active, score: score, showVal: true })
          .eq("id", card.id),
      ),
    );

    setScore(score);
    setCards(result);
    setIsNewGame(true);
  };

  const deleteAllRows = async () => {
    const { error } = await supabase.from("itomic").delete().neq("id", 0);
    if (error) {
      console.error(error);
    } else {
      console.log("Deleted all rows");
    }
    setIsNewGame(false);
  };

  return (
    <div style={{ margin: "0px 50px 0px 50px" }}>
      <h3 style={{ fontSize: "50px", color: "magenta" }}>iTOMIC </h3>

      <Modal
        title={
          <Row>
            <Col xs={24} sm={24} md={16} lg={16} xl={20}>
              {" "}
              <Row justify={"center"}>
                {" "}
                <h2 style={{ color: "magenta" }}>iTOMIC</h2>
              </Row>
            </Col>
            <Col xs={24} sm={24} md={8} lg={8} xl={4}>
              {" "}
              <Button
                variant="solid"
                color="purple"
                onClick={() => setHowToPlayModal(true)}
              >
                How to play
              </Button>
            </Col>
          </Row>
        }
        closable={false}
        open={isModalOpen}
        footer={
          <>
            <Row justify={"center"}>
              <Button
                htmlType="submit"
                disabled={!submittable}
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
        <Form
          form={form}
          name="validateOnly"
          layout="vertical"
          autoComplete="off"
        >
          <Row gutter={12}>
            <Col xs={24} sm={24} md={16} lg={16} xl={16}>
              <Form.Item
                name="Name"
                label={<h3>Enter Name</h3>}
                rules={[{ required: true }]}
              >
                <Input
                  placeholder="Enter Name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                  }}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={24} md={8} lg={8} xl={8}>
              {" "}
              <h3>Host (Set Topic)</h3>
              <Switch
                onChange={(e) => {
                  setHostBtn(e);
                }}
                value={hostBtn}
                style={{ marginTop: "12px" }}
              />
            </Col>
          </Row>
          {hostBtn === true && (
            <>
              {" "}
              <Row gutter={[2, 16]}>
                <h3>Enter topic</h3>
                <Input
                  disabled={isHost.topic !== ""}
                  placeholder="Enter Topic"
                  value={topic}
                  onChange={(e) => {
                    setTopic(e.target.value);
                  }}
                />{" "}
                <Button
                  variant="solid"
                  color="green"
                  onClick={() => {
                    handleRandomTopic();
                  }}
                  icon={<AiFillAlert />}
                  style={{ marginRight: "10px" }}
                >
                  Generate Topic
                </Button>
                <Button
                  variant="solid"
                  color="red"
                  onClick={() => {
                    deleteAllRows();
                  }}
                  icon={<AiOutlineReload />}
                >
                  Reset game
                </Button>
              </Row>
            </>
          )}
        </Form>
      </Modal>
      <Modal
        title={
          <Row justify={"center"}>
            {" "}
            <h2 style={{ color: "magenta" }}>iTOMIC</h2>
          </Row>
        }
        closeIcon={
          <Tooltip title="เอ้า!! จะกดออกแล้วหรอลองเลื่อนเมาส์ไปตัวหนังสือก่อนดิ">
            <div>X</div>
          </Tooltip>
        }
        onCancel={() => setHowToPlayModal(false)}
        open={howToPlayModal}
        footer={false}
        width={{
          xs: "80%",
          sm: "80%",
          md: "70%",
          lg: "60%",
          xl: "50%",
          xxl: "40%",
        }}
      >
        <Row justify={"center"}>
          {" "}
          <Tooltip title="เป็นเกมที่เน้นการสื่อสารกันเป็นทีม ผู้เล่นทุกคนจะได้รับตัวเลขลับ (1-100) และต้องใบ้คำตามหัวข้อที่กำหนดเพื่อร่วมมือกันเรียงลำดับการ์ดจากน้อยไปหามาก โดยห้ามบอกตัวเลขตรงๆ">
            <h3>ฮั่นแน่~ อยากรู้ก็ลองเล่นดูดิ อะ ฮิฮิฮิ</h3>
          </Tooltip>
        </Row>
        <Row justify={"end"} style={{ marginRight: "50px" }}>
          {" "}
          <h3>Made By Mic</h3>
        </Row>
        <Row justify={"end"}>
          <Button
            type="link"
            color="magenta"
            variant="text"
            target="_blank"
            rel="noopener noreferrer"
            href="https://www.instagram.com/cosmic_being9/"
          >
            <InstagramOutlined />
            Instragram
          </Button>
          <Button
            type="link"
            color="magenta"
            variant="text"
            target="_blank"
            rel="noopener noreferrer"
            href="https://www.tiktok.com/@mickeyphu"
          >
            <TikTokOutlined />
            TikTok
          </Button>
        </Row>
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
            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
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
      <Row style={{ margin: "0px 50px 0px 50px" }} justify={"center"}>
        {isLoading === true ? (
          <>
            <Row>
              <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                <Spin
                  description="Loading"
                  size="large"
                  style={{ margin: "50px 0px 50px 0px" }}
                ></Spin>
              </Col>
            </Row>
          </>
        ) : (
          <>
            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
              <DndContext
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={cards}
                  strategy={verticalListSortingStrategy}
                >
                  <Row
                    gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}
                    align={"middle"}
                    style={{ pointerEvents: isNewGame ? "none" : "auto" }}
                  >
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
                            is_host={card.is_host}
                            online={card.online}
                            topic={card.topic}
                          />
                        </Col>
                      </>
                    ))}
                  </Row>
                </SortableContext>
              </DndContext>
            </Col>
          </>
        )}
      </Row>

      {isNewGame === true && (
        <h2 style={{ fontSize: "50px" }}>Score: {score}</h2>
      )}
      {isHost && isHost.is_host === true && (
        <>
          {isNewGame === false ? (
            <Row justify={"center"}>
              <Button
                variant="solid"
                color="purple"
                onClick={() => {
                  handleOrder();
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
            <>
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
            </>
          )}
          {/* <Button
            variant="solid"
            color="purple"
            onClick={() => {
              handleOrder();
            }}
            style={{
              fontSize: "30px",
              width: "300px",
              height: "50px",
            }}
          >
            Finish2
          </Button>
          <Button
            variant="solid"
            color="purple"
            onClick={() => {
              handleRestart();
            }}
            style={{
              fontSize: "30px",
              width: "300px",
              height: "50px",
            }}
          >
            Generate Num
          </Button> */}
        </>
      )}

      <Row justify={"end"}>
        <h3 style={{ fontSize: "20px", color: "magenta" }}>iTOMIC ver 1.7.0</h3>
      </Row>
    </div>
  );
};

export default MainScreen;
