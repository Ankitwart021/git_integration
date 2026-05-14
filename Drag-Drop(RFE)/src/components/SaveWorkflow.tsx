/**
 * SaveWorkflow Component
 * -------------------------
 *
 * What it does:
 *  - Renders a button to trigger save workflow logic (e.g., saving workflow).
 *  - Calls the provided handler when the button is clicked.
 *
 * Where it is used:
 *  -used in the `Accordian` sidebar (`src/components/Accordian.tsx`).
 *  -used in the navigation bar of the `navbar2` component (`src/components/navbar2.tsx`).
 * 
 * Parameters:
 * @param {function} handleSaveWorkflow - Callback function to handle the save workflow action when the button is clicked.
 *
 * Returns:
 * @return {JSX.Element} The rendered button for saving workflow.
 */

const SaveWorkflow = ({ handleSaveWorkflow, handleGenerateWorkflow }: any) => {

  return (
    <div className="d-flex gap-2">
      <button onClick={handleSaveWorkflow} type="button" className="generate-btn">
        <i className="fa fa-save me-2" aria-hidden="true"></i>Save Workflow
      </button>
      <button onClick={handleGenerateWorkflow} type="button" className="generate-btn">
        <i className="fa fa-cogs me-2" aria-hidden="true"></i>Generate Workflow
      </button>
    </div>

  )
}

export default SaveWorkflow