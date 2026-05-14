
const SelectedNavbar = () => {
  return (
    <nav
      className="navbar navbar-expand-lg navbar-dark shadow"
      style={{
        background: "linear-gradient(90deg, #4e54c8, #8f94fb)",
        padding: "12px 20px",
      }}
    >
      <div className="container-fluid">
        <span
          className="navbar-brand fw-bold"
          style={{ fontSize: "22px", cursor: "pointer" }}
        >
          MyApp
        </span>

        <ul className="navbar-nav ms-auto d-flex flex-row gap-4">
          {["Home", "Profile", "Settings"].map((item) => (
            <li key={item} className="nav-item">
              <span
                className="nav-link text-white"
                style={{ cursor: "pointer" }}
              >
                {item}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default SelectedNavbar;
