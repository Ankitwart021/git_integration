import React, { act } from 'react';
// import edits.css

import ImageDesignEdits from './ImageDesignEdits';

const StyleEdits = ({
  heightValue,
  handleHeightValueChange,
  heightUnit,
  handleHeightUnitChange,
  widthValue,
  handleWidthValueChange,
  widthUnit,
  handleWidthUnitChange,
  backgroundColor,
  handleBackgroundColorChange,
  fontColor,
  handleFontColorChange,
  fontWeight,
  handleFontWeightChange,
  fontStyle,
  handleFontStyleChange,
  cssString,
  handleCssChange,
  classString,
  handleClassChange,
  activeElement,
  textType,
  handleTextTypeChange,
  handleStyleTypeChange,
  handleAspectChange,
  handleSizeChange,
  handleImageFit,
  handleAlignment,
}: any) => {


  return (
    <div className="d-flex flex-column gap-3">
      <div>
        <h6
          className="dropdown-toggle fw-bold d-flex align-items-center gap-2"
          data-bs-toggle="collapse"
          data-bs-target="#cssCollapse"
          role="button"
          style={{color: 'var(--dash-text)', fontSize: '0.9rem'}}
        >
          <i className="fa fa-css3" style={{color: 'var(--dash-accent)'}}></i> CSS Properties
        </h6>
        <div className="collapse show mt-3" id="cssCollapse">
          <div className="d-flex flex-column gap-3">
            <div className="flex-grow-1">
              <label htmlFor="heightInput" className="form-label" style={{color: 'var(--dash-text)', fontSize: '0.85rem'}}>Height</label>
              <div className="input-group">
                <input
                  type="number"
                  id="heightInput"
                  className="form-control modern-input rounded-start"
                  value={heightValue}
                  onChange={handleHeightValueChange}
                  placeholder="e.g., 100"
                  style={{borderRight: 'none'}}
                />
                <select
                  className="form-select modern-input rounded-end"
                  value={heightUnit}
                  onChange={handleHeightUnitChange}
                  style={{maxWidth: '80px', borderLeft: '1px solid var(--dash-border)'}}
                >
                  <option value="px">px</option>
                  <option value="vh">vh</option>
                  <option value="vw">vw</option>
                  <option value="%">%</option>
                  <option value="auto">auto</option>
                </select>
              </div>
            </div>
            <div className="flex-grow-1">
              <label htmlFor="widthInput" className="form-label" style={{color: 'var(--dash-text)', fontSize: '0.85rem'}}>Width</label>
              <div className="input-group">
                <input
                  type="number"
                  id="widthInput"
                  className="form-control modern-input rounded-start"
                  value={widthValue}
                  onChange={handleWidthValueChange}
                  placeholder="e.g., 100"
                  style={{borderRight: 'none'}}
                />
                <select
                  className="form-select modern-input rounded-end"
                  value={widthUnit}
                  onChange={handleWidthUnitChange}
                  style={{maxWidth: '80px', borderLeft: '1px solid var(--dash-border)'}}
                >
                  <option value="px">px</option>
                  <option value="vh">vh</option>
                  <option value="vw">vw</option>
                  <option value="%">%</option>
                  <option value="auto">auto</option>
                </select>
              </div>
            </div>
            <div className="flex-grow-1">
              <label htmlFor="bgColorInput" className="form-label" style={{color: 'var(--dash-text)', fontSize: '0.85rem'}}>Background Color</label>
              <div className="input-group">
                <input
                  type="color"
                  id="bgColorInput"
                  className="form-control form-control-color"
                  value={backgroundColor}
                  onChange={handleBackgroundColorChange}
                  title="Choose your color"
                  style={{
                    maxWidth: '50px', 
                    minWidth: '50px', 
                    height: '38px', 
                    padding: '5px', 
                    cursor: 'pointer', 
                    backgroundColor: 'var(--dash-surface-alt)', 
                    borderColor: 'var(--dash-border)',
                    borderRight: 'none',
                    borderTopLeftRadius: 'var(--radius-md)',
                    borderBottomLeftRadius: 'var(--radius-md)',
                    borderTopRightRadius: 0,
                    borderBottomRightRadius: 0
                  }}
                />
                <input
                  type="text"
                  className="form-control modern-input"
                  value={backgroundColor}
                  onChange={handleBackgroundColorChange}
                  placeholder="#ffffff"
                  style={{
                    borderLeft: 'none', 
                    borderTopLeftRadius: 0, 
                    borderBottomLeftRadius: 0
                  }}
                />
              </div>
            </div>
            <div className="flex-grow-1">
              <label htmlFor="fontColorInput" className="form-label" style={{color: 'var(--dash-text)', fontSize: '0.85rem'}}>Font Color</label>
              <div className="input-group">
                <input
                  type="color"
                  id="fontColorInput"
                  className="form-control form-control-color"
                  value={fontColor}
                  onChange={handleFontColorChange}
                  title="Choose your color"
                  style={{
                    maxWidth: '50px', 
                    minWidth: '50px', 
                    height: '38px', 
                    padding: '5px', 
                    cursor: 'pointer', 
                    backgroundColor: 'var(--dash-surface-alt)', 
                    borderColor: 'var(--dash-border)',
                    borderRight: 'none',
                    borderTopLeftRadius: 'var(--radius-md)',
                    borderBottomLeftRadius: 'var(--radius-md)',
                    borderTopRightRadius: 0,
                    borderBottomRightRadius: 0
                  }}
                />
                <input
                  type="text"
                  className="form-control modern-input"
                  value={fontColor}
                  onChange={handleFontColorChange}
                  placeholder="#000000"
                  style={{
                    borderLeft: 'none', 
                    borderTopLeftRadius: 0, 
                    borderBottomLeftRadius: 0
                  }}
                />
              </div>
            </div>
            <div className="flex-grow-1">
              <label className="form-label me-2" style={{color: 'var(--dash-text)', fontSize: '0.85rem'}}>Font Properties</label>
              <div className="btn-group w-100" role="group">
                <button
                  type="button"
                  className={`btn ${fontWeight === 'bold' ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={handleFontWeightChange}
                  style={{
                    borderColor: 'var(--dash-border)',
                    color: fontWeight === 'bold' ? '#fff' : 'var(--dash-text)',
                    background: fontWeight === 'bold' ? 'var(--dash-accent)' : 'transparent'
                  }}
                >
                  <i className="fa fa-bold"></i> Bold
                </button>
                <button
                  type="button"
                  className={`btn ${fontStyle === 'italic' ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={handleFontStyleChange}
                  style={{
                    borderColor: 'var(--dash-border)',
                    color: fontStyle === 'italic' ? '#fff' : 'var(--dash-text)',
                    background: fontStyle === 'italic' ? 'var(--dash-accent)' : 'transparent'
                  }}
                >
                  <i className="fa fa-italic"></i> Italic
                </button>
              </div>
            </div>

            {/* Align */}
            <div className="flex-grow-1 mt-2">
                <label className="form-label me-2" style={{ fontSize: "13px" }}>Align</label>
                <div className="d-flex gap-2 align-buttons">

                    {/* Left Align */}
                    <button className="icon-btn" onClick={() => handleAlignment("left")}>
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <rect x="2" y="4" width="12" height="3" rx="1" fill="white" />
                            <rect x="2" y="9" width="16" height="3" rx="1" fill="white" />
                            <rect x="2" y="14" width="10" height="3" rx="1" fill="white" />
                        </svg>
                    </button>

                    {/* Center Align */}
                    <button className="icon-btn" onClick={() => handleAlignment("center")}>
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <rect x="4" y="4" width="12" height="3" rx="1" fill="white" />
                            <rect x="2" y="9" width="16" height="3" rx="1" fill="white" />
                            <rect x="5" y="14" width="10" height="3" rx="1" fill="white" />
                        </svg>
                    </button>

                    {/* Right Align */}
                    <button className="icon-btn" onClick={() => handleAlignment("right")}>
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <rect x="6" y="4" width="12" height="3" rx="1" fill="white" />
                            <rect x="2" y="9" width="16" height="3" rx="1" fill="white" />
                            <rect x="8" y="14" width="10" height="3" rx="1" fill="white" />
                        </svg>
                    </button>
                </div>
            </div>
            {/* text types for add text */}
            {activeElement.setText && (
              <div className="flex-grow-1 mt-2">
                <label htmlFor="textTypeSelect" className="form-label text-white">Type</label>
                <select
                  id="textTypeSelect"
                  className="form-select border border-2 border-dark rounded"
                  value={textType}
                  onChange={handleTextTypeChange}
                >
                  <option>select type</option>
                  <option value="regular">Regular</option>
                  <option value="small">Small</option>
                  <option value="large">Large</option>
                  <option value="footnote">Footnote</option>
                  <option value="headlineXSmall">Headline XSmall</option>
                  <option value="headlineSmall">Headline Small</option>
                  <option value="headlineMedium">Headline Medium</option>
                  <option value="headlineLarge">Headline Large</option>
                  <option value="headlineXLarge">Headline XLarge</option>
                </select>
              </div>
            )}
            {/* video design options */}
            {activeElement.type === 'video' && (
              <div className="flex-grow-1 mt-2">
                <h6
                  className="text-white dropdown-toggle fw-bold mt-3"
                  data-bs-toggle="collapse"
                  data-bs-target="#videoCollapse"
                  role="button"
                >
                  Options
                </h6>
                <div className="collapse show " id='videoCollapse'>
                  <div className="mb-1 p-1 d-flex space-between align-items-center justify-content-between text-white">
                    <div className="fw-semibold mb-2" style={{ fontSize: "13px" }}>Aspect Ratio</div>

                    <div className="d-flex gap-1 flex-wrap aspect-icons justify-content-center">

                      {/* AUTO */}
                      {/* <button className="icon-btn" data-tip="Auto" onClick={() => handleAspectChange("auto")}>
                      <svg width="18" height="18">
                        <rect x="3" y="3" width="12" height="12" stroke="#fff" fill="none" strokeWidth="2" />
                      </svg>
                    </button> */}

                      {/* 1:1 Square */}
                      <button className="icon-btn" data-tip="1:1" onClick={() => handleAspectChange("square")}>
                        <svg width="18" height="18">
                          <rect x="4" y="4" width="10" height="10" stroke="#fff" fill="none" strokeWidth="2" />
                        </svg>
                      </button>

                      {/* 9:16 Portrait */}
                      <button className="icon-btn" data-tip="9:16" onClick={() => handleAspectChange("9:16")}>
                        <svg width="18" height="18">
                          <rect x="6" y="3" width="6" height="12" stroke="#fff" fill="none" strokeWidth="2" />
                        </svg>
                      </button>

                      {/* 4:3 */}
                      <button className="icon-btn" data-tip="4:3" onClick={() => handleAspectChange("4:3")}>
                        <svg width="18" height="18">
                          <rect x="3" y="6" width="12" height="6" stroke="#fff" fill="none" strokeWidth="2" />
                        </svg>
                      </button>

                      {/* 16:9 */}
                      <button className="icon-btn" data-tip="16:9" onClick={() => handleAspectChange("16:9")}>
                        <svg width="18" height="18">
                          <rect x="2" y="7" width="14" height="4" stroke="#fff" fill="none" strokeWidth="2" />
                        </svg>
                      </button>

                      {/* 3:1 Super Wide */}
                      <button className="icon-btn" data-tip="3:1" onClick={() => handleAspectChange("3:1")}>
                        <svg width="18" height="18">
                          <rect x="2" y="7" width="16" height="3" stroke="#fff" fill="none" strokeWidth="2" />
                        </svg>
                      </button>

                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* image design */}
            {activeElement.setImageUrl && (
              <ImageDesignEdits
                handleImageFit={handleImageFit}
                handleSizeChange={handleSizeChange}
                handleAspectChange={handleAspectChange}
                handleStyleTypeChange={handleStyleTypeChange}
              />
            )}
          </div>
          
          <div className="mt-4">
            <h6
              className="dropdown-toggle fw-bold d-flex align-items-center gap-2"
              data-bs-toggle="collapse"
              data-bs-target="#cssRawCollapse"
              role="button"
              style={{color: 'var(--dash-text)', fontSize: '0.9rem'}}
            >
              <i className="fa fa-code" style={{color: 'var(--dash-accent)'}}></i> Raw CSS
            </h6>
            <div className="collapse mt-2" id="cssRawCollapse">
              <textarea
                className="form-control modern-input mt-2"
                rows={5}
                value={cssString}
                onChange={handleCssChange}
                style={{fontFamily: 'monospace', fontSize: '0.85rem'}}
              />
            </div>
          </div>
        </div>
      </div>
      
      <div className="collapse show mt-2" id="styleCollapse">
        <h6 className="dropdown-toggle fw-bold d-flex align-items-center gap-2"
          data-bs-toggle="collapse"
          data-bs-target="#bootstrapCollapse"
          role="button"
          style={{color: 'var(--dash-text)', fontSize: '0.9rem'}}
        >
          <i className="fa fa-bootstrap" style={{color: '#7952b3'}}></i> Bootstrap Classes
        </h6>
        <div className="collapse hide mt-2" id="bootstrapCollapse">
          <textarea
            className="form-control modern-input mt-2"
            rows={5}
            value={classString}
            onChange={handleClassChange}
            placeholder="e.g. text-center p-3 bg-light"
            style={{fontFamily: 'monospace', fontSize: '0.85rem'}}
          />
        </div>
      </div>
    </div>
  );
};

export default StyleEdits;
