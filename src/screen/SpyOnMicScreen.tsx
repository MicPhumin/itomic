import React, { useEffect, useState } from "react";
import { supabase } from "../supabase";
import {
  message,
  Modal,
  Row,
  Col,
  Button,
  Input,
  Switch,
  Card,
  Divider,
  Form,
  Select,
  AutoComplete,
} from "antd";
import { AiFillPlusSquare } from "react-icons/ai";
import { GiSpy } from "react-icons/gi";
import { FaUserAlt } from "react-icons/fa";
import { BiSolidShow } from "react-icons/bi";
import { FaPlay } from "react-icons/fa6";
import { MdTimer } from "react-icons/md";

interface SpyOnMicProps {
  id: number;
  name: string;
  location: string;
  role: string;
  is_spy: boolean;
  is_host: boolean;
  showrole: boolean;
  vote: number;
  is_vote: string;
}

interface CategoryGroup {
  label: string;
  value: string;
}
interface locationProp {
  id: number;
  location: string;
  roles: string;
}
const SpyOnMicScreen = () => {
  const [cards, setCards] = useState<SpyOnMicProps[]>([]);
  const [myCards, setMyCards] = useState<SpyOnMicProps>();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(true);
  const [submittable, setSubmittable] = React.useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [location, setLocation] = useState<locationProp[] | null>([]);
  const [hostBtn, setHostBtn] = useState<boolean>(false);
  const [endAt, setEndAt] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [answer, setAnswer] = useState<string>("");
  const [answerModal, setAnswerModal] = useState<boolean>(false);
  const [form] = Form.useForm();
  const values = Form.useWatch([], form);
  React.useEffect(() => {
    form
      .validateFields({ validateOnly: true })
      .then(() => setSubmittable(true))
      .catch(() => setSubmittable(false));
  }, [form, values]);

  console.log("card", cards);

  const loadPlayers = async () => {
    const { data } = await supabase.from("spyonmic").select("*");

    const player = JSON.parse(localStorage.getItem("player") ?? "null");

    if (player) {
      const findHost = data?.find((item) => {
        return item.is_host === player.is_host;
      });
      if (findHost?.is_host == true) {
        setHostBtn(true);
      }

      const findPlayer = data?.find((item) => {
        return item.id == player?.id;
      });

      setMyCards(findPlayer);
      localStorage.setItem("player", JSON.stringify(findPlayer));
      setIsModalOpen(false);
    }

    if (data) {
      setCards(data);
    }
  };

  const startTimer = async () => {
    const end = new Date(Date.now() + 480 * 1000);

    console.log("START:", end.toISOString());

    const { error } = await supabase
      .from("game_timer")
      .update({
        end_at: end.toISOString(),
        is_running: true,
      })
      .eq("id", 1);

    if (error) {
      console.log("start error:", error);
      return;
    }

    // ให้เครื่องคนกดเริ่มทำงานทันที
    setEndAt(end.getTime().toString());
  };

  const stopTimer = async () => {
    // หยุดบนหน้าจอนี้ทันที
    setEndAt(null);
    setTimeLeft(0);

    // แล้วค่อย sync ไป Supabase
    const { error } = await supabase
      .from("game_timer")
      .update({
        end_at: null,
        is_running: false,
      })
      .eq("id", 1);

    if (error) {
      console.log("Stop timer error:", error);
    }
  };

  const finishTimer = async () => {
    console.log("TIME UP");

    // ตัวอย่าง: หยุด Timer
    await supabase
      .from("game_timer")
      .update({
        end_at: null,
        is_running: false,
      })
      .eq("id", 1);

    await supabase
      .from("spyonmic")
      .update({
        is_vote: "true",
      })
      .neq("id", 0);
    // ตัวอย่าง action อื่น ๆ
    // setShowAnswer(true);
    // setGameStatus("finished");
    // nextRound();
  };
  useEffect(() => {
    const loadTimer = async () => {
      const { data, error } = await supabase
        .from("game_timer")
        .select("end_at")
        .eq("id", 1)
        .single();

      if (error) {
        console.log("load timer error:", error);
        return;
      }

      console.log("end_at:", data.end_at);

      if (data.end_at) {
        setEndAt(new Date(data.end_at).getTime().toString());
      }
    };

    loadTimer();
  }, []);

  useEffect(() => {
    if (!endAt) {
      setTimeLeft(0);
      return;
    }

    const tick = () => {
      const diff = new Date(endAt).getTime() - Date.now();

      const seconds = Math.max(0, Math.ceil(diff / 1000));

      setTimeLeft(seconds);

      if (seconds <= 0) {
        console.log("Timer finished!");
        // ทำสิ่งที่ต้องการตรงนี้
        finishTimer();
      }
    };

    tick();

    const interval = setInterval(tick, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [endAt]);

  useEffect(() => {
    const channel = supabase
      .channel("game-timer")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "game_timer",
          filter: "id=eq.1",
        },
        (payload) => {
          console.log("Timer update:", payload.new);

          if (payload.new.end_at) {
            console.log(
              "Timer update:",
              new Date(payload.new.end_at).getTime(),
            );

            setEndAt(new Date(payload.new.end_at).getTime().toString());
          } else {
            setEndAt(null);
            setTimeLeft(0);
          }
        },
      )
      .subscribe((status) => {
        console.log("Realtime status:", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function checkCondition() {
    const { data: nonShowPlays, error } = await supabase
      .from("spyonmic")
      .select("id")
      .neq("is_vote", "show")
      .limit(1);

    const isAllShow = !error && nonShowPlays.length === 0;
    console.log("isAllShow=>", isAllShow);
    if (isAllShow) {
      const highestPriceItem = cards.reduce((max, current) => {
        console.log("max=>", max, "current", current);

        return current.vote > (max.vote || 0) ? current : max;
      });
      console.log("highestPriceItem", highestPriceItem);

      const data = await supabase
        .from("spyonmic")
        .update({
          is_vote: "mostvote",
        })
        .eq("id", highestPriceItem?.id);
      if (data) {
        console.log("mostvote Complete");
      }
    }
  }

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
          table: "spyonmic",
        },
        (payload) => {
          console.log("Realtime event:", payload);
          loadPlayers();

          if (payload.eventType === "DELETE") {
            localStorage.clear();
            window.location.reload();
          } else if (payload.eventType === "UPDATE") {
            // setIsLoading(true);
            const player = payload.new as SpyOnMicProps;
            if (player.is_vote === "wrong") {
              setAnswerModal(true);
              setAnswer(player.is_vote);
            }
            if (player.is_vote === "correct") {
              setAnswerModal(true);
              setAnswer(player.is_vote);
            }
            //   setScore(player.score);
            //   if (player.showrole && player.showrole === true) {
            //     console.log("Show Role");
            //   }
            //   if (player.topic) {
            //     setTopic(player.topic);
            //   }
            //   if (player.active === "red") {
            //     setHeart(player.heart);
            //     if (player.heart === 0) {
            //       setLoseModal(true);
            //     }
            //   }
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

  const handleOk = async () => {
    const { data, error } = await supabase.rpc("join_spyonmic", {
      p_name: name,
      p_location: "",
      p_role: "",
      p_is_host: hostBtn,
      p_is_spy: false,
    });

    if (!error) {
      if (data) {
        const userData = data.find((item: SpyOnMicProps) => {
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

  async function getRandomSpyfallGame(data: locationProp[]) {
    const randomLocationIndex = Math.floor(Math.random() * data.length);
    const selectedLocation = data[randomLocationIndex];
    const roles = selectedLocation.roles.split(",");

    const cleanedList = roles.map((item) => item.replace(/[\"\\]/g, "").trim());
    console.log("selectedLocation=>cleanedList", cleanedList);

    const shuffledRoles = [...cleanedList].sort(() => Math.random() - 0.5);

    const spyIndex = Math.floor(Math.random() * cards.length);
    console.log("spyIndex", spyIndex);

    const playerAssignments: any[] = [];
    for (let i = 0; i < cards.length; i++) {
      if (i === spyIndex) {
        playerAssignments.push({
          id: cards[i].id,
          name: cards[i].name,
          is_spy: true,
          location: "???",
          role: "สปาย (Spy)",
          is_host: cards[i].is_host,
          showrole: false,
          vote: 0,
          is_vote: "false",
        });
      } else {
        playerAssignments.push({
          id: cards[i].id,
          name: cards[i].name,
          is_spy: false,
          location: selectedLocation.location,
          role: shuffledRoles.pop(),
          is_host: cards[i].is_host,
          showrole: false,
          vote: 0,
          is_vote: "false",
        });
      }
    }
    console.log("playerAssignments", playerAssignments);

    await Promise.all(
      playerAssignments.map((card) =>
        supabase
          .from("spyonmic")
          .update({
            is_spy: card.is_spy,
            location: card.location,
            role: card.role,
            showrole: card.showrole,
            vote: card.vote,
            is_vote: card.is_vote,
          })
          .eq("id", card.id),
      ),
    );
    return {
      playerAssignments,
    };
  }
  const handleStart = async () => {
    const { data } = await supabase.from("SpyOnMicLocation").select("*");
    const locations: locationProp[] = data || [];
    setLocation(data);
    getRandomSpyfallGame(locations);
    startTimer();
  };

  const deleteAllRows = async () => {
    stopTimer();
    const { error } = await supabase.from("spyonmic").delete().neq("id", 0);
    if (error) {
      console.error(error);
    } else {
      console.log("Deleted all rows");
    }
  };

  const selectOptions = cards.map((user) => ({
    label: user.name, // What the user sees
    value: user.id, // What the form submits
  }));

  const selectLocationOptions = location?.map((user) => ({
    label: user.location, // What the user sees
    value: user.location, // What the form submits
  }));

  const handleVote = async (event: number) => {
    console.log("vote", event);
    const votePlayer = cards.find((item) => {
      return item.id === event;
    });
    await supabase
      .from("spyonmic")
      .update({
        vote: votePlayer ? votePlayer.vote + 1 : 1,
      })
      .eq("id", votePlayer?.id);

    await supabase
      .from("spyonmic")
      .update({
        is_vote: "show",
      })
      .eq("id", myCards?.id);

    checkCondition();
  };

  const handleShow = async () => {
    const show = cards.find((item) => {
      return item.is_vote === "mostvote";
    });

    await supabase
      .from("spyonmic")
      .update({
        showrole: true,
        is_vote: "show",
      })
      .eq("id", show?.id);
  };

  const handleReveal = async () => {
    stopTimer();
    const reveal = cards.find((item) => {
      return item.is_spy === true;
    });
    await supabase
      .from("spyonmic")
      .update({
        showrole: true,
        is_vote: "reveal",
      })
      .eq("id", reveal?.id);
    const { data } = await supabase.from("SpyOnMicLocation").select("*");
    setLocation(data);
  };

  const handleAns = async (event: string) => {
    console.log("vote", event);
    const findLocation = cards.find((item) => {
      return item.location !== "???";
    });
    const reveal = cards.find((item) => {
      return item.is_spy === true;
    });
    if (findLocation?.location === event) {
      await supabase
        .from("spyonmic")
        .update({
          is_vote: "correct",
          location: findLocation?.location,
        })
        .eq("id", reveal?.id);
    } else {
      await supabase
        .from("spyonmic")
        .update({
          is_vote: "wrong",
          location: findLocation?.location,
        })
        .eq("id", reveal?.id);
    }
    await supabase
      .from("spyonmic")
      .update({
        showrole: true,
      })
      .neq("id", 0);
  };

  return (
    <div
      style={{
        margin:
          window.innerWidth <= 426 ? "0px 10px 0px 10px" : "0px 50px 0px 50px",
      }}
    >
      <Row justify={"center"}>
        <h3
          style={{ fontSize: "40px", color: "magenta", marginBottom: "20px" }}
        >
          Spy On Mic
        </h3>
      </Row>
      <Modal
        title={
          <>
            {" "}
            <Row justify={"center"}>
              {" "}
              <h2 style={{ color: "magenta" }}>Spy On Mic</h2>
            </Row>{" "}
          </>
        }
        closeIcon={<div>X</div>}
        onCancel={() => setAnswerModal(false)}
        open={answerModal}
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
              color: answer === "correct" ? "darkred" : "black",
            }}
          >
            {answer === "correct" ? "Spy Win !!!" : "People Win !!!"}
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
                <h2 style={{ color: "magenta" }}>Spy on Mic</h2>
              </Row>
              {/* <Row justify={"center"}>
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
              </Row> */}
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
              <h3>Host</h3>
              <Switch
                onChange={(e) => {
                  setHostBtn(e);
                }}
                value={hostBtn}
                style={{ marginTop: "12px" }}
              />
            </Col>
          </Row>
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
            Find the spy who is embedded among us .
          </h1>
          <h1
            style={{
              color: "cyan",
              fontFamily: "Kanit, sans-serif",
              fontSize: "30px",
            }}
          >
            Time left : {timeLeft} seconds
          </h1>
        </Col>

        <Col xs={24} sm={24} md={10} lg={6} xl={6}>
          <Row justify={"center"}>
            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
              {" "}
              <h2 style={{ fontSize: "20px" }}>Your Role Card</h2>
            </Col>
            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
              <Card
                title={myCards?.name}
                style={{
                  backgroundColor:
                    myCards?.is_spy === false ? "white" : "darkred",
                }}
                styles={{
                  title: {
                    color: myCards?.is_spy === false ? "black" : "white",
                  },
                }}
              >
                {myCards?.is_spy === true ? (
                  <GiSpy
                    style={{
                      color: "white",
                      fontSize: "40px",
                      fontWeight: "bold",
                    }}
                  />
                ) : (
                  <FaUserAlt
                    style={{
                      color: "black",
                      fontSize: "40px",
                      fontWeight: "bold",
                    }}
                  />
                )}{" "}
                <div
                  style={{
                    color: myCards?.is_spy === false ? "black" : "white",
                    fontSize: "20px",
                    fontWeight: "bold",
                    whiteSpace: "pre-line",
                  }}
                >
                  {myCards?.role.replace(" (", "\n(")}
                </div>
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
          Location :
        </h2>

        <>
          <Row>
            <h2 style={{ fontFamily: "Kanit, sans-serif", fontSize: "30px" }}>
              {myCards?.location}
            </h2>{" "}
          </Row>
        </>
      </Row>
      <Row style={{ margin: "0px 50px 0px 50px" }} justify={"center"}>
        <>
          <Col xs={24} sm={24} md={24} lg={24} xl={24}>
            {myCards?.is_spy === true &&
              myCards?.showrole === true &&
              myCards.is_vote === "reveal" && (
                <>
                  <h2
                    style={{
                      fontFamily: "Kanit, sans-serif",
                      fontSize: "30px",
                    }}
                  >
                    What is this Location?
                  </h2>
                  <AutoComplete
                    style={{
                      width: 400,
                    }}
                    styles={{
                      input: {
                        fontFamily: "Kanit, sans-serif",
                        fontSize: "15px",
                      },
                    }}
                    options={selectLocationOptions}
                    placeholder="พิมพ์เพื่อค้นหา หรือพิมพ์ข้อความใหม่..."
                    filterOption={(
                      inputValue: string,
                      option: CategoryGroup | undefined,
                    ): boolean => {
                      return !!option?.label
                        ?.toLowerCase()
                        .includes(inputValue.toLowerCase());
                    }}
                    onSelect={(value) => {
                      handleAns(value);
                    }}
                    allowClear
                  />
                </>
              )}
            {myCards?.is_vote === "true" && (
              <>
                {" "}
                <h2
                  style={{ fontFamily: "Kanit, sans-serif", fontSize: "30px" }}
                >
                  Who do you want to vote?
                </h2>{" "}
                <Select
                  size="large"
                  style={{ width: 400 }}
                  placeholder="Select a user"
                  options={selectOptions}
                  onChange={handleVote}
                />
              </>
            )}

            <>
              {" "}
              <Row
                gutter={[32, 8]}
                align={"middle"}
                style={{ marginTop: "20px" }}
              >
                {cards.map((card) => (
                  <>
                    <>
                      <Col
                        className="gutter-row"
                        xs={24}
                        sm={24}
                        md={12}
                        lg={8}
                        xl={6}
                      >
                        {card.is_vote === "mostvote" && (
                          <h2 style={{ fontSize: "20px" }}>
                            Your Voted : {card?.vote !== 0 ? card?.vote : 0}
                          </h2>
                        )}
                        <Card
                          title={card.name}
                          style={{
                            backgroundColor:
                              card?.is_spy === true && card?.showrole === true
                                ? "darkred"
                                : "white",
                            color:
                              card?.is_spy === true && card?.showrole === true
                                ? "white"
                                : "black",
                          }}
                          styles={{
                            title: {
                              color:
                                card?.is_spy === true && card?.showrole === true
                                  ? "white"
                                  : "black",
                            },
                          }}
                        >
                          <Row justify={"center"}>
                            {" "}
                            {card?.is_spy === true &&
                            card?.showrole === true ? (
                              <GiSpy
                                style={{
                                  color: "white",
                                  fontSize: "40px",
                                  fontWeight: "bold",
                                }}
                              />
                            ) : (
                              <FaUserAlt
                                style={{
                                  color: "black",
                                  fontSize: "40px",
                                  fontWeight: "bold",
                                }}
                              />
                            )}{" "}
                          </Row>
                          <Row justify={"center"}>
                            <div
                              style={{
                                color:
                                  card?.is_spy === true &&
                                  card?.showrole === true
                                    ? "white"
                                    : "black",
                                fontSize: "20px",
                                fontWeight: "bold",
                                whiteSpace: "pre-line",
                              }}
                            >
                              {card.showrole === true
                                ? card.role.replace(" (", "\n(")
                                : "?"}
                            </div>
                          </Row>
                        </Card>
                      </Col>
                    </>
                  </>
                ))}
              </Row>
            </>
          </Col>
        </>
        {/* )} */}
      </Row>

      {myCards?.is_spy === true && myCards?.location === "???" && (
        <Row justify={"center"} gutter={24} style={{ marginTop: "20px" }}>
          <Col>
            <Button
              variant="solid"
              color="red"
              onClick={() => {
                handleReveal();
              }}
              icon={<BiSolidShow />}
              style={{
                fontSize: "25px",
                width: "200px",
                height: "50px",
              }}
            >
              Reveal
            </Button>
          </Col>
        </Row>
      )}
      {myCards?.is_vote === "mostvote" && (
        <Row justify={"center"} gutter={24} style={{ marginTop: "20px" }}>
          <Col>
            <Button
              variant="solid"
              color="cyan"
              onClick={() => {
                handleShow();
              }}
              icon={<BiSolidShow />}
              style={{
                fontSize: "25px",
                width: "200px",
                height: "50px",
              }}
            >
              Show
            </Button>
          </Col>
        </Row>
      )}

      {myCards?.is_host === true && (
        <>
          <Row justify={"center"} gutter={24} style={{ marginTop: "20px" }}>
            <Col>
              <Button
                variant="solid"
                color="green"
                onClick={() => {
                  handleStart();
                }}
                icon={<FaPlay />}
                style={{
                  fontSize: "25px",
                  width: "200px",
                  height: "50px",
                }}
              >
                Start
              </Button>
            </Col>
            <Col>
              <Button
                variant="solid"
                color="red"
                onClick={() => {
                  finishTimer();
                }}
                icon={<MdTimer />}
                style={{
                  fontSize: "25px",
                  width: "200px",
                  height: "50px",
                }}
              >
                Time'up
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
        </>
      )}

      <Row justify={"end"}>
        <h3
          style={{
            fontSize: "20px",
            color: "magenta",
          }}
        >
          Spy On Mic ver 1.0.0
        </h3>
      </Row>
    </div>
  );
};

export default SpyOnMicScreen;
