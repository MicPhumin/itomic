import { Button, Card, Row, Typography } from "antd";
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { MdCancel } from "react-icons/md";
import { supabase } from "../supabase";

interface SortableCardProps {
  id: number;
  name: string;
  value: number;
  showVal: boolean | undefined;
  room: string;
  is_host: boolean;
  topic: string;
  active: string;
  note: string;
  noteColor: string;
  host?: boolean | undefined;
  mode?: string;
}

export default function SortableCard({
  id,
  name,
  value,
  showVal,
  active,
  note,
  noteColor,
  is_host,
  host,
  room,
  mode,
}: SortableCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    marginBottom: 16,
    touchAction: "none",
    pointerEvents: showVal === true ? "none" : "auto",
    opacity: showVal === true ? 0.5 : 1,
    cursor: showVal === true ? "not-allowed" : "grab",
  };

  const deletePlayer = async (id: number) => {
    const { error } = await supabase
      .from("itomic")
      .delete()
      .eq("id", id)
      .eq("room", room)
      .eq("mode", mode === "single" ? "single" : "fact");
    if (error) {
      console.error(error);
    } else {
      console.log("Deleted all rows");
    }
  };

  const getContrastColor = (color: string): "#000000" | "#FFFFFF" => {
    let r = 0;
    let g = 0;
    let b = 0;

    // HEX #RGB
    if (/^#([0-9A-F]{3})$/i.test(color)) {
      const hex = color.substring(1);

      r = parseInt(hex[0] + hex[0], 16);
      g = parseInt(hex[1] + hex[1], 16);
      b = parseInt(hex[2] + hex[2], 16);
    }

    // HEX #RRGGBB
    else if (/^#([0-9A-F]{6})$/i.test(color)) {
      const hex = color.substring(1);

      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
    }

    // rgb() / rgba()
    else {
      const match = color.match(/rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/);

      if (match) {
        r = Number(match[1]);
        g = Number(match[2]);
        b = Number(match[3]);
      }
    }

    // Perceived brightness
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;

    return brightness < 128 ? "#FFFFFF" : "#000000";
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card
        aria-disabled={true}
        className=""
        title={
          <>
            {host === true && is_host === false && (
              <Button
                type="text"
                size="small"
                onPointerDown={(e) => {
                  e.stopPropagation();
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  console.log("id", id);
                  deletePlayer(id);
                }}
                style={{
                  margin: "0px 0px 10px 0px",
                  position: "absolute",
                  right: 0,
                  top: 0,
                }}
              >
                <MdCancel style={{ color: "red" }} />
              </Button>
            )}
            <Row justify={"center"}>
              <div
                style={{
                  marginTop: "5px",
                  fontSize: "16px",
                  color: getContrastColor(noteColor ? noteColor : "#FFFFFF"),
                  textShadow:
                    getContrastColor(noteColor ? noteColor : "#FFFFFF") ===
                    "#FFFFFF"
                      ? "1px 1px 0 #000, 2px 2px 0 #000"
                      : "",
                }}
              >
                {name}
              </div>
            </Row>
            {is_host === true && (
              <div
                style={{
                  color: "goldenrod",
                  textShadow: "1px 1px 0 #000, 1px 1px 0 #000",
                  fontSize: "14px",
                }}
              >
                (Host)
              </div>
            )}
          </>
        }
        style={{
          backgroundColor: noteColor,
          position: "relative",
          width: "100%",
          borderColor: active ? active : "",
          borderWidth: active ? "5px" : "",
          height: window.innerWidth <= 426 ? "180px" : "100%",
        }}
      >
        {showVal == true ? (
          <Row justify={"center"}>
            <div
              style={{
                color: getContrastColor(noteColor ? noteColor : "#FFFFFF"),
                textShadow:
                  getContrastColor(noteColor ? noteColor : "#FFFFFF") ===
                  "#FFFFFF"
                    ? "1px 1px 0 #000, 2px 2px 0 #000"
                    : "",
                fontSize:
                  window.innerWidth <= 426
                    ? "40px"
                    : mode === "fact"
                      ? value >= 100000
                        ? value >= 1000000
                          ? value >= 100000000
                            ? "20px"
                            : "25px"
                          : "30px"
                        : "40px"
                      : "80px",
                fontWeight: "bold",
              }}
            >
              {value.toLocaleString()}
            </div>
          </Row>
        ) : (
          <Row justify={"center"}>
            <div
              style={{
                fontSize: window.innerWidth <= 426 ? "40px" : "80px",
                fontWeight: "bold",
                color: getContrastColor(noteColor ? noteColor : "#FFFFFF"),
                textShadow:
                  getContrastColor(noteColor ? noteColor : "#FFFFFF") ===
                  "#FFFFFF"
                    ? "1px 1px 0 #000, 2px 2px 0 #000"
                    : "",
              }}
            >
              ?
            </div>
          </Row>
        )}
        <Typography.Text
          // ellipsis={{
          //   tooltip: true,
          // }}
          style={{
            wordBreak: "break-word",
            overflowWrap: "break-word",
            fontFamily: "Kanit, sans-serif",
            fontSize: 25,
            fontWeight: "bold",
            color: getContrastColor(noteColor ? noteColor : "#FFFFFF"),
            textShadow:
              getContrastColor(noteColor ? noteColor : "#FFFFFF") === "#FFFFFF"
                ? "1px 1px 0 #000, 2px 2px 0 #000"
                : "",
          }}
        >
          {note}
        </Typography.Text>
      </Card>
    </div>
  );
}
