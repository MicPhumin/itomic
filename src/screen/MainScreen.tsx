import { InstagramOutlined, TikTokOutlined } from "@ant-design/icons";
import { Button, Col, Modal, Row, Tooltip } from "antd";
import { useState } from "react";
import { GiSpy } from "react-icons/gi";
import { IoGameController } from "react-icons/io5";
import { RiFundsBoxFill } from "react-icons/ri";
import { TiSortNumericallyOutline } from "react-icons/ti";

const MainScreen = () => {
  const [howToPlayModal, setHowToPlayModal] = useState(false);
  console.log("window.location.origin", window.location.origin);

  return (
    <div
      style={{
        margin:
          window.innerWidth <= 426 ? "0px 10px 0px 10px" : "0px 50px 0px 50px",
      }}
    >
      <Row justify={"center"}>
        <Col xs={24} sm={2} md={2} lg={2} xl={2}>
          {" "}
          <IoGameController
            style={{
              margin: "40px 10px 0px 0px",
              fontSize: "50px",
              color: "#ff4f64",
            }}
          />
        </Col>
        <Col xs={24} sm={22} md={13} lg={8} xl={4}>
          {" "}
          <h3 style={{ fontSize: "50px", color: "#ff4f64" }}>Mic Play Hub </h3>
        </Col>
        <Col xs={24} sm={2} md={2} lg={2} xl={2}>
          {" "}
          <IoGameController
            style={{
              margin: "40px 0px 0px 10px",
              fontSize: "50px",
              color: "#ff4f64",
            }}
          />
        </Col>
      </Row>
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
      {/* <Button
        variant="solid"
        color="purple"
        onClick={() => setHowToPlayModal(true)}
      >
        How to play
      </Button> */}
      <Row justify={"center"}>
        <h1 style={{ fontFamily: "Kanit, sans-serif", fontSize: "30px" }}>
          Select game
        </h1>
      </Row>
      <Row justify={"center"} gutter={[24, 2]}>
        <Col xs={22} sm={24} md={14} lg={8} xl={5}>
          <Button
            variant="solid"
            color="cyan"
            href={window.location.origin + `/itomic`}
            onClick={() => {}}
            icon={<TiSortNumericallyOutline />}
            style={{
              fontSize: "25px",
              width: "100%",
              height: "50px",
              marginBottom: "10px",
            }}
          >
            iTOMIC
          </Button>
        </Col>
        <Col xs={22} sm={24} md={14} lg={8} xl={5}>
          <Button
            variant="solid"
            color="primary"
            href={window.location.origin + `/itomicFact`}
            icon={<RiFundsBoxFill />}
            style={{
              fontSize: "25px",
              width: "100%",
              height: "50px",
              marginBottom: "10px",
            }}
          >
            iTOMIC : Fact
          </Button>
        </Col>
        <Col xs={22} sm={24} md={14} lg={8} xl={5}>
          <Button
            variant="solid"
            color="danger"
            href={window.location.origin + `/spyonmic`}
            icon={<GiSpy />}
            style={{
              fontSize: "25px",
              width: "100%",
              height: "50px",
              marginBottom: "10px",
            }}
          >
            Spy on Mic
          </Button>
        </Col>
      </Row>
    </div>
  );
};

export default MainScreen;
