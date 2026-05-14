
import React from "react";

const NavigationEdits = ({
  activeElement,
  apiUrl,
  setApiUrl,
  board,
  allPages,
  currentPage,
  handleSetNavigation,
  handleRemoveNavigation,
}: any) => {
  return (
    <>
      {activeElement.navigateTo && activeElement.getBoundResourceName?.() && (
        <div className="d-flex flex-column gap-2 ">
          <label className="form-label fw-bold" style={{color: 'var(--dash-text)', fontSize: '0.85rem'}}>Bind API</label>

          <div className="d-flex align-items-center justify-content-between gap-2">
            <input
              type="text"
              className="form-control modern-input"
              value={apiUrl}
              onChange={(e) => {
                let newApiUrl = e.target.value;
                setApiUrl(newApiUrl);
              }}
            />
            <button
              className="primary-btn"
              onClick={() => {
                activeElement.setApi?.(apiUrl);
                const resourceElement = board.ui_items.root.find(
                  (el: any) =>
                    el.isResource?.() &&
                    el.getResourceName?.()?.toLowerCase() ===
                      activeElement.getBoundResourceName?.()?.toLowerCase()
                );
                resourceElement?.setApi?.(apiUrl);
              }}
            >
              Set
            </button>
          </div>

          <hr className="mb-2" style={{borderColor: 'var(--dash-border)'}} />
        </div>
      )}

      {activeElement.navigateTo && (
        <div className="d-flex flex-column gap-1">
          <h6
            className="dropdown-toggle fw-bold d-flex align-items-center gap-2"
            data-bs-toggle="collapse"
            data-bs-target="#navigateToCollapse"
            role="button"
            style={{color: 'var(--dash-text)', fontSize: '0.9rem'}}
          >
            <i className="fa fa-compass" style={{color: 'var(--dash-accent)'}}></i> NAVIGATION
          </h6>

          <div className="collapse show mt-2" id="navigateToCollapse">
            <div className="d-flex flex-column gap-2">
              <label className="form-label fw-bold mb-0" style={{color: 'var(--dash-text)', fontSize: '0.85rem'}}>
                Navigate To
              </label>
              <div className="d-flex gap-2">
                <div className="dropdown flex-grow-1">
                  <button
                    className="btn dropdown-toggle w-100 d-flex justify-content-between align-items-center modern-dropdown-toggle"
                    type="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    {activeElement.getNavigateTo() === "/"
                      ? "Select Target"
                      : activeElement.getNavigateTo()}
                  </button>
                  <ul className="dropdown-menu w-100">
                    {allPages && allPages.size > 0 ? (
                      Array.from(allPages.keys())
                        .filter((page: any) => page !== currentPage)
                        .map((page: any, idx: number) => (
                          <li key={idx}>
                            <a
                              className="dropdown-item"
                              href="#"
                              onClick={() => handleSetNavigation(page)}
                            >
                              {page}
                            </a>
                          </li>
                        ))
                    ) : (
                      <li className="dropdown-item text-muted">
                        No pages available
                      </li>
                    )}
                  </ul>
                </div>
                {activeElement.getNavigateTo() !== "/" && (
                  <button
                    className="btn d-flex align-items-center justify-content-center"
                    style={{
                      backgroundColor: 'rgba(220, 53, 69, 0.1)',
                      color: '#dc3545',
                      border: '1px solid rgba(220, 53, 69, 0.2)',
                      width: '38px',
                      borderRadius: '6px'
                    }}
                    onClick={() => handleRemoveNavigation()}
                  >
                    <i className="fa fa-trash"></i>
                  </button>
                )}
              </div>
            </div>
          </div>
          <hr className="mb-2" style={{borderColor: 'var(--dash-border)'}} />
        </div>
      )}
    </>
  );
};

export default NavigationEdits;
