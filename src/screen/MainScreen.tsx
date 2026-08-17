import { InstagramOutlined, TikTokOutlined } from "@ant-design/icons";
import { Button, Modal, Row, Tooltip } from "antd";
import React, { useState } from "react";
import { AiFillAudio, AiOutlineOrderedList } from "react-icons/ai";

type Props = {};

const MainScreen = (props: Props) => {
  const [howToPlayModal, setHowToPlayModal] = useState(false);
  return (
    <div
      style={{
        margin:
          window.innerWidth <= 426 ? "0px 10px 0px 10px" : "0px 50px 0px 50px",
      }}
    >
      <h3 style={{ fontSize: "50px", color: "magenta" }}>iTOMIC </h3>
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
      <Button
        variant="solid"
        color="purple"
        onClick={() => setHowToPlayModal(true)}
      >
        How to play
      </Button>
      <Row justify={"center"}>
        <h1 style={{ fontFamily: "Kanit, sans-serif", fontSize: "30px" }}>
          Select Mode
        </h1>
      </Row>
      <Row justify={"center"}>
        <Button
          variant="solid"
          color="cyan"
          href={window.location.origin + `/single`}
          onClick={() => {}}
          icon={<AiOutlineOrderedList />}
          style={{
            fontSize: "25px",
            width: "300px",
            height: "50px",
          }}
        >
          Single Sort Mode
        </Button>

        <a href=""></a>
        <Button
          variant="solid"
          color="primary"
          href={window.location.origin + `/rumble`}
          icon={<AiFillAudio />}
          style={{
            marginLeft: "20px",
            fontSize: "25px",
            width: "300px",
            height: "50px",
          }}
        >
          Rumble Sort Mode
        </Button>
      </Row>
    </div>
  );
};

export default MainScreen;
