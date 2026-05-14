/**
 * Accordian Component
 * -------------------
 *
 * What it does:
 *  - Renders a sidebar UI panel displaying categorized lists of UI components (inputs, buttons, forms, etc.)
 *  - Allows users to search/filter components by name.
 *  - Fetches and displays user-specific custom components and app-specific resources using React Query.
 *  - Handles user authentication by decoding the access token from the URL and updating login context.
 *  - Integrates a CollectionTree for managing and selecting UI elements in a hierarchical structure.
 *
 * Where it is used:
 *  - Typically used as a sidebar or toolbox in a drag-and-drop UI builder or dashboard editor.
 *  - Used in pages where users design or customize UI layouts by dragging components from this panel.
 *
 * Parameters:
 * @param {string} userId - The ID of the currently logged-in user, used to fetch custom components.
 * @param {function} setSelectedEleByCT - Callback to set the selected element from the CollectionTree.
 * @param {function} handleSelectElement - Callback to handle selection of UI elements in the main editor.
 *
 * Returns:
 * @returns {JSX.Element} The rendered Accordian component with categorized UI elements and search functionality.
 */

import { useContext, useEffect, useState } from "react";
import ItemsList from "./ItemsList";
import { UIItems } from "../context/boardContext";
import { LoginContext } from "../context/login-context";
import { useLocation, useParams } from "react-router-dom";
import { useAppContext } from "../context/appContext";
import CollectionTree from "./CollectionTree";
import { useQuery } from "@tanstack/react-query";
import { fetchCustomComponents } from "../api/customComponents";
import { fetchResources } from "../api/resources";
import "../dashboard.css";
import "../resources.css";

export interface CustomComponent {
  id: number;
  userId: string;
  componentName: string;
  ComponentData: UIItems;
}

