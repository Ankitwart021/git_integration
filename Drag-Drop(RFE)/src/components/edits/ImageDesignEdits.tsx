import React from 'react'
import '../Edits.css';
const ImageDesignEdits = ({
    handleImageFit,
    handleSizeChange,
    handleAspectChange,
    handleStyleTypeChange,
}: any) =>  {
    return (
        <div className="flex-grow-1 mt-2">
            <div className="text-white" >

                {/* MAIN HEADER */}
                <h6
                    className="text-white dropdown-toggle fw-bold mt-3"
                    data-bs-toggle="collapse"
                    data-bs-target="#designCollapse"
                    role="button"
                >
                    Design
                </h6>
                {/* Style */}
                <div className='p-2' id="designCollapse">
                    <div className="mb-1 d-flex space-between align-items-center justify-content-between gap-2">
                        <div className="fw-semibold mb-2" style={{ fontSize: "13px" }}>Style</div>
                        <div className="d-flex gap-2 style-buttons">

                            {/* Square */}
                            <button className="icon-btn" onClick={() => handleStyleTypeChange("square")}>
                                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                                    <rect x="4" y="4" width="14" height="14" rx="2" stroke="white" strokeWidth="2" />
                                </svg>
                            </button>

                            {/* Circle */}
                            <button className="icon-btn" onClick={() => handleStyleTypeChange("circle")}>
                                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                                    <circle cx="11" cy="11" r="7" stroke="white" strokeWidth="2" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Aspect Ratio */}
                    <div className="mb-1 d-flex space-between align-items-center justify-content-between">
                        <div className="fw-semibold mb-2" style={{ fontSize: "13px" }}>Aspect Ratio</div>

                        <div className="d-flex gap-1 flex-wrap aspect-icons justify-content-end">

                            {/* AUTO */}
                            <button className="icon-btn" data-tip="Auto" onClick={() => handleAspectChange("auto")}>
                                <svg width="18" height="18">
                                    <rect x="3" y="3" width="12" height="12" stroke="#fff" fill="none" strokeWidth="2" />
                                </svg>
                            </button>

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
                                    <rect x="2" y="7" width="14" height="4" stroke="#fff" fill="none" strokeWidth="2" />
                                </svg>
                            </button>

                        </div>
                    </div>


                    {/* Size */}
                    <div className="mb-1 d-flex space-between align-items-center justify-content-between">
                        <div className="fw-semibold mb-2" style={{ fontSize: "13px" }}>Size</div>

                        <div className="d-flex gap-1">
                            <button className="btn btn-dark  rounded px-2 py-2" onClick={() => handleSizeChange("S")}>S</button>
                            <button className="btn btn-dark  rounded px-2 py-2" onClick={() => handleSizeChange("M")}>M</button>
                            <button className="btn btn-dark  rounded px-2 py-2" onClick={() => handleSizeChange("Full")}>Full</button>
                        </div>
                    </div>

                    {/* Image Fill */}
                    <div className="mb-1 d-flex space-between align-items-center justify-content-between">
                        <div className="fw-semibold mb-2" style={{ fontSize: "13px" }}>Image Fill</div>

                        <div className="d-flex gap-3">
                            <button className="btn btn-dark  rounded px-2 py-2" onClick={() => handleImageFit("fill")}>Fill</button>
                            <button className="btn btn-dark  rounded px-2 py-2" onClick={() => handleImageFit("fit")}>Fit</button>
                        </div>
                    </div>

                
                </div>
            </div>
        </div>
    )
}

export default ImageDesignEdits