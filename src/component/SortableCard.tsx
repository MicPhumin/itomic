import { Card, Row } from "antd";
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";

interface SortableCardProps {
  id: string;
  title: string;
  value: number;
  showVal: boolean;
}

export default function SortableCard({
  id,
  title,
  value,
  showVal,
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
      <Card title={title}>
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
