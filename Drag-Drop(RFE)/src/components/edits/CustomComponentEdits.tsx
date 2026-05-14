
import React from "react";

const CustomComponentEdits = ({
  CustomComponentName,
  setCustomComponentName,
  handleSaveComponent,
}: any) => {
  return (
    <div className="d-flex flex-column gap-1 mt-4   " style={{ borderColor: 'var(--dash-border)' }}>
      <h6
        className="btn  fw-bold d-flex align-items-center gap-2 "
        data-bs-toggle="modal"
        data-bs-target="#customComponentCollapse"
        role="button"
       
        style={{ color: 'var(--dash-text)', fontSize: '0.9rem', borderColor: 'var(--dash-border)' }}
      >
        <i className="fa fa-puzzle-piece" style={{ color: 'var(--dash-accent)' }}  ></i> SAVE AS CUSTOM COMPONENT
      </h6>

      {/* Collapsible Input Section */}
      {/* <div className="modal fade mt-2" id="customComponentCollapse"  aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div className="d-flex flex-column gap-2">
          <label className="form-label fw-bold mb-0" style={{color: 'var(--dash-text)', fontSize: '0.85rem'}}>
            Title
          </label>
          <input
            type="text"
            className="form-control modern-input"
            placeholder="Enter Custom Component name"
            onChange={(e) => setCustomComponentName(e.target.value)}
          />
        </div> */}

      {/* Save Button (Visible only when text is entered) */}
      {/* {CustomComponentName.trim() && (
          <button
            className="primary-btn mt-3 w-100 justify-content-center"
            onClick={handleSaveComponent}
          >
            <i className="fa fa-floppy-o"></i> Save Component
          </button>
        )}
      </div> */}

      {/* <!-- Modal --> */}
      <div className="modal fade" id="customComponentCollapse" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <label className="form-label text-dark   fw-bold mb-0" style={{  fontSize: '0.85rem' }}>
                Title
              </label>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={()=>setCustomComponentName("")} ></button>
            </div>
            <div className="modal-body">
           <input
            type="text"
            className="form-control "
            placeholder="Enter Custom Component name"
            style={{border:" 2px #dad7f19d solid"}}

            value={CustomComponentName}
            onChange={(e) => setCustomComponentName(e.target.value)}
          />
            </div>
            <div className="modal-footer">
              {/* <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              <button type="button" className="btn btn-primary">Save changes</button> */}
               {CustomComponentName.trim() && (
          <button
          
            className="primary-btn mt-3 w-100 justify-content-center"
            onClick={handleSaveComponent}
          >
            <i className="fa fa-floppy-o"></i> Save Component
          </button>
        )}
            </div>
          </div>
        </div>
      </div>
      <hr className="mt-3 mb-1" style={{ borderColor: 'var(--dash-border)' }} />
    </div>
  );
};

export default CustomComponentEdits;
