import React from "react";
import { Button, Input, Tooltip } from "antd";
import {
  CrownFilled,
  HeartFilled,
  StarFilled,
  TeamOutlined,
  SettingOutlined,
  BulbFilled,
  CheckCircleFilled,
  ReloadOutlined,
  GiftFilled,
  LeftOutlined,
  RightOutlined,
  SwapOutlined,
} from "@ant-design/icons";
import "./ITOMICGame.css";

interface Player {
  id: number;
  name: string;
  value?: number;
  isHost?: boolean;
  playerOrder: number;
}

const players: Player[] = [
  {
    id: 1,
    name: "Mic",
    isHost: true,
    playerOrder: 1,
  },
];

const ITOMICGame: React.FC = () => {
  const myNumber = 4;
  const room = "ASD";

  return (
    <div className="itomic-page">
      {/* Background decorations */}
      <div className="bg-shape bg-shape-1" />
      <div className="bg-shape bg-shape-2" />
      <div className="bg-shape bg-shape-3" />

      {/* ================= HEADER ================= */}
      <header className="itomic-header">
        <div className="logo">
          <span className="logo-number">123</span>
          <span className="logo-text">ITOMIC</span>
        </div>

        <div className="room-pill">
          <TeamOutlined />
          <span>Room :</span>
          <strong>{room}</strong>
        </div>

        <div className="header-right">
          <div className="players-pill">
            <TeamOutlined />
            <span>4 / 4 Players</span>
          </div>

          <Tooltip title="Settings">
            <Button className="setting-button" icon={<SettingOutlined />} />
          </Tooltip>
        </div>
      </header>

      {/* ================= MAIN ================= */}
      <main className="game-container">
        {/* ================= LEFT ================= */}
        <section className="game-left">
          {/* Game instruction */}
          <div className="instruction-card">
            <div className="mascot">
              <div className="crown">
                <CrownFilled />
              </div>

              <div className="mascot-body">
                <div className="mascot-face">
                  <span>•ᴗ•</span>
                </div>

                <div className="cards">
                  <div className="mini-card purple" />
                  <div className="mini-card blue" />
                  <div className="mini-card yellow" />
                </div>
              </div>
            </div>

            <div className="instruction-content">
              <h1>
                Sort the numbers
                <br />
                from <span>smallest</span> to <b>largest.</b>
              </h1>

              <div className="stats-card">
                <div className="stat">
                  <div className="stat-icon heart-icon">
                    <HeartFilled />
                  </div>

                  <div>
                    <div className="stat-title">Life Point</div>

                    <div className="hearts">
                      <HeartFilled />
                      <HeartFilled />
                      <HeartFilled />
                    </div>
                  </div>
                </div>

                <div className="stat-divider" />

                <div className="stat">
                  <div className="stat-icon score-icon">
                    <StarFilled />
                  </div>

                  <div>
                    <div className="stat-title">Score</div>

                    <div className="score">0</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ================= TOPIC ================= */}
          <div className="topic-card">
            <div className="topic-left">
              <div className="topic-icon">
                <BulbFilled />
              </div>

              <div className="topic-label">Topic :</div>

              <div className="topic-name">กรุณาเลือกหัวข้อ...</div>
            </div>

            <Button className="topic-button" icon={<SwapOutlined />}>
              Change Topic
            </Button>
          </div>

          {/* ================= PLAY AREA ================= */}
          <div className="play-area">
            <Button
              className="arrow-button arrow-left"
              icon={<LeftOutlined />}
            />

            <div className="cards-container">
              {players.map((player) => (
                <div className="player-wrapper" key={player.id}>
                  <div className="player-order">
                    <CrownFilled />
                    {player.playerOrder}
                  </div>

                  <div className="player-card">
                    <div className="player-header">
                      <strong>{player.name}</strong>

                      {player.isHost && (
                        <span className="host-label">(Host)</span>
                      )}
                    </div>

                    <div className="player-number">?</div>

                    <div className="card-decoration">♛</div>
                  </div>
                </div>
              ))}
            </div>

            <Button
              className="arrow-button arrow-right"
              icon={<RightOutlined />}
            />
          </div>
        </section>

        {/* ================= RIGHT CARD ================= */}
        <aside className="my-card-wrapper">
          <div className="my-card-title">
            <GiftFilled />
            <span>Your Card Number</span>

            <div className="floating-cards">
              <div />
              <div />
              <div />
            </div>
          </div>

          <div className="my-card">
            <div className="my-player-name">Mic</div>

            <div className="my-number">{myNumber}</div>

            <div className="number-decoration left">✦</div>

            <div className="number-decoration right">✦</div>

            <div className="note-row">
              <Input.TextArea
                placeholder="Enter Note..."
                maxLength={40}
                autoSize={false}
                className="note-input"
              />

              <div className="note-color" />
            </div>

            <div className="note-count">0 / 40</div>

            <Button
              type="primary"
              className="save-note-button"
              icon={<CheckCircleFilled />}
            >
              Save Note
            </Button>
          </div>
        </aside>
      </main>

      {/* ================= BOTTOM ACTIONS ================= */}
      <footer className="game-actions">
        <Button
          className="action-button check-button"
          icon={<CheckCircleFilled />}
        >
          Check
        </Button>

        <Button
          className="action-button reset-button"
          icon={<ReloadOutlined />}
        >
          Reset
        </Button>

        <Button className="action-button next-button" icon={<GiftFilled />}>
          Next Topic
        </Button>
      </footer>
    </div>
  );
};

export default ITOMICGame;
