import UIElement from "./UIElement";

export default class ToDoCustomComponent extends UIElement {
  constructor() {
    super();
    this.html = this.getHtml();
    this.styles = {};
    this.classes = "d-flex border border-2 h-25";
    this.type = "todoCustomContainer";
  }

  public serialise(): string {
    let parentJSON = {
      styles: JSON.stringify(this.styles),
      classes: this.classes,
      type: this.type,
      path: this.path,
      uniqueId: this.uniqueId,
      alignment: this.alignment,
    };
    let retJSON = parentJSON;
    return JSON.stringify(retJSON);
  }

  public static deserialise(str: string): UIElement | null {
    let desJSON = JSON.parse(str);
    let obj = new ToDoCustomComponent();
    obj.setClasses(desJSON.classes);
    obj.setStyles(JSON.parse(desJSON.styles));
    obj.setType(desJSON.type);
    obj.setPath(desJSON.path);
    obj.setAlignment(desJSON.alignment);
    return obj;
  }

  public getHtml = (): JSX.Element | null => {
    return (
      <div className={this.classes} id={this.uniqueId}>
        <div className="card">
          <div className="card-header bg-success text-white">
            <h4 className="mb-0">Task Details</h4>
          </div>
          <div className="card-body">
            <div className="row mb-3">
              <div className="col-md-6">
                <h5>
                  User ID:{" "}
                  <span className="font-weight-normal" id="userId">
                    props.userId
                  </span>
                </h5>
              </div>
              <div className="col-md-6">
                <h5>
                  Task ID:{" "}
                  <span className="font-weight-normal" id="taskId">
                    props.taskId
                  </span>
                </h5>
              </div>
            </div>
            <div className="row mb-3">
              <div className="col-md-12">
                <h5>
                  Title:{" "}
                  <span className="font-weight-normal" id="title">
                    props.title
                  </span>
                </h5>
              </div>
            </div>
            <div className="row mb-3">
              <div className="col-md-6">
                <h5>
                  Completed:{" "}
                  <span className="font-weight-normal" id="completed">
                    props.completed
                  </span>
                </h5>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  public getStyledHtml = (): JSX.Element | null => {
    return (
      <div className={this.classes} style={this.styles} id={this.uniqueId}>
        <div className="card">
          <div className="card-header bg-success text-white">
            <h4 className="mb-0">Task Details</h4>
          </div>
          <div className="card-body">
            <div className="row mb-3">
              <div className="col-md-6">
                <h5>
                  User ID:{" "}
                  <span className="font-weight-normal" id="userId">
                    props.userId
                  </span>
                </h5>
              </div>
              <div className="col-md-6">
                <h5>
                  Task ID:{" "}
                  <span className="font-weight-normal" id="taskId">
                    props.taskId
                  </span>
                </h5>
              </div>
            </div>
            <div className="row mb-3">
              <div className="col-md-12">
                <h5>
                  Title:{" "}
                  <span className="font-weight-normal" id="title">
                    props.title
                  </span>
                </h5>
              </div>
            </div>
            <div className="row mb-3">
              <div className="col-md-6">
                <h5>
                  Completed:{" "}
                  <span className="font-weight-normal" id="completed">
                    props.completed
                  </span>
                </h5>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
}
