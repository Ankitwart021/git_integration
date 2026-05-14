import apiConfig from "../config/apiConfig";

/**
 * Login Component
 * ---------------
 *
 * What it does:
 *  - Renders the login page for the application.
 *  - Displays the IIIT Bangalore logo and a login button.
 *  - Redirects the user to the backend authentication endpoint when the login button is clicked [keycloak].
 *  - New users must register and create user instances in keycloak.
 *
 * Where it is used:
 *  - Registered as the root route (`/`) in `src/App.tsx`.
 *  - Serves as the entry point for users who are not authenticated.
 *
 * @param none
 *
 * @return {JSX.Element} The rendered login page UI.
 */
const Login = () => {

  const handleClick = () => {
    // window.location.href = 'http://localhost:8000/auth/login'
    window.location.href = `${apiConfig.LOGIN_URL}`;

  }
  return (
    <div className="dashboard-root d-flex justify-content-center  align-items-center vh-100 ">
      <div className='row h-75 w-75 '>
        {/* logo */}
        <div className='col-6 bg-secondary p-3'>
          <img src="/iiit_logo.png" alt="The logo" className='mb-3 d-flex mx-auto ' style={{ height: "252px", width: "233px" }} />
          <h4 className='text-light text-center mb-2'> International Institute of Information
            {/* <br /> */}
            Technology Bangalore</h4>
        </div>
        {/* login */}
        <div className='col-6 border  bg-light p-3 d-flex flex-column justify-content-center align-items-center'>
          <h4 className="text-center text-dark mb-1 fw-bold">
            LOGIN TO RASP
          </h4>
          <div className="p-4 rounded text-center ">
            <button className="btn btn-secondary btn-lg border fw-bold" onClick={handleClick}>
              Login
            </button>
          </div>
        </div>
      </div>
    </div>


  );

}

export default Login

