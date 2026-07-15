import { Card, Row } from "antd";
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";

interface SortableCardProps {
  id: number;
  name: string;
  value: number;
  showVal: boolean;
  active: string;
}

export default function SortableCard({
  id,
  name,
  value,
  showVal,
  active,
}: SortableCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: "grab",
    marginBottom: 16,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card
        title={name}
        style={{
          borderColor: active ? active : "",
          borderWidth: active ? "5px" : "",
        }}
      >
        {showVal == true ? (
          <Row justify={"center"}>
            <div
              style={{ color: "black", fontSize: "80px", fontWeight: "bold" }}
            >
              {value}
            </div>
          </Row>
        ) : (
          <Row justify={"center"}>
            <div
              style={{ color: "black", fontSize: "80px", fontWeight: "bold" }}
            >
              ?
            </div>
          </Row>
        )}
      </Card>
    </div>
  );
}
