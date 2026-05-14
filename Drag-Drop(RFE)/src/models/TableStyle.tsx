
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { TABLE_VIEW_STYLE } from "../constants";
import ActionCell from "./ActionCell";
ModuleRegistry.registerModules([AllCommunityModule]);

import { useAppMetaDataStore } from "../store/useAppMetaDataStore";
export default class TableStyle {



  public type: string = TABLE_VIEW_STYLE;

  public serialise(): string {
    return JSON.stringify({ type: this.type });
  }

  public static deserialise(str: string): TableStyle | null {
    try {
      const desJSON = JSON.parse(str);
      if (desJSON.type !== TABLE_VIEW_STYLE) {
        return null;
      }
      return new TableStyle();
    } catch (e) {
      console.error("Error deserialising TableStyle:", e);
      return null;
    }
  }
  private getColumnDefs(resName:any,data: Record<string, any>[], op: string | undefined): any[] {
    if (data.length === 0) return [];
    const getAppIdFromStore = useAppMetaDataStore.getState().getAppIdFromStore
    const getSelectedResourceMetaData = useAppMetaDataStore.getState().getSelectedResourceMetaData;
    const resMetaData = getSelectedResourceMetaData(getAppIdFromStore(),resName)
    console.log("resource meta in table model", resMetaData);
    const fields = resMetaData.fieldValues;
    const allColumnNames =  fields.map((item:any )=> item.name);
    const columns = allColumnNames.map((key:any) => {
   
      if (key === "image") {
        return {
          field: key,
          headerName: "Image",
          cellRenderer: (params: any) => (
            <img
              src={params.value}
              alt="post"
              style={{ width: 50, height: 50, objectFit: "cover" }}
            />
          ),
          width: 80,
        };
      }
      if (key === "completed") {
        return {
          field: key,
          headerName: "Completed",
          cellRenderer: (params: any) => (params.value ? "✅ Yes" : "❌ No"),
          width: 120,
        };
      }

      return {
        field: key,
        // headerName: key.charAt(0).toUpperCase() + key.slice(1),
        headerName: key,
        sortable: true,
        filter: true,
        flex: 1,
      };
    });
    if (op === "Update" || op === "Read") {
      columns.push({
        headerName: "Actions",
        field: "__actions",
        width: 120,  
        // cellRenderer: (params: any) => {
        //   return (
        //     <div className="d-flex gap-2 p-1">

        //       {/* Edit */}
              
        //         <i
        //           className="fa fa-edit text-primary cursor-pointer large"
        //           title="Edit"
        //           onClick={() => {
        //             console.log("Edit clicked:", params.data);
        //             // 🔗 navigate to edit / open modal
        //           }}
        //         />
              

        //       {/* Delete */}
        //       <i
        //         className="fa fa-trash text-danger cursor-pointer large"
        //         title="Delete"
        //         onClick={() => {
        //           console.log("Delete clicked:", params.data);
        //           // 🔗 call delete API
        //         }}
        //       />
        //     </div>
        //   );
        // },
  cellRenderer: (params: any) => (
    <ActionCell data={params.data} />
  ),

      });
    }

    return columns;
  }

  // public getColDef = (data: Record<string, any>[]) => {
  //   return this.getColumnDefs(data);
  // };

  public getStyledHtml(resName:any,data: Record<string, any>[], op?: string): JSX.Element | null {
    console.log("data in the aggrid", data);
    return (
      data.length > 0 ? (<div className="ag-theme-alpine w-100 " style={{ height: 400, width: "100%" }}>
        {/* <h3>{op} {resourceName}</h3> */}
        {/* <div className="ag-theme-alpine"> */}

        <AgGridReact
          rowData={data}
          columnDefs={this.getColumnDefs(resName,data, op)}
          pagination={true}
          paginationPageSize={10}
          paginationPageSizeSelector={[20]}
          rowSelection="multiple"
        />

      </div>) :
        // (<div>Select a resource to view data</div>)
        (<div>Add Data in Data Tab</div>)
    );
  }
}
