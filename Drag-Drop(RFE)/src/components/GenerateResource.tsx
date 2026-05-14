/**
 * GenerateResource Component
 * -------------------------
 *
 * What it does:
 *  - Renders a button to trigger resource generation logic (e.g., generating resource).
 *  - Calls the provided handler when the button is clicked.
 *
 * Where it is used:
 *  -used in the `Accordian` sidebar (`src/components/Accordian.tsx`).
 *  -used in the navigation bar of the `navbar2` component (`src/components/navbar2.tsx`).
 * 
 * Parameters:
 * @param {function} handleGenerateResource - Callback function to handle the resource generation action when the button is clicked.
 *
 * Returns:
 * @return {JSX.Element} The rendered button for generating resources.
 */

const GenerateResource = ({ handleGenerateResource }: any) => {
 
  return (
    <button onClick={handleGenerateResource} type="button" className="generate-btn">
      <i className="fa fa-cogs me-2" aria-hidden="true"></i>Generate Resources
    </button>
  )
}

export default GenerateResource