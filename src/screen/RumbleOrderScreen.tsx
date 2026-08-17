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
  message,
  ColorPicker,
} from "antd";
import { useEffect, useState } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { supabase } from "../supabase";
import {
  AiFillAlert,
  AiFillCheckCircle,
  AiFillPlusSquare,
  AiOutlineReload,
} from "react-icons/ai";

import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";

import loadingGIF from "../assets/loading.gif";

import SortableCard from "../component/SortableCard";
import React from "react";
import topicGame from "../assets/topic.json";
import type { ColorPickerProps, GetProp } from "antd";

type Color = Extract<
  GetProp<ColorPickerProps, "value">,
  string | { cleared: any }
>;
interface SortableCardProps {
  id: number;
  name: string;
  value: number;
  showVal?: boolean;
  room: string;
  is_host: boolean;
  topic: string;
  active: string;
  player_order: number;
  score: number;
  note: string;
  notecolor: string;
}

const RumbleOrderScreen = () => {
  const [cards, setCards] = useState<SortableCardProps[]>([]);
  const [myCards, setMyCards] = useState<SortableCardProps>();
  const [showVal, setShowVal] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [topic, setTopic] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [noteColor, setNoteColor] = useState<Color>("#000");
  const [changeTopic, setChangeTopic] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [hostBtn, setHostBtn] = useState<boolean>(false);
  const [isHost, setIsHost] = useState<SortableCardProps>({
    id: 0,
    name: "",
    value: 0,
    topic: "",
    is_host: false,
    room: "",
    active: "",
    player_order: 0,
    score: 0,
    note: "",
    notecolor: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isNewGame, setIsNewGame] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [submittable, setSubmittable] = React.useState<boolean>(false);
  const [form] = Form.useForm();

  console.log("card", cards);

  const hexString = React.useMemo<string>(
    () =>
      typeof noteColor === "string" ? noteColor : noteColor?.toHexString(),
    [noteColor],
  );

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
      .order("player_order")
      .eq("mode", "rumble");
    const player = JSON.parse(localStorage.getItem("player") ?? "null");

    if (player) {
      const findHost = data?.find((item) => {
        return item.is_host === player.is_host;
      });
      if (findHost?.is_host == true) {
        setIsHost(findHost);
        setHostBtn(true);
      }

      const findPlayer = data?.find((item) => {
        return item.id == player?.id;
      });

      setMyCards(findPlayer);
      setNote(findPlayer.note);
      setNoteColor(findPlayer.notecolor);
      localStorage.setItem("player", JSON.stringify(findPlayer));
      setIsModalOpen(false);
    }

    if (data) {
      setCards(data);
      const findTopic = data.find((item) => {
        return item?.topic !== "";
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
              console.log("ShowVal");

              setShowVal(player.showVal);
              setIsNewGame(player.showVal);
            } else if (player.showVal === false) {
              setShowVal(false);
              setIsNewGame(false);
            }

            if (player.topic) {
              setTopic(player.topic);
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

  const handleRestart = async () => {
    const shuffled = Array.from({ length: 100 }, (_, i) => i + 1);

    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    for (let i = 0; i < cards.length; i++) {
      const randomNumber = shuffled.pop();

      await supabase
        .from("itomic")
        .update({
          value: Number(randomNumber),
          active: null,
          score: null,
          showVal: false,
          note: null,
        })
        .eq("id", cards[i].id);
    }
    setNote("");
    setNote("#00000");
  };

  const handleTopic = async (topicName: string) => {
    const host = cards.find((item) => {
      return item.is_host === true;
    });
    await supabase
      .from("itomic")
      .update({ topic: topicName })
      .eq("id", host?.id);

    setChangeTopic(false);
  };

  const handleRandomTopic = () => {
    const index = Math.floor(Math.random() * topicGame.length);
    const item = topicGame.splice(index, 1)[0];
    setTopic(item.topic);
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
      p_room: "",
      p_is_host: hostBtn,
      p_topic: hostBtn ? topic : "",
      p_order: cards.length + 1,
      p_mode: "rumble",
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
    // sounds.drag.play().catch((err) => {
    //   console.error(err);
    // });
    const newCards = arrayMove(cards, oldIndex, newIndex);
    setCards(newCards);
    // setDragSoundPlay(true);
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
      // const next = cards[index + 1];

      const sorted = [...cards].sort((a, b) => a.value - b.value);

      if (player.value === sorted[index].value) {
        return {
          ...player,
          active: "green",
        };
      } else {
        return {
          ...player,
          active: "red",
        };
      }
      //========old func ============
      // if (index === cards.length - 1) {
      //   const prev = cards[index - 1];
      //   return {
      //     ...player,
      //     active: player.value >= prev.value ? "green" : "red",
      //   };
      // }

      // return {
      //   ...player,
      //   active: player.value <= next.value ? "green" : "red",
      // };
    });

    // for (let i = 0; i < result.length; i++) {
    //   if (result[i].active === "red") {
    //     for (let j = 0; j < i; j++) {
    //       result[j].active = "red";
    //     }
    //   }
    // }

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

  const handleNote = async () => {
    const player = JSON.parse(localStorage.getItem("player") ?? "null");
    await supabase
      .from("itomic")
      .update({ note: note, notecolor: hexString })
      .eq("id", player.id);
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
    <div
      style={{
        margin:
          window.innerWidth <= 426 ? "0px 10px 0px 10px" : "0px 50px 0px 50px",
      }}
    >
      <h3 style={{ fontSize: "50px", color: "magenta", marginBottom: "20px" }}>
        iTOMIC{" "}
      </h3>
      <h2
        style={{
          fontFamily: "Kanit, sans-serif",
          fontSize: "30px",
          color: "#1677FF",
        }}
      >
        Rumble Sort Mode
      </h2>
      <Modal
        title={
          <Row>
            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
              {" "}
              <Row justify={"center"}>
                {" "}
                <h2 style={{ color: "magenta" }}>iTOMIC</h2>
              </Row>
              <Row justify={"center"}>
                {" "}
                <h2
                  style={{
                    fontFamily: "Kanit, sans-serif",
                    fontSize: "20px",
                    color: "#1677FF",
                  }}
                >
                  Rumble Sort Mode
                </h2>
              </Row>
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
                  color="purple"
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
      <Row justify={"center"}>
        <Col xs={24} sm={24} md={4} lg={4} xl={2}>
          <Row>
            <h2
              style={{
                fontFamily: "Kanit, sans-serif",
                fontSize: "30px",
                color: "gray",
              }}
            >
              Topic :
            </h2>
          </Row>
        </Col>

        <Col xs={24} sm={24} md={20} lg={16} xl={18}>
          {changeTopic === true ? (
            <>
              <Row gutter={4}>
                <Col xs={16} sm={20} md={16} lg={16} xl={16}>
                  {" "}
                  <Input
                    placeholder="Enter Topic"
                    size="large"
                    value={topic}
                    onChange={(e) => {
                      setTopic(e.target.value);
                    }}
                  />{" "}
                </Col>
                <Col xs={4} sm={4} md={4} lg={4} xl={4}>
                  <Button
                    variant="solid"
                    color="purple"
                    size="large"
                    onClick={() => {
                      handleRandomTopic();
                    }}
                    icon={<AiFillAlert />}
                    style={{ marginRight: "10px" }}
                  >
                    Random
                  </Button>
                </Col>
              </Row>
              <Row style={{ marginTop: "10px" }}>
                <Button
                  variant="solid"
                  size="large"
                  color="green"
                  onClick={() => {
                    handleTopic(topic);
                  }}
                  icon={<AiFillCheckCircle />}
                  style={{ marginRight: "10px" }}
                >
                  ok
                </Button>
              </Row>
            </>
          ) : (
            <>
              <Row>
                <h2
                  style={{ fontFamily: "Kanit, sans-serif", fontSize: "30px" }}
                >
                  {topic}
                </h2>{" "}
              </Row>
              <Row>
                <Button
                  variant="solid"
                  size="large"
                  color="purple"
                  onClick={() => {
                    setChangeTopic(true);
                  }}
                  icon={<AiFillPlusSquare />}
                  style={{
                    marginRight: "10px",
                  }}
                >
                  Change Topic
                </Button>
              </Row>
            </>
          )}
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
                <Row>
                  <Col xs={20} sm={20} md={20} lg={20} xl={20}>
                    <Input
                      placeholder="Enter Note"
                      value={note}
                      allowClear
                      onChange={(e) => {
                        setNote(e.target.value);
                      }}
                    />
                  </Col>
                  <Col xs={4} sm={4} md={4} lg={4} xl={4}>
                    <ColorPicker
                      format="hex"
                      value={noteColor}
                      onChangeComplete={setNoteColor}
                    />
                  </Col>
                </Row>

                <Button
                  variant="solid"
                  color="purple"
                  onClick={() => {
                    handleNote();
                  }}
                  icon={<AiFillCheckCircle />}
                  style={{ marginTop: "10px" }}
                >
                  Save Note
                </Button>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>

      <Divider style={{ backgroundColor: "green" }} />
      <Row justify={"center"}>
        <h1 style={{ fontFamily: "Kanit, sans-serif", fontSize: "30px" }}>
          Sort the numbers from smallest to largest .
        </h1>
      </Row>

      <Row style={{ margin: "0px 50px 0px 50px" }} justify={"center"}>
        {isLoading === true ? (
          <>
            <Row>
              <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                <img
                  src={loadingGIF}
                  alt=""
                  style={{
                    margin: "50px 0px 50px 0px",
                    width: "250px",
                    height: "250px",
                  }}
                />
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
                  strategy={horizontalListSortingStrategy}
                >
                  <Row
                    gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}
                    align={"middle"}
                    style={{
                      zIndex: -1,
                      pointerEvents: isNewGame ? "none" : "auto",
                    }}
                  >
                    {cards.map((card, index) => (
                      <>
                        <Col
                          className="gutter-row"
                          xs={8}
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
                            room={card.room}
                            topic={card.topic}
                            note={card.note}
                            noteColor={card.notecolor}
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
        <h2 style={{ fontFamily: "Kanit, sans-serif", fontSize: "50px" }}>
          Score: {score}
        </h2>
      )}

      {isHost && isHost.is_host === true && (
        <>
          {isNewGame === false ? (
            <Row justify={"center"}>
              <Button
                variant="solid"
                color="green"
                onClick={() => {
                  handleOrder();
                  // sounds.finish.play();
                }}
                icon={<AiFillCheckCircle />}
                style={{
                  fontSize: "25px",
                  width: "200px",
                  height: "50px",
                }}
              >
                Finish
              </Button>
            </Row>
          ) : (
            <>
              <Row justify={"center"} gutter={24}>
                <Col>
                  {" "}
                  <Button
                    variant="solid"
                    color="red"
                    onClick={() => {
                      handleRestart();
                    }}
                    icon={<AiOutlineReload />}
                    style={{
                      fontSize: "25px",
                      width: "200px",
                      height: "50px",
                    }}
                  >
                    Restart
                  </Button>
                </Col>
                <Col>
                  {" "}
                  <Row justify={"center"}>
                    <Button
                      variant="solid"
                      color="purple"
                      onClick={() => {
                        deleteAllRows();
                      }}
                      icon={<AiFillPlusSquare />}
                      style={{
                        fontSize: "25px",
                        width: "200px",
                        height: "50px",
                      }}
                    >
                      New Game
                    </Button>
                  </Row>
                </Col>
              </Row>
            </>
          )}
        </>
      )}

      <Row justify={"end"}>
        <h3
          style={{
            fontSize: "20px",
            color: "magenta",
          }}
        >
          iTOMIC ver 1.8.4
        </h3>
      </Row>
    </div>
  );
};

export default RumbleOrderScreen;
