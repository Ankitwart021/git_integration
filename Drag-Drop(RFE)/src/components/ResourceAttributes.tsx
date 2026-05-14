import { useDrag } from "react-dnd";

const ResourceAttributes = ({ field, resourceName, isBound }: any) => {
  const isEnum = field.is_enum;
  const isForeign = !!field.foreign_field || !!field.foreign;
  const isFile = !!field.is_file;

  let type = "input";
  if (field.type === "Date") {
    type = "inputCalendar";
  } else if (field.is_enum || field.foreign_field || field.type === "Boolean") {
    type = "dropdown";
  } else if (field.is_file) {
    type = "fileupload";
    } else if (field.type === "String" || field.type === "Long") {
    type = "input";
  }

  const [{ isDragging }, drag] = useDrag(() => ({
    type: "text",
    item: () => {
      if (!field || !resourceName) return {};
      return {
        itemType: type,
        fromResource: true,
        fieldName: field.name,
        resourceName,
        field,
      };
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const annotation = isEnum
    ? `(enum) ${field.possible_value}`
    : isForeign
      ? `(foreign) ${field.foreign_field || ""}`
      : isFile
        ? "(file)"
        : `(${field.type})`;

  return (
    <li
      ref={isBound ? null : drag}
      className={`list-group-item py-2 px-3 d-flex justify-content-between align-items-center mb-1 border-0 rounded`}
      style={{ 
        cursor: isBound ? "not-allowed" : "grab",
        backgroundColor: isBound ? 'rgba(255,255,255,0.05)' : 'var(--dash-bg-dark)',
        color: isBound ? 'var(--dash-text-muted)' : 'var(--dash-text)',
        opacity: isBound ? 0.6 : 1,
        border: '1px solid var(--dash-border)'
      }}
      key={`${field.name}-${field.type}-${isBound ? "bound" : "free"}`}
    >
      <span className="fw-medium">{field.name}</span>
      <small style={{color: 'var(--dash-text-muted)', fontSize: '0.75rem'}}>{annotation}</small>
    </li>
  );
};

export default ResourceAttributes;

