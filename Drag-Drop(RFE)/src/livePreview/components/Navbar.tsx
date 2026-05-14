import React, { useContext } from 'react';
import './Navbar.css'
import UserInfoContext from '../../context/userContext';
import { useNavigate, useParams } from 'react-router-dom';
const Navbar = ({ setIsFullScreen, isFullScreen }:any) => {
    const { userInfo, deserlisation } = useContext(UserInfoContext);
    const navigate = useNavigate();
    const {appId} = useParams();
    return (
        <div>
            <nav className="navbar">
    {/* <!-- Left --> */}
    <div className="nav-left">
      <span className="user-badge">👤 Viewing as <strong>{userInfo.getUserName()}</strong></span>
    </div>

    {/* <!-- Center --> */}
    <div className="nav-center">
        {!setIsFullScreen && <button className='back-btn publish-btn' onClick={()=>{
            navigate(`/${appId}/DragDrop`);
        }}>&lt;</button>}
      <button className="publish-btn">Publish to preview your app</button>
    </div>

    {/* <!-- Right --> */}
    <div className="nav-right">
      {/* <button className="icon-btn">▢</button>
      <button className="icon-btn">⧉</button> */}
      {setIsFullScreen && <button onClick={() => setIsFullScreen(!isFullScreen)} className={`fullscreen-btn rounded bg-dark  p-2 fa icon-btn ${isFullScreen ? " fa-solid fa-compress fa-sm" : "fa-solid fa-expand fa-sm"} `}></button>}
    </div>
  </nav>
        </div>
    );
}

export default Navbar;
