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
  AutoComplete,
} from "antd";
import { useEffect, useRef, useState } from "react";
import {
  DndContext,
  closestCenter,
  type DragEndEvent,
  type DragMoveEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
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

// import loadingGIF from "../assets/loading.gif";

import SortableCard from "../component/SortableCard";
import React from "react";
import topicGame from "../assets/topic.json";
import type { ColorPickerProps, GetProp } from "antd";
import { IoIosHeart } from "react-icons/io";

type Color = Extract<
  GetProp<ColorPickerProps, "value">,
  string | { cleared: any }
>;
interface topicGame {
  id: number;
  label: string;
  value: string;
}
interface CategoryGroup {
  label: string;
  options: topicGame[];
}
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
  heart: number;
  mode: string;
}

const RumbleOrderScreen = () => {
  const [cards, setCards] = useState<SortableCardProps[]>([]);
  const [myCards, setMyCards] = useState<SortableCardProps>();
  const [finishCheck, setfinishCheck] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [topic, setTopic] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [noteColor, setNoteColor] = useState<Color>("#000");
  const [changeTopic, setChangeTopic] = useState<boolean>(false);
  const [globalIndex, setGlobalIndex] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [heart, setHeart] = useState<number>(0);
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
    heart: 3,
    mode: "",
  });
  // const [isLoading, setIsLoading] = useState(false);
  const [loseModal, setLoseModal] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [submittable, setSubmittable] = React.useState<boolean>(false);
  const [form] = Form.useForm();

  // ---------------- Realtime Drag (ง่าย ๆ) ----------------
  const channelRef = useRef<any>(null);
  const playerIdRef = useRef<string>(crypto.randomUUID());
  const dragPositionRef = useRef({ x: 0, y: 0 });
  const lastDragMoveRef = useRef(0);

  const [remoteDrag, setRemoteDrag] = useState<{
    cardId: number;
    left: number;
    top: number;
    x: number;
    y: number;
  } | null>(null);

  console.log("card", cards);
  console.log("remoteDrag", remoteDrag);

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
      .eq("mode", "single");
    const player = JSON.parse(localStorage.getItem("player") ?? "null");

    if (player) {
      const findHost = data?.find((item) => {
        return item.is_host === player.is_host;
      });
      if (findHost?.is_host == true) {
        setIsHost(findHost);
        setHostBtn(true);
        setHeart(findHost.heart);
      }

      const findPlayer = data?.find((item) => {
        return item.id == player?.id;
      });

      setMyCards(findPlayer);
      setHeart(findPlayer ? findPlayer.heart : 3);
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
    // setIsLoading(false);
  };

  useEffect(() => {
    loadPlayers();
    console.log("Run at First");

    const channel = supabase
      .channel("players")

      // -----------------------------
      // Database Realtime
      // -----------------------------
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
            // setIsLoading(true);
            const player = payload.new as SortableCardProps;

            setScore(player.score);

            if (player.showVal && player.showVal === true) {
              console.log("ShowVal");
            }

            if (player.topic) {
              setTopic(player.topic);
            }

            if (player.active === "red") {
              setHeart(player.heart);

              if (player.heart === 0) {
                setLoseModal(true);
              }
            }
          }
        },
      )

      // -----------------------------
      // Other browser: Drag Start
      // -----------------------------
      .on("broadcast", { event: "drag-start" }, ({ payload }) => {
        if (payload.playerId === playerIdRef.current) return;

        setRemoteDrag({
          cardId: Number(payload.cardId),
          left: Number(payload.left || 0),
          top: Number(payload.top || 0),
          x: 0,
          y: 0,
        });
      })

      // -----------------------------
      // Other browser: Drag Move
      // -----------------------------
      .on("broadcast", { event: "drag-move" }, ({ payload }) => {
        if (payload.playerId === playerIdRef.current) return;

        setRemoteDrag((prev) => {
          // 💡 ถ้า prev ยังไม่มี ให้รับค่า x, y และตั้งต้นใหม่ทันที
          if (!prev || prev.cardId !== Number(payload.cardId)) {
            return {
              cardId: Number(payload.cardId),
              left: Number(payload.left || 0),
              top: Number(payload.top || 0),
              x: Number(payload.x || 0),
              y: Number(payload.y || 0),
            };
          }

          return {
            ...prev,
            x: Number(payload.x || 0),
            y: Number(payload.y || 0),
          };
        });
      })
      // -----------------------------
      // Other browser: Drag End
      // -----------------------------
      .on("broadcast", { event: "drag-end" }, ({ payload }) => {
        if (payload.playerId === playerIdRef.current) return;

        setRemoteDrag(null);

        if (payload.cancelled) return;

        setCards((currentCards) => {
          const oldIndex = currentCards.findIndex(
            (card) => card.id === Number(payload.cardId),
          );

          const newIndex = Number(payload.newIndex);

          if (
            oldIndex === -1 ||
            newIndex < 0 ||
            newIndex >= currentCards.length ||
            oldIndex === newIndex
          ) {
            return currentCards;
          }

          return arrayMove(currentCards, oldIndex, newIndex);
        });
      })

      .subscribe((status) => {
        console.log("Status:", status);
      });

    channelRef.current = channel;

    return () => {
      channelRef.current = null;
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
          heart: 3,
        })
        .eq("id", cards[i].id)
        .eq("mode", "single");
    }
    setNote("");
    setNote("#00000");
    setGlobalIndex(0);
    setfinishCheck(false);
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
      p_mode: "single",
      p_heart: 3,
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

  // -----------------------------
  // Drag Start
  // -----------------------------

  const handleDragStart = async (event: DragStartEvent) => {
    const cardId = Number(event.active.id);

    dragPositionRef.current = { x: 0, y: 0 };
    lastDragMoveRef.current = Date.now();

    // 💡 ดึง DOM Element จริงของการ์ดจาก Event Activator Target
    const activatorNode = event.activatorEvent.target as HTMLElement | null;
    const cardElement = activatorNode?.closest(".gutter-row") || activatorNode;
    const rect = cardElement?.getBoundingClientRect();

    // ดึงค่า left, top จริงบนหน้าจอ (ถ้าหาไม่ได้ค่อยดึง fallback)
    const left = rect ? rect.left : 0;
    const top = rect ? rect.top : 0;

    await channelRef.current?.send({
      type: "broadcast",
      event: "drag-start",
      payload: {
        playerId: playerIdRef.current,
        cardId,
        left,
        top,
      },
    });
  };
  // -----------------------------
  // Drag Move
  // ส่งทุก ~40ms
  // -----------------------------

  const handleDragMove = async (event: DragMoveEvent) => {
    const now = Date.now();
    if (now - lastDragMoveRef.current < 30) return;
    lastDragMoveRef.current = now;

    // event.delta คือระยะที่ลากออกจากจุดเริ่มต้นจริง
    await channelRef.current?.send({
      type: "broadcast",
      event: "drag-move",
      payload: {
        playerId: playerIdRef.current,
        cardId: Number(event.active.id),
        x: event.delta.x,
        y: event.delta.y,
      },
    });
  };

  // -----------------------------
  // Drag End
  // -----------------------------
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    // แจ้ง browser อื่นว่าจบการลาก
    if (!over) {
      await channelRef.current?.send({
        type: "broadcast",
        event: "drag-end",
        payload: {
          playerId: playerIdRef.current,
          cardId: Number(active.id),
          cancelled: true,
        },
      });

      return;
    }

    const oldIndex = cards.findIndex((card) => card.id === Number(active.id));

    const newIndex = cards.findIndex((card) => card.id === Number(over.id));

    // ไม่ได้เปลี่ยนตำแหน่ง
    if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) {
      await channelRef.current?.send({
        type: "broadcast",
        event: "drag-end",
        payload: {
          playerId: playerIdRef.current,
          cardId: Number(active.id),
          cancelled: true,
        },
      });

      return;
    }

    const newCards = arrayMove(cards, oldIndex, newIndex);

    setCards(newCards);

    // Browser อื่น
    await channelRef.current?.send({
      type: "broadcast",
      event: "drag-end",
      payload: {
        playerId: playerIdRef.current,
        cardId: Number(active.id),
        oldIndex,
        newIndex,
        cancelled: false,
      },
    });

    // Save DB เฉพาะตอนปล่อย
    await Promise.all(
      newCards.map((card, index) =>
        supabase
          .from("itomic")
          .update({ player_order: index + 1 })
          .eq("id", card.id),
      ),
    );
  };

  const handleSingle = async () => {
    const sorted = [...cards].sort((a, b) => a.value - b.value);

    const oldCardIndex = cards[globalIndex - 1];
    const getCardIndex = cards[globalIndex];

    if (getCardIndex.value === sorted[globalIndex].value) {
      await supabase
        .from("itomic")
        .update({
          active: "green",
          score: oldCardIndex ? oldCardIndex.score + 1 : 1,
          showVal: true,
        })
        .eq("id", getCardIndex.id);
    } else {
      await supabase
        .from("itomic")
        .update({
          active: "red",
          score: 0,
          showVal: true,
        })
        .eq("id", getCardIndex.id);

      await supabase
        .from("itomic")
        .update({
          heart: oldCardIndex ? oldCardIndex.heart - 1 : getCardIndex.heart - 1,
        })
        .gt("id", 0);
    }
    setGlobalIndex((prev) => prev + 1);

    if (globalIndex + 1 >= cards.length) {
      setfinishCheck(true);
    }
  };

  const handleNote = async () => {
    const player = JSON.parse(localStorage.getItem("player") ?? "null");
    await supabase
      .from("itomic")
      .update({ note: note, notecolor: hexString })
      .eq("id", player.id);
  };

  const deleteAllRows = async () => {
    const { error } = await supabase
      .from("itomic")
      .delete()
      .neq("id", 0)
      .eq("mode", "single");
    if (error) {
      console.error(error);
    } else {
      console.log("Deleted all rows");
    }
  };

  // const handleSelectTopic = (value: string) => {
  //   const filter = topicGame.find((item) => {
  //     return item.id === value;
  //   });
  //   setTopic(filter?.topic);
  // };

  const groupedOptions = Object.values(
    topicGame.reduce(
      (acc, item) => {
        if (!acc[item.category]) {
          acc[item.category] = {
            label: item.category, // Category header text
            options: [],
          };
        }
        acc[item.category].options.push({
          label: item.topic,
          value: item.topic,
          id: item.id,
        });
        return acc;
      },
      {} as Record<string, CategoryGroup>,
    ),
  );
  return (
    <div
      style={{
        margin:
          window.innerWidth <= 426 ? "0px 10px 0px 10px" : "0px 50px 0px 50px",
      }}
    >
      <h3 style={{ fontSize: "40px", color: "magenta", marginBottom: "20px" }}>
        iTOMIC{" "}
      </h3>
      <h2
        style={{
          fontFamily: "Kanit, sans-serif",
          fontSize: "30px",
          color: "cyan",
        }}
      >
        Single Sort Mode
      </h2>
      <Modal
        title={
          <>
            {" "}
            <Row justify={"center"}>
              {" "}
              <h2 style={{ color: "magenta" }}>iTOMIC</h2>
            </Row>{" "}
            <Row justify={"center"}>
              {" "}
              <h2
                style={{
                  fontFamily: "Kanit, sans-serif",
                  fontSize: "20px",
                  color: "cyan",
                }}
              >
                Single Sort Mode
              </h2>
            </Row>
          </>
        }
        closeIcon={<div>X</div>}
        onCancel={() => setLoseModal(false)}
        open={loseModal}
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
          <h1
            style={{
              fontFamily: "Kanit, sans-serif",
              fontSize: "30px",
              color: "black",
            }}
          >
            กาก
          </h1>
        </Row>
      </Modal>
      <Modal
        title={
          <Row>
            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
              {" "}
              <Row justify={"center"}>
                {" "}
                <h2 style={{ color: "magenta" }}>iTOMIC Test</h2>
              </Row>
              <Row justify={"center"}>
                {" "}
                <h2
                  style={{
                    fontFamily: "Kanit, sans-serif",
                    fontSize: "20px",
                    color: "purple",
                  }}
                >
                  Single Sort Mode
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
              <h3>Enter topic</h3>
              <Row gutter={[2, 18]}>
                <AutoComplete
                  style={{
                    width: "100%",
                    margin: "0px 0px 10px 0px",
                  }}
                  styles={{
                    input: {
                      fontFamily: "Kanit, sans-serif",
                      fontSize: "15px",
                    },
                  }}
                  options={groupedOptions}
                  placeholder="พิมพ์เพื่อค้นหา หรือพิมพ์ข้อความใหม่..."
                  value={topic}
                  filterOption={(
                    inputValue: string,
                    option: CategoryGroup | undefined,
                  ): boolean => {
                    return !!option?.label
                      ?.toLowerCase()
                      .includes(inputValue.toLowerCase());
                  }}
                  onChange={(e) => {
                    setTopic(e);
                  }}
                  onSelect={(value) => {
                    setTopic(value);
                  }}
                  allowClear
                />
              </Row>
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
            </>
          )}
        </Form>
      </Modal>
      <Row justify={"space-between"}>
        <Col xs={24} sm={24} md={12} lg={12} xl={12}>
          <h1
            style={{
              fontFamily: "Kanit, sans-serif",
              fontSize: "30px",
            }}
          >
            Sort the numbers from smallest to largest .
          </h1>
          <Row
            justify={"center"}
            style={{
              fontFamily: "Kanit, sans-serif",
              fontSize: "30px",
            }}
          >
            <h3
              style={{
                fontFamily: "Kanit, sans-serif",
                fontSize: "30px",
                color: "white",
              }}
            >
              Life Point
            </h3>
          </Row>

          <Row justify={"center"}>
            {Array.from({ length: heart }).map((_, index) => (
              <IoIosHeart
                key={index}
                style={{ color: "red", width: "50px", height: "50px" }}
              />
            ))}
          </Row>
          <h3
            style={{
              fontFamily: "Kanit, sans-serif",
              fontSize: "30px",
              color: "white",
            }}
          >
            Score : {score}
          </h3>
        </Col>

        <Col xs={24} sm={24} md={10} lg={6} xl={6}>
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

      <Divider
        style={{ backgroundColor: "green", margin: "15px 0px 15px 0px" }}
      />
      <Row justify={"center"}>
        <h2
          style={{
            fontFamily: "Kanit, sans-serif",
            fontSize: "30px",
            color: "gray",
            marginRight: "10px",
          }}
        >
          Topic :
        </h2>

        {changeTopic === true ? (
          <>
            <Row>
              <AutoComplete
                style={{
                  width: "500px",
                  marginRight: "10px",
                }}
                styles={{
                  input: {
                    fontFamily: "Kanit, sans-serif",
                    fontSize: "15px",
                  },
                }}
                options={groupedOptions}
                placeholder="พิมพ์เพื่อค้นหา หรือพิมพ์ข้อความใหม่..."
                value={topic}
                filterOption={(
                  inputValue: string,
                  option: CategoryGroup | undefined,
                ): boolean => {
                  return !!option?.label
                    ?.toLowerCase()
                    .includes(inputValue.toLowerCase());
                }}
                onChange={(e) => {
                  setTopic(e);
                }}
                onSelect={(value) => {
                  setTopic(value);
                }}
                allowClear
              />
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
              <h2 style={{ fontFamily: "Kanit, sans-serif", fontSize: "30px" }}>
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
                  marginLeft: "20px",
                }}
              >
                Change Topic
              </Button>
            </Row>
          </>
        )}
      </Row>

      <Row style={{ margin: "0px 50px 0px 50px" }} justify={"center"}>
        {/* {isLoading === true ? (
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
        ) : ( */}
        <>
          <Col xs={24} sm={24} md={24} lg={24} xl={24}>
            <DndContext
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragMove={handleDragMove}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={cards}
                strategy={horizontalListSortingStrategy}
              >
                <Row
                  gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}
                  align={"middle"}
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
                          showVal={card?.showVal}
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

              {remoteDrag &&
                remoteDrag.left > 0 &&
                (() => {
                  const targetCard = cards.find(
                    (card) => card.id === remoteDrag.cardId,
                  );
                  if (!targetCard) return null;

                  return (
                    <div
                      style={{
                        position: "fixed",
                        left: `${remoteDrag.left}px`,
                        top: `${remoteDrag.top}px`,
                        transform: `translate3d(${remoteDrag.x}px, ${remoteDrag.y}px, 0)`,
                        transition: "transform 30ms linear",
                        width: "200px",
                        height: "220px",
                        boxSizing: "border-box",
                        padding: "15px",
                        background: "#ffffff",
                        border: "3px dashed #722ed1",
                        borderRadius: "12px",
                        boxShadow: "0 8px 25px rgba(114, 46, 209, 0.35)",
                        zIndex: 99999,
                        pointerEvents: "none",
                        willChange: "transform",
                      }}
                    >
                      <div
                        style={{
                          fontWeight: "bold",
                          color: "#333",
                          fontSize: "16px",
                        }}
                      >
                        {targetCard.name}
                      </div>

                      <div
                        style={{
                          fontSize: "36px",
                          fontWeight: "bold",
                          textAlign: "center",
                          color: "#722ed1",
                          marginTop: "10px",
                        }}
                      >
                        {targetCard.showVal ? targetCard.value : "?"}
                      </div>
                    </div>
                  );
                })()}
            </DndContext>
          </Col>
        </>
        {/* )} */}
      </Row>

      {isHost && isHost.is_host === true && (
        <Row justify={"center"} gutter={24}>
          {finishCheck === false && (
            <Col>
              <Button
                variant="solid"
                color="green"
                onClick={() => {
                  handleSingle();
                }}
                icon={<AiFillCheckCircle />}
                style={{
                  fontSize: "25px",
                  width: "200px",
                  height: "50px",
                }}
              >
                Check No.{globalIndex + 1}
              </Button>
            </Col>
          )}
          <Col>
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
          </Col>
        </Row>
      )}

      <Row justify={"end"}>
        <h3
          style={{
            fontSize: "20px",
            color: "magenta",
          }}
        >
          iTOMIC ver 1.8.5
        </h3>
      </Row>
    </div>
  );
};

export default RumbleOrderScreen;
