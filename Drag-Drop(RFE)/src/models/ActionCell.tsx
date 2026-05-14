// ActionCell.tsx
import { useNavigate, useParams } from "react-router-dom";
import NavigationService from "./NavigationService";

const ActionCell = ({ data }: any) => {
  const navigate = useNavigate();
  const {appId} = useParams();

  return (
    <div className="d-flex gap-2 p-1">
      {/* Edit */}
      <i
        className="fa fa-edit text-primary cursor-pointer large"
        title="Edit"
        onClick={() => {


         NavigationService.navigateToEdit(data.id, data);
        }}
      />

      {/* Delete */}
      <i
        className="fa fa-trash text-danger cursor-pointer large"
        title="Delete"
        onClick={() => {
          console.log("Delete clicked:", data);
        }}
      />
    </div>
  );
};

export default ActionCell;
