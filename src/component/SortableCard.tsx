import { Card, Row, Typography } from "antd";
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";

interface SortableCardProps {
  id: number;
  name: string;
  value: number;
  showVal: boolean;
  online: boolean;
  is_host: boolean;
  topic: string;
  active: string;
  note: string;
}

export default function SortableCard({
  id,
  name,
  value,
  showVal,
  active,
  note,
}: SortableCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: "grab",
    marginBottom: 16,
    touchAction: "none",
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card
        title={name}
        style={{
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
                fontSize: window.innerWidth <= 426 ? "40px" : "80px",
                fontWeight: "bold",
              }}
            >
              {value}
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
        <Typography.Text ellipsis={{ tooltip: true }}>{note}</Typography.Text>
      </Card>
    </div>
  );
}
