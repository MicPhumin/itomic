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
  InputNumber,
  Tag,
  type TableProps,
  Table,
  Checkbox,
  Empty,
} from "antd";
import { AiFillPlusSquare, AiOutlineReload } from "react-icons/ai";
import { GiSpy } from "react-icons/gi";
import { FaMapMarkedAlt, FaUserAlt, FaVoteYea } from "react-icons/fa";
import { BiSolidShow } from "react-icons/bi";
import { FaPlay } from "react-icons/fa6";
import { MdTimer } from "react-icons/md";
import "./SpyOnMicScreen.css";

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
  is_played?: boolean;
}

interface RoomList {
  room: string;
  host: string;
  numberOfPlay: number;
}

const presets = [
  "#234A6D",
  "#2C5C86",
  "#376E9D",
  "#4580B2",
  "#5791C2",
  "#70A5D2",
  "#8BB8DE",
  "#9fbeda",
  "#9cb1c5",
  "#b8c3cf",
];

const columns: TableProps<locationProp>["columns"] = [
  {
    title: "id",
    dataIndex: "id",
    key: "id",
  },
  {
    title: "สถานที่",
    dataIndex: "location",
    key: "location",
    filterMode: "tree",
    filterSearch: true,
    onFilter: (value, record) => record.location.startsWith(value as string),
  },
  {
    title: "บทบาท",
    dataIndex: "roles",
    key: "roles",
    render: (_, { roles }) => {
      const cleanedList = roles
        .replace(/[\"\\]/g, "")
        .trim()
        .split(",");

      return (
        <>
          {cleanedList.map((item, index) => (
            <Tag
              key={item}
              color={presets[index]}
              variant={"solid"}
              style={{ marginRight: "5px" }}
            >
              {item}
            </Tag>
          ))}
        </>
      );
    },
  },
  {
    title: "เคยเล่นแล้ว",
    key: "is_played",
    dataIndex: "is_played",
    filters: [
      {
        text: "เคยเล่นแล้ว",
        value: true,
      },
      {
        text: "ยังไม่เคยเล่นแล้ว",
        value: false,
      },
    ],
    onFilter: (value, record) => record.is_played === value,
    render: (_, { is_played }) => (
      <>
        <Row justify={"center"}>
          {" "}
          <Checkbox checked={is_played}></Checkbox>
        </Row>
      </>
    ),
    width: "15%",
  },
];
const SpyOnMicScreen = () => {
  const [cards, setCards] = useState<SpyOnMicProps[]>([]);
  const [myCards, setMyCards] = useState<SpyOnMicProps>();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(true);
  const [submittable, setSubmittable] = React.useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [room, setRoom] = useState<string>("");
  const [roomList, setRoomList] = useState<RoomList[]>([]);
  const [selectRoom, setSelectRoom] = useState<string>("");
  const [location, setLocation] = useState<locationProp[] | null>([]);
  const [hostBtn, setHostBtn] = useState<boolean>(false);
  const [endAt, setEndAt] = useState<number | null>(null);
  const [minute, setMinute] = useState<number>(8);
  const [beginData, setBeginData] = useState<number>(1);
  const [toData, setToData] = useState<number>(20);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [answer, setAnswer] = useState<string>("");
  const [answerModal, setAnswerModal] = useState<boolean>(false);
  const [locationList, setLocationList] = useState<locationProp[]>([]);
  const [locationModal, setLocationModal] = useState<boolean>(false);
  const [searchText, setSearchText] = useState("");
  const [form] = Form.useForm();
  const values = Form.useWatch([], form);

  React.useEffect(() => {
    form
      .validateFields({ validateOnly: true })
      .then(() => setSubmittable(true))
      .catch(() => setSubmittable(false));
  }, [form, values]);

  const filteredData = locationList.filter((record) =>
    Object.values(record).some((value) =>
      String(value).toLowerCase().includes(searchText.toLowerCase()),
    ),
  );
  // console.log("card", cards);
  const showRoomList = async () => {
    const { data } = await supabase
      .from("spyonmic")
      .select("room, name, is_host");

    if (data) {
      const rooms = Object.values(
        data.reduce(
          (acc, player) => {
            if (!acc[player.room]) {
              acc[player.room] = {
                room: player.room,
                host: player.name,
                numberOfPlay: 0,
              };
            }
            acc[player.room].numberOfPlay++;
            if (player.is_host) {
              acc[player.room].host = player.name;
            }

            return acc;
          },
          {} as Record<
            string,
            {
              room: string;
              host: string;
              numberOfPlay: number;
            }
          >,
        ),
      );
      setRoomList(rooms);
    }
  };
  const onChange: TableProps<locationProp>["onChange"] = (
    pagination,
    filters,
    sorter,
    extra,
  ) => {
    console.log("params", pagination, filters, sorter, extra);
  };
  const loadPlayers = async () => {
    const player = JSON.parse(localStorage.getItem("player") ?? "null");

    const { data } = await supabase
      .from("spyonmic")
      .select("*")
      .order("id")
      .eq("room", player ? player.room : room);

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
      setRoom(findPlayer ? findPlayer.room : room);
      localStorage.setItem("player", JSON.stringify(findPlayer));
      setIsModalOpen(false);
    }

    if (data) {
      setCards(data);
      showRoomList();
    }
  };

  const startTimer = async () => {
    const timer = minute * 60;
    const end = new Date(Date.now() + timer * 1000);

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
    setEndAt(end.getTime());
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
      .eq("room", room)
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
        // console.log("load timer error:", error);
        return;
      }

      // console.log("end_at:", data.end_at);

      if (data.end_at) {
        setEndAt(new Date(data.end_at).getTime());
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
      const diff = endAt - Date.now();

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
          // console.log("Timer update:", payload.new);

          if (payload.new.end_at) {
            // console.log(
            //   "Timer update:",
            //   new Date(payload.new.end_at).getTime(),
            // );

            setEndAt(new Date(payload.new.end_at).getTime());
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
            const player = payload.new as SpyOnMicProps;
            if (player.is_vote === "false") {
              setAnswerModal(false);
            }
            if (
              myCards?.is_vote !== null &&
              player.is_vote !== "true" &&
              player.is_vote !== "false" &&
              player.is_vote !== "mostvote" &&
              player.is_vote !== "show" &&
              player.is_vote !== "reveal"
            ) {
              if (player.is_vote === player.location) {
                setAnswerModal(true);
                setAnswer("correct");
              } else if (player.is_vote !== player.location) {
                setAnswerModal(true);
                setAnswer("wrong");
              }
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

  const handleOk = async () => {
    const { data, error } = await supabase.rpc("join_spyonmic", {
      p_name: name,
      p_location: "",
      p_role: "",
      p_is_host: hostBtn,
      p_is_spy: false,
      p_room: hostBtn ? room : selectRoom,
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
    const randomLocation = data[Math.floor(Math.random() * data.length)];

    // await supabase
    //   .from("SpyOnMicLocation")
    //   .update({
    //     is_played: true,
    //   })
    //   .eq("id", randomLocation?.id);

    const roles = randomLocation.roles.split(",");

    const cleanedList = roles.map((item) => item.replace(/[\"\\]/g, "").trim());

    const shuffledRoles = [...cleanedList].sort(() => Math.random() - 0.5);

    const spyIndex = Math.floor(Math.random() * cards.length);

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
          location: randomLocation.location,
          role: shuffledRoles.pop(),
          is_host: cards[i].is_host,
          showrole: false,
          vote: 0,
          is_vote: "false",
        });
      }
    }

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
          .eq("room", room)
          .eq("id", card.id),
      ),
    );
    return {
      playerAssignments,
    };
  }
  const handleStart = async () => {
    const { data } = await supabase
      .from("SpyOnMicLocation")
      .select("*")
      .gte("id", beginData)
      .lte("id", toData)
      .eq("is_played", false);
    const locations: locationProp[] = data || [];
    setLocation(data);
    getRandomSpyfallGame(locations);
    startTimer();
    setAnswerModal(false);
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

  const selectVote = cards.filter((item) => {
    return item.id !== myCards?.id;
  });

  const selectOptions = selectVote.map((user) => ({
    label: user.name, // What the user sees
    value: user.id, // What the form submits
  }));

  const selectLocationOptions = location?.map((user) => ({
    label: user.location, // What the user sees
    value: user.location, // What the form submits
  }));

  const handleVote = async (event: number) => {
    const votePlayer = cards.find((item) => {
      return item.id === event;
    });
    await supabase
      .from("spyonmic")
      .update({
        vote: votePlayer ? votePlayer.vote + 1 : 1,
      })
      .eq("room", room)
      .eq("id", votePlayer?.id);

    await supabase
      .from("spyonmic")
      .update({
        is_vote: "show",
      })
      .eq("room", room)
      .eq("id", myCards?.id);

    const dataHasVote = await supabase
      .from("spyonmic")
      .select("*")
      .eq("room", room)
      .eq("is_vote", "true");

    if (dataHasVote.data?.length === 0) {
      const { data } = await supabase
        .from("spyonmic")
        .select("*")
        .order("vote", { ascending: false })
        .limit(1)
        .eq("room", room)
        .single();

      if (data) {
        await supabase
          .from("spyonmic")
          .update({
            is_vote: "mostvote",
          })
          .eq("room", room)
          .eq("id", data?.id);
      }
    }
  };

  const handleShow = async () => {
    const show = cards.find((item) => {
      return item.is_vote === "mostvote";
    });

    await supabase
      .from("spyonmic")
      .update({
        showrole: true,
      })
      .eq("room", room)
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
      .eq("room", room)
      .eq("id", reveal?.id);
    const { data } = await supabase
      .from("SpyOnMicLocation")
      .select("*")
      .gte("id", beginData)
      .lte("id", toData)
      .eq("is_played", false);
    setLocation(data);
  };

  const handleAns = async (event: string) => {
    const findLocation = cards.find((item) => {
      return item.location !== "???";
    });
    // const reveal = cards.find((item) => {
    //   return item.is_spy === true;
    // });

    if (findLocation?.location === event) {
      await supabase
        .from("spyonmic")
        .update({
          is_vote: event,
          location: findLocation?.location,
        })
        .eq("room", room)
        .neq("id", 0);
    } else {
      await supabase
        .from("spyonmic")
        .update({
          is_vote: event,
          location: findLocation?.location,
        })
        .eq("room", room)
        .neq("id", 0);
    }
    await supabase
      .from("spyonmic")
      .update({
        showrole: true,
      })
      .eq("room", room)
      .neq("id", 0);
  };

  const showdescription = () => {
    const card = cards.find((item) => {
      return item.is_vote === null;
    });

    const findMostVote = cards.find((item) => {
      return item.is_vote === "mostvote";
    });

    const findSpy = cards.find((item) => {
      return item.is_spy === true;
    });

    const findVotePlayer = cards.filter((item) => {
      return item.is_vote === "true";
    });

    if (card?.is_vote === null) {
      return (
        <>
          <h3
            style={{ fontSize: "40px", color: "magenta", marginBottom: "20px" }}
          >
            <GiSpy style={{ marginRight: "10px" }} />
            Wait for player ...
          </h3>
        </>
      );
    }
    if (
      findMostVote &&
      findMostVote.is_vote === "mostvote" &&
      findMostVote.showrole === false
    ) {
      return (
        <>
          <Row
            justify={"center"}
            style={{ width: "100%", margin: "10px 0px 10px 0px" }}
          >
            <h3
              style={{
                fontSize: "40px",
                color: "white",
                margin: "0px 10px 0px 0px",
              }}
            >
              {findMostVote.name}
            </h3>
            <h3
              style={{
                fontSize: "40px",
                color: "magenta",
                margin: "0px 10px 0px 0px",
              }}
            >
              {" "}
              is the most voted
            </h3>
            <FaVoteYea
              style={{
                fontSize: "40px",
                color: "magenta",
                margin: "-5px 10px 20px 0px",
              }}
            />
            <h3
              style={{
                fontSize: "40px",
                color: "magenta",
                margin: "0px 10px 0px 0px",
              }}
            >
              {" "}
              ({findMostVote.vote})
            </h3>
          </Row>
          <Row
            justify={"center"}
            style={{ width: "100%", margin: "0px 0px 10px 0px" }}
          >
            <h3
              style={{
                fontSize: "30px",
                color: "white",
                margin: "0px 10px 0px 0px",
              }}
            >
              {findMostVote.name}
            </h3>
            <h3
              style={{
                fontSize: "30px",
                color: "cyan",
                margin: "0px 10px 0px 0px",
              }}
            >
              {" "}
              show yourself
            </h3>
            <BiSolidShow
              style={{
                fontSize: "30px",
                color: "cyan",
                margin: "0px 10px 0px 0px",
              }}
            />
          </Row>
        </>
      );
    }
    if (myCards?.is_vote === "show" && findVotePlayer.length !== 0) {
      return (
        <>
          <FaVoteYea
            style={{
              marginRight: "10px",
              marginTop: "30px",
              fontSize: "40px",
              color: "skyblue",
            }}
          />
          <h3
            style={{ fontSize: "40px", color: "skyblue", marginBottom: "20px" }}
          >
            Wait for player for vote...
          </h3>
        </>
      );
    }

    if (findMostVote?.showrole === true && findMostVote?.is_spy === false) {
      return (
        <>
          <Row justify={"center"} style={{ width: "100%", marginTop: "30px" }}>
            {" "}
            <h3
              style={{
                fontSize: "40px",
                color: "white",
                margin: "0px 10px 0px 0px",
              }}
            >
              {findMostVote.name}
            </h3>
            <h3
              style={{
                fontSize: "40px",
                color: "cyan",
                margin: "0px 10px 0px 0px",
              }}
            >
              {" "}
              is {findMostVote.role}
            </h3>
            {/* <h3
              style={{ fontSize: "40px", color: "red", marginBottom: "20px" }}
            >
              <GiSpy style={{ marginRight: "10px" }} />
              It's Spy Time to reveal yourself !!!
            </h3> */}
          </Row>
          <Row justify={"center"} style={{ width: "100%" }}>
            <h3
              style={{ fontSize: "40px", color: "red", marginBottom: "20px" }}
            >
              <GiSpy style={{ marginRight: "10px" }} />
              It's Spy Time to reveal yourself !!!
            </h3>
          </Row>
        </>
      );
    }
    if (myCards?.is_spy === false && findSpy?.is_vote === "reveal") {
      return (
        <>
          <h3 style={{ fontSize: "40px", color: "red", marginBottom: "20px" }}>
            <FaMapMarkedAlt style={{ marginRight: "10px" }} />
            Wait for Spy choose location...
          </h3>
        </>
      );
    }
  };

  const handleLocationList = async () => {
    const { data } = await supabase
      .from("SpyOnMicLocation")
      .select("*")
      .gte("id", beginData)
      .lte("id", toData);
    setLocationList(data ? data : []);
  };

  return (
    <div
      style={{
        margin:
          window.innerWidth <= 426 ? "0px 10px 0px 10px" : "0px 50px 0px 50px",
      }}
    >
      <Row justify={"center"}>
        <GiSpy
          style={{
            margin: "32px 10px 0px 0px",
            fontSize: "40px",
            color: "#a70000",
          }}
        />
        <h3
          style={{ fontSize: "40px", color: "#a70000", marginBottom: "20px" }}
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
              <FaMapMarkedAlt
                style={{
                  color: "blueviolet",
                  fontSize: "30px",
                  fontWeight: "bold",
                  marginRight: "10px",
                }}
              />
              <h2
                style={{
                  color: "blueviolet",
                  fontSize: "30px",
                  fontWeight: "bold",
                }}
              >
                Location List
              </h2>
            </Row>
            <Row justify={"center"}> </Row>{" "}
          </>
        }
        closeIcon={<div>X</div>}
        onCancel={() => setLocationModal(false)}
        open={locationModal}
        footer={false}
        width={{
          xs: "80%",
          sm: "80%",
          md: "70%",
          lg: "60%",
          xl: "50%",
          xxl: "40%",
        }}
        style={{ width: 1000 }}
      >
        <Row justify={"center"}>
          <Input.Search
            placeholder="Search Location..."
            onChange={(e) => setSearchText(e.target.value)}
            style={{ marginBottom: 16, width: 300 }}
            allowClear
          />
        </Row>

        <Table
          columns={columns}
          onChange={onChange}
          dataSource={filteredData}
          scroll={{ x: 800 }}
        />
      </Modal>
      <Modal
        title={
          <>
            <Row justify={"center"} style={{ margin: "10px 0px 0px 0px" }}>
              {answer === "correct" ? (
                <>
                  <GiSpy
                    style={{
                      color: "white",
                      fontSize: "60px",
                      fontWeight: "bold",
                      marginBottom: "0px",
                    }}
                  />
                </>
              ) : (
                <>
                  <FaUserAlt
                    style={{
                      color: "white",
                      fontSize: "60px",
                      fontWeight: "bold",
                      marginBottom: "0px",
                    }}
                  />
                </>
              )}
            </Row>
            <Row justify={"center"}>
              <div
                style={{
                  fontFamily: "Kanit, sans-serif",
                  fontSize: "30px",
                  color: "white",
                  margin: "0px",
                }}
              >
                {answer === "correct" ? "Spy Win !" : "Player Win !"}
              </div>
            </Row>
          </>
        }
        centered
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
        className={
          answer === "correct" ? "glow-spy-modal" : "glow-player-modal"
        }
        styles={{
          body: {
            backgroundColor: "#2E4540",
            borderRadius: "10px",
            margin: "10px 0px 10px 0px",
            padding: "5px 20px 5px 20px",
          },

          header: {
            backgroundColor: answer === "correct" ? "#8B2626" : "#1B5E20",
            padding: "5px 0px 5px 0px",
            margin: "0px 100px 10px 100px",
            borderRadius: "10px",
          },
        }}
      >
        <Row justify={"center"}>
          <Col>
            <h1
              style={{
                fontFamily: "Kanit, sans-serif",
                fontSize: "30px",
                color: "white",
                margin: "0px 10px 10px 0px",
              }}
            >
              <FaMapMarkedAlt style={{ marginRight: "10px" }} />
              Location :
            </h1>
          </Col>
          <Col>
            {" "}
            <div
              style={{
                color: "white",
                fontSize: "30px",
                fontWeight: "bold",
                whiteSpace: "pre-line",
              }}
            >
              {/* {myCards?.location.replace(" (", "\n(")} */}
              {myCards?.location}
            </div>
          </Col>
        </Row>
        {answer === "wrong" && (
          <Row justify={"center"}>
            <Col>
              <h1
                style={{
                  fontFamily: "Kanit, sans-serif",
                  fontSize: "30px",
                  color: "red",
                  margin: "0px 10px 10px 0px",
                }}
              >
                Spy Choose :
              </h1>
            </Col>
            <Col>
              {" "}
              <div
                style={{
                  color: "red",
                  fontSize: "30px",
                  fontWeight: "bold",
                  whiteSpace: "pre-line",
                }}
              >
                {myCards?.is_vote}
              </div>
            </Col>
          </Row>
        )}
      </Modal>
      <Modal
        title={
          <Row>
            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
              {" "}
              <Row justify={"center"}>
                {" "}
                <GiSpy
                  style={{
                    margin: "0px 5px 0px 0px",
                    fontSize: "30px",
                    color: "#a70000",
                  }}
                />
                <h2 style={{ color: "#a70000" }}> Spy on Mic</h2>
              </Row>
              <Button
                variant="solid"
                color="purple"
                href={window.location.origin + `/`}
              >
                Back to menu
              </Button>
              <Button
                variant="solid"
                color="volcano"
                onClick={() => localStorage.clear()}
                style={{ marginLeft: "10px" }}
              >
                Clear Local Storage
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
              <h3>Host (Create Room)</h3>
              <Switch
                onChange={(e) => {
                  setHostBtn(e);
                }}
                value={hostBtn}
                style={{ marginTop: "12px" }}
              />
            </Col>
          </Row>

          {/* {hostBtn === true && (
            <>
              <h3>How many minutes do you want to play each round?</h3>
              <Row>
                {" "}
                <InputNumber
                  placeholder="Enter Times"
                  defaultValue={minute}
                  onChange={(e) => {
                    setMinute(e ?? 0);
                  }}
                  style={{ width: "470px" }}
                />
              </Row>{" "}
              <Row>
                {" "}
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
          )} */}
          {hostBtn === true ? (
            <>
              <Row gutter={12} style={{ marginLeft: "1px" }}>
                <h3
                  style={{
                    margin: "0px 0px 20px 8px",
                  }}
                >
                  Create Room Name{" "}
                </h3>
                <Input
                  placeholder="Enter Room Name"
                  value={room}
                  onChange={(e) => {
                    setRoom(e.target.value);
                  }}
                  style={{ marginBottom: "10px" }}
                />
              </Row>{" "}
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
          ) : (
            <>
              <Row style={{ marginLeft: "10px" }}>
                <h3 style={{ margin: "0px 5px 0px 0px" }}>Select Room :</h3>
                <h3 style={{ color: "green", margin: "0px 5px 0px 0px" }}>
                  {selectRoom}
                </h3>
              </Row>

              {roomList.length === 0 ? (
                <Row justify={"center"}>
                  <Empty style={{ width: "80%" }} />
                </Row>
              ) : (
                <>
                  <div style={{ display: "flex", gap: 16 }}>
                    {roomList.map((item) => (
                      <Card
                        hoverable
                        onClick={() => setSelectRoom(item.room)}
                        style={{
                          width: 200,
                          cursor: "pointer",
                          borderRadius: 12,
                          border:
                            selectRoom === item.room
                              ? "2px solid green"
                              : "1px solid #d9d9d9",
                        }}
                      >
                        <Row>
                          <Col>
                            <div
                              style={{
                                color: "purple",
                                marginRight: "5px",
                                fontWeight: "bold",
                              }}
                            >
                              Room :{" "}
                            </div>
                          </Col>
                          <Col>
                            <div>{item.room}</div>
                          </Col>
                        </Row>
                        <Row>
                          <Col>
                            <div
                              style={{
                                color: "blue",
                                marginRight: "5px",
                                fontWeight: "bold",
                              }}
                            >
                              Host :{" "}
                            </div>
                          </Col>
                          <Col>
                            {" "}
                            <div>{item.host}</div>
                          </Col>
                        </Row>
                        <Row>
                          <Col>
                            <div
                              style={{
                                color: "magenta",
                                marginRight: "5px",
                                fontWeight: "bold",
                              }}
                            >
                              Player in room :{" "}
                            </div>
                          </Col>
                          <Col>
                            <div>{item.numberOfPlay}</div>
                          </Col>
                        </Row>
                      </Card>
                    ))}
                  </div>
                </>
              )}
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
            Find the spy who is embedded among us .
          </h1>
          <h1
            style={{
              color: "cyan",
              fontFamily: "Kanit, sans-serif",
              fontSize: "30px",
            }}
          >
            Time left : {Math.floor(timeLeft / 60)} : {timeLeft % 60}
          </h1>
          <Button
            variant="solid"
            color="blue"
            onClick={() => {
              handleLocationList();
              setLocationModal(true);
            }}
            icon={<FaMapMarkedAlt />}
            style={{
              fontSize: "20px",
              width: "180px",
              height: "30px",
            }}
          >
            Location List
          </Button>
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
                    marginTop: "10px",
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

        <Row>
          <h2 style={{ fontFamily: "Kanit, sans-serif", fontSize: "30px" }}>
            {myCards?.location}
          </h2>{" "}
        </Row>
      </Row>
      <Row justify={"center"}>{showdescription()}</Row>
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
                  placeholder="Select a player"
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
                        {card.is_vote === "show" && (
                          <h2 style={{ fontSize: "20px" }}>
                            Number of Votes :{" "}
                            {card?.vote !== 0 ? card?.vote : 0}
                          </h2>
                        )}
                        {card.is_vote === "mostvote" && (
                          <h2 style={{ fontSize: "20px" }}>
                            Number of Votes :{" "}
                            {card?.vote !== 0 ? card?.vote : 0}
                          </h2>
                        )}
                        {card.is_vote === "correct" && (
                          <h2 style={{ fontSize: "20px" }}>
                            Number of Votes :{" "}
                            {card?.vote !== 0 ? card?.vote : 0}
                          </h2>
                        )}
                        {card.is_vote === "wrong" && (
                          <h2 style={{ fontSize: "20px" }}>
                            Number of Votes :{" "}
                            {card?.vote !== 0 ? card?.vote : 0}
                          </h2>
                        )}
                        <Card
                          title={
                            <>
                              {card.name}
                              {card.is_host === true && (
                                <div style={{ color: "goldenrod" }}>(Host)</div>
                              )}
                            </>
                          }
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
                                marginTop: "10px",
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

      {myCards?.is_spy === true &&
        myCards?.location === "???" &&
        myCards?.is_vote !== "true" && (
          <Row justify={"center"} gutter={24} style={{ marginTop: "20px" }}>
            <Col>
              <Button
                variant="solid"
                color="red"
                onClick={() => {
                  handleReveal();
                }}
                icon={<GiSpy />}
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
      {myCards?.is_vote === "mostvote" && myCards?.is_spy !== true && (
        <>
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
        </>
      )}

      {myCards?.is_host === true && (
        <>
          <Divider
            style={{ backgroundColor: "green", margin: "30px 0px 10px 0px" }}
          />

          <Row justify={"center"} gutter={24} style={{ marginTop: "20px" }}>
            <h2 style={{ fontFamily: "Kanit, sans-serif", fontSize: "30px" }}>
              Host Control Panel
            </h2>{" "}
          </Row>
          <Row justify={"center"} gutter={[64, 0]}>
            <Col xs={24} sm={24} md={10} lg={10} xl={10}>
              <Row justify={window.innerWidth <= 426 ? "center" : "end"}>
                {" "}
                <h3 style={{ margin: "0px" }}>Change minutes </h3>
              </Row>
              <Row
                justify={window.innerWidth <= 426 ? "center" : "end"}
                align={"middle"}
              >
                {" "}
                <InputNumber
                  placeholder="Enter Times"
                  defaultValue={minute}
                  onChange={(e) => {
                    setMinute(e ?? 0);
                  }}
                />
                <div style={{ marginLeft: "10px" }}> minutes </div>
              </Row>
            </Col>
            <Col xs={24} sm={24} md={10} lg={10} xl={10}>
              <Row justify={window.innerWidth <= 426 ? "center" : "start"}>
                {" "}
                <h3 style={{ margin: "0px" }}>
                  Change Location Dataset (1 - 100)
                </h3>
              </Row>
              <Row justify={window.innerWidth <= 426 ? "center" : "start"}>
                <Col>
                  <InputNumber
                    value={beginData}
                    onChange={(e) => {
                      setBeginData(e ?? 0);
                    }}
                  />
                </Col>
                <div style={{ margin: "0px 10px 0px 10px" }}> - </div>
                <Col>
                  <InputNumber
                    value={toData}
                    onChange={(e) => {
                      setToData(e ?? 0);
                    }}
                  />
                </Col>
              </Row>
            </Col>
          </Row>

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
                  marginBottom: "10px",
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
                  marginBottom: "10px",
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
                  marginBottom: "10px",
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
            color: "#a70000",
          }}
        >
          Spy On Mic
        </h3>
      </Row>
    </div>
  );
};

export default SpyOnMicScreen;
