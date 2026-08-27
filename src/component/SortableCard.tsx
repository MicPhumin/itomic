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
      .eq("mode", "single");
    if (error) {
      console.error(error);
    } else {
      console.log("Deleted all rows");
    }
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
              <div style={{ marginTop: "5px", fontSize: "16px" }}>{name}</div>
            </Row>
            {is_host === true && (
              <div style={{ color: "goldenrod", fontSize: "14px" }}>(Host)</div>
            )}
          </>
        }
        style={{
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
                color: "black",
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
                color: "black",
                fontSize: window.innerWidth <= 426 ? "40px" : "80px",
                fontWeight: "bold",
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
            color: noteColor,
            WebkitTextStroke: "1px #111",
            // textShadow: "1px 1px 0 #111, 2px 2px 0 #111",
          }}
        >
          {note}
        </Typography.Text>
      </Card>
    </div>
  );
}