const Accordian = ({
  userId,
  selectedAppName,
  setSelectedEleByCT,
  handleSelectElement,
}: any) => {
  const { appId } = useParams();
  const { setUser, setIsLoggedIn } = useContext(LoginContext);
  // const { appName: selectedApp } = useAppContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [openItemId, setOpenItemId] = useState<number | null>(null);
  const location = useLocation();

  // Decode token and set user
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("access_token");

    if (token) {
      try {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const decodedPayload = JSON.parse(atob(base64));
        const userId = decodedPayload.sub;

        setUser({ accessToken: token, userId });
        setIsLoggedIn(true);
      } catch (error) {
        console.error("Failed to decode token:", error);
      }
    }
  }, [location, setUser, setIsLoggedIn]);

  // Clear search query when search bar is hidden
  useEffect(() => {
    if (!isSearchVisible) {
      setSearchQuery("");
    }
  }, [isSearchVisible]);

  // React Query: fetch custom components
  const {
    data: customComponents = [],
    isLoading: isLoadingComponents,
    error: componentsError,
  } = useQuery({
    queryKey: ["customComponents", userId],
    queryFn: () => fetchCustomComponents(userId),
    enabled: !!userId,
  });

  // React Query: fetch resources
  const {
    data: allResources = [],
    isLoading: isLoadingResources,
    error: resourcesError,
  } = useQuery({
    queryKey: ["resources", appId],
    queryFn: () => fetchResources(appId),
    enabled: !!appId,
  });

  // Define all UI element categories
  const AccordianToUIElementMapping = [
    {
      id: 1,
      header: "Input",
      iconClass: "fa fa-pencil-square",
      elementTypes: ["input", "inputCalendar"],
    },
    {
      id: 2,
      header: "Text",
      iconClass: "fa fa-font",
      elementTypes: ["addText"],
    },
    {
      id: 3,
      header: "Navbar",
      iconClass: "fa fa-window-minimize",
      elementTypes: ["navbar"],
    },
    {
      id: 4,
      header: "Button",
      iconClass: "fa fa-eercast",
      elementTypes: ["button", "dropdown"],
    },
    {
      id: 5,
      header: "Container",
      iconClass: "fa fa-square-o",
      elementTypes: ["flex", "container"],
    },
    {
      id: 6,
      header: "Form",
      iconClass: "fa fa-list-alt",
      elementTypes: [
        "flex",
        "container",
        "button",
        "input",
        "checkbox",
        "radio",
        "range",
        "inputGroup",
        "floatingLabels",
      ],
    },
    // {
    //   id: 7,
    //   header: "Login",
    //   iconClass: "fa fa-drivers-license-o",
    //   elementTypes: ["loginTemplate1", "loginTemplate2"],
    // },
    {
      id: 8,
      header: "ListingContainer",
      iconClass: "fa fa-square",
      elementTypes: ["listingContainer"],
    },
    {
      id: 9,
      header: "CustomComponents",
      iconClass: "fa fa-linode",
      elementTypes: customComponents.map(
        (component: any) => component.componentName
      ),
      elementIds: customComponents.map((component: any) => component.id),
    },
    {
      id: 10,
      header: "Table",
      iconClass: "fa fa-linode",
      elementTypes: ["table"],
    },
    // {
    //   id: 11,
    //   header: "Resources",
    //   iconClass: "fa fa-linode",
    //   elementTypes: allResources.map((resource: any) => resource.resourceName),
    // },
    {
      id: 11,
      header: "Resources",
      iconClass: "fa fa-database",
      elementTypes: allResources.map((resource: any) => ({
        resourceName: resource.resourceName,
        operations: ["Create", "Read"],
      })),
    },
    { id: 12, header: "Link", iconClass: "fa fa-link", elementTypes: ["link"] },
    {
      id: 13,
      header: "Card",
      iconClass: "fa fa-linode",
      elementTypes: ["card"],
    },
    {
      id: 14,
      header: "Toggle",
      iconClass: "fa fa-toggle-on",
      elementTypes: ["switches"],
    },
    {
      id: 15,
      header: "FileUpload",
      iconClass: "fa fa-upload",
      elementTypes: ["fileupload"],
    },
    {
      id: 16,
      header: "Tabs",
      iconClass: "fa fa-tablet",
      elementTypes: ["tabs"],
    },
    {
      id: 17,
      header: "Image",
      iconClass: "fa fa-image",
      elementTypes: ["image"],
    },
    {
      id: 18,
      header: "Menu",
      iconClass: "fa fa-navicon",
      elementTypes: ["menu"],
    },
    {
      id: 19,
      header: "CustomView",
      iconClass: "fa fa-navicon",
      elementTypes: ["collection"],
    },
    {
      id: 20,
      header: "Content",
      iconClass: "fa fa-navicon",
      elementTypes: ["audio", "video", "progressBar"],
    },
  ];

  const filteredElements = AccordianToUIElementMapping.filter((element) =>
    element.header.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleItemClick = (id: number) => {
    setOpenItemId(openItemId === id ? null : id);
  };

  return (
    <aside
      className="panel"
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        width: "100%",
        overflow: "hidden",
        alignSelf: "flex-start",
        borderRadius: 0, // Since it's a sidebar, maybe 0 radius or keep it? The original had app-create-card which has radius.
        border: "none", // app-create-card has border. panel has border.
        background: "var(--dash-surface)", // Override panel gradient if needed, or keep it.
      }}
    >
      <div className="d-flex flex-column h-100">
        <div className="d-flex flex-column gap-1 p-0" style={{ flexBasis: "auto", maxHeight: "50vh" }} >
          {/* Header */}
          <div className="panel-header rounded" style={{ background: "#2e3361a6" }} >
            <div className="panel-header-content">
              <i className="fa fa-cubes panel-header-icon" />
              <h3
                className="dropdown-toggle"
                role="button"
                data-bs-toggle="collapse"
                data-bs-target="#componentsCollapse"
              >
                Components
              </h3>
            </div>
            <div className="actions">
              <button className="icon-btn subtle" onClick={() => setIsSearchVisible(!isSearchVisible)}>
                <i className="fa fa-search"></i>
              </button>
            </div>
          </div>
          <div
            className="collapse show overflow-auto hide-scrollbar"
            id="componentsCollapse"
            style={{ maxHeight: "40vh", overflowY: "auto", padding: "0.5rem" }}
          >
            {/* Search */}
            {isSearchVisible && (
              <div className="mb-3 px-2">
                <input
                  type="text"
                  className="modern-input"
                  placeholder="Filter components..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            )}

            {/* Component Groups */}
            <div className="list modern-list">
              {filteredElements.length > 0 ? (
                filteredElements.map((element) => (
                  <ItemsList
                    key={element.id}
                    element={element}
                    isOpen={openItemId === element.id}
                    onClick={() => handleItemClick(element.id)}
                  />
                ))
              ) : (
                <p className="text-center text-muted">No components found</p>
              )}
            </div>
          </div>
        </div>

        <div className="panel-divider"></div>

        <div className="d-flex flex-column gap-1 p-0 " style={{ flex: 1, overflowY: 'auto' }}>
          <div className="panel-header" style={{ background: "#2e3361a6" }}>
            <div className="panel-header-content p-1">
              <i className="fa fa-sitemap panel-header-icon" />
              <h3
                className="dropdown-toggle"
                data-bs-toggle="collapse"
                data-bs-target="#collectionCollapse"
                role="button"
              >
                Page Structure
              </h3>
            </div>
          </div>
          <div className="collapse show m-2 mt-1" id="collectionCollapse" style={{ overflow: "auto" }}>
            <CollectionTree
              handleSelectElement={handleSelectElement}
              setSelectedEleByCT={setSelectedEleByCT}
            />
          </div>
        </div>
        <div className="d-flex flex-column gap-1 p-2 ">
          {/* <PageTree
            handleSelectElement={handleSelectElement}
            setSelectedEleByCT={setSelectedEleByCT}
          /> */}
          {/* <Tree/> */}
        </div>
      </div>
    </aside>
  );
};

export default Accordian;
