// import React, { useState, useEffect, useRef } from "react";
// import { Link, useLocation, useNavigate } from "react-router-dom";
// import axios from "axios";
// import { backend_url } from "../backend_route";


// interface HeaderProps {
//   isScrolled: boolean;
//   activeNav: string;
//   setActiveNav: (nav: string) => void;
// }

// const Header: React.FC<HeaderProps> = ({
//   isScrolled,
//   activeNav,
//   setActiveNav,
// }) => {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const [isMenuOpen, setIsMenuOpen] = useState(false);
//   const [navbarTextColor, setNavbarTextColor] = useState("text-white");
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [profileRoute, setProfileRoute] = useState("/profile");
//   const [profileMenuOpen, setProfileMenuOpen] = useState(false);
//   const profileMenuRef = useRef<HTMLDivElement>(null);

//   function handleLogout() {
//     localStorage.clear();
//     setIsAuthenticated(false);
//     setActiveNav("projects");
//     navigate("/login");
//   }

//   useEffect(() => {
//     setNavbarTextColor(
//       isScrolled || location.pathname !== "/"
//         ? "text-black hover:text-green-600"
//         : "text-white hover:text-green-200"
//     );
//   }, [isScrolled, location.pathname]);

//   const getWithExpirationCheck = (key: string) => {
//     const dataString = localStorage.getItem(key);
//     if (!dataString) return null;

//     const data = JSON.parse(dataString);
//     const currentTime = new Date().getTime();

//     if (currentTime > data.expirationTime) {
//       localStorage.removeItem(key);
//       return null;
//     }

//     return data.value;
//   };

//   const token = getWithExpirationCheck("token");
//   const userType = getWithExpirationCheck("userType");

//   useEffect(() => {
//     const checkAuth = async () => {
//       try {
//         if (!token || !userType) {
//           setIsAuthenticated(false);
//           return;
//         }

//         let endpoint = "";
//         let profilePath = "/profile";

//         if (userType === "Participant") {
//           endpoint = `${backend_url}/participants/authenticate`;
//           profilePath = "/profile";
//         } else if (userType === "Service Provider") {
//           endpoint = `${backend_url}/serviceProviders/authenticate`;
//           profilePath = "/dashboard/service_provider";
//         } else if (userType === "admin") {
//           endpoint = `${backend_url}/admin/authenticate`;
//           profilePath = "/admin";
//         }

//         setProfileRoute(profilePath);

//         const response = await axios.get(endpoint, {
//           headers: { Authorization: `Bearer ${token}` },
//         });

//         setIsAuthenticated(response.status === 200);
//       } catch {
//         setIsAuthenticated(false);
//       }
//     };

//     checkAuth();
//   }, [token, userType]);

//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (
//         profileMenuRef.current &&
//         !profileMenuRef.current.contains(event.target as Node)
//       ) {
//         setProfileMenuOpen(false);
//       }
//     };

//     if (profileMenuOpen) {
//       document.addEventListener("mousedown", handleClickOutside);
//     }

//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, [profileMenuOpen]);

//   return (
//     <nav
//       className={`fixed w-full z-50 transition-all duration-300 ${
//         isScrolled ? "bg-white shadow-lg" : "bg-transparent"
//       }`}
//     >
//       <div className="container mx-auto px-6">
//         <div className="flex items-center justify-between h-16 sm:h-20">
//           <div className="flex items-center">
//             <Link
//               to="/"
//               className={`text-xl sm:text-2xl font-bold ${
//                 isScrolled ? "text-green-700" : "text-gray-600"
//               }`}
//             >
//               <i className="fas fa-globe-americas mr-2"></i>
//               CarbonFix
//             </Link>
//           </div>

//           <div className="hidden md:flex items-center space-x-6">
//             <Link
//               to="/"
//               onClick={() => setActiveNav("home")}
//               className={`text-sm font-semibold transition-all duration-300 relative ${navbarTextColor} 
//                 ${
//                   activeNav === "home"
//                     ? 'after:content-[""] after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-0.5 after:bg-current'
//                     : ""
//                 }`}
//             >
//               Home
//             </Link>

//             {userType !== "Service Provider" && (
//               <Link
//                 to="/project"
//                 onClick={() => setActiveNav("projects")}
//                 className={`text-sm font-semibold transition-all duration-300 relative ${navbarTextColor} 
//                   ${
//                     activeNav === "projects"
//                       ? 'after:content-[""] after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-0.5 after:bg-current'
//                       : ""
//                   }`}
//               >
//                 Projects
//               </Link>
//             )}

//             {isAuthenticated ? (
//               <div className="relative" ref={profileMenuRef}>
//                 <button
//                   onClick={() => setProfileMenuOpen(!profileMenuOpen)}
//                   className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center hover:shadow-lg transition duration-200"
//                 >
//                   <i className="fas fa-user"></i>
//                 </button>

//                 {profileMenuOpen && (
//                   <div className="absolute right-0 mt-2 w-40 bg-white rounded shadow-lg z-50">
//                     <Link
//                       to={profileRoute}
//                       onClick={() => setProfileMenuOpen(false)}
//                       className="block px-4 py-2 text-sm text-gray-700 hover:bg-green-100"
//                     >
//                       {userType === "Service Provider"
//                         ? "Dashboard"
//                         : "Profile"}
//                     </Link>
//                     <button
//                       onClick={() => {
//                         handleLogout();
//                         setProfileMenuOpen(false);
//                       }}
//                       className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-100"
//                     >
//                       Logout
//                     </button>
//                   </div>
//                 )}
//               </div>
//             ) : (
//               <Link
//                 to="/login"
//                 className="bg-green-500 hover:bg-green-600 text-white px-5 sm:px-6 py-2 text-sm font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg whitespace-nowrap"
//               >
//                 <i className="fas fa-user-plus mr-2"></i>
//                 Join Now
//               </Link>
//             )}
//           </div>

//           <button
//             className={`md:hidden text-2xl z-50 relative ${
//               isScrolled ? "text-gray-800" : "text-white"
//             }`}
//             onClick={() => setIsMenuOpen(!isMenuOpen)}
//           >
//             <i
//               className={`${
//                 location.pathname === "/" ? "" : "text-black"
//               } fas ${isMenuOpen ? "" : "fa-bars"}`}
//             ></i>
//           </button>
//         </div>

//         {isMenuOpen && (
//           <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-end">
//             <div className="w-3/4 max-w-xs h-full bg-white shadow-lg flex flex-col py-8 px-6">
//               <button
//                 className="absolute top-4 right-4 text-gray-600 text-2xl"
//                 onClick={() => setIsMenuOpen(false)}
//               >
//                 <i className="fas fa-times"></i>
//               </button>

//               <nav className="flex flex-col space-y-6">
//                 <Link
//                   to="/"
//                   onClick={() => {
//                     setActiveNav("home");
//                     setIsMenuOpen(false);
//                   }}
//                   className="text-gray-800 text-lg font-medium py-2 px-3 rounded hover:bg-green-100 hover:text-green-600 transition-all"
//                 >
//                   Home
//                 </Link>

//                 {userType !== "Service Provider" && (
//                   <Link
//                     to="/project"
//                     onClick={() => {
//                       setActiveNav("projects");
//                       setIsMenuOpen(false);
//                     }}
//                     className="text-gray-800 text-lg font-medium py-2 px-3 rounded hover:bg-green-100 hover:text-green-600 transition-all"
//                   >
//                     Projects
//                   </Link>
//                 )}

//                 {isAuthenticated ? (
//                   <>
//                     <Link
//                       to={profileRoute}
//                       onClick={() => setIsMenuOpen(false)}
//                       className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 text-lg font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg whitespace-nowrap"
//                     >
//                       <i className="fas fa-user mr-2"></i>
//                        {
//                         userType == "Service Provider" ? "Dashboard" : "Profile"
//                        }
//                     </Link>
//                     <button
//                       onClick={() => {
//                         handleLogout();
//                         setIsMenuOpen(false);
//                       }}
//                       className="text-white  flex bg-red-500 text-lg font-medium py-2 px-3 rounded transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
//                     >
//                       Logout
//                     </button>
//                   </>
//                 ) : (
//                   <Link
//                     to="/login"
//                     onClick={() => setIsMenuOpen(false)}
//                     className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 text-lg font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg whitespace-nowrap"
//                   >
//                     <i className="fas fa-user-plus mr-2"></i>
//                     Join Now
//                   </Link>
//                 )}
//               </nav>
//             </div>
//           </div>
//         )}
//       </div>
//     </nav>
//   );
// };

// export default Header;


import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../Helpers/authContext"; // ✅ AuthContext import

interface HeaderProps {
  isScrolled: boolean;
  activeNav: string;
  setActiveNav: (nav: string) => void;
}

const Header: React.FC<HeaderProps> = ({
  isScrolled,
  activeNav,
  setActiveNav,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [navbarTextColor, setNavbarTextColor] = useState("text-white");
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const {
    isAuthenticated,
    userType,
    profileRoute,
    logout,
  } = useAuth();

  useEffect(() => {
    setNavbarTextColor(
      isScrolled || location.pathname !== "/"
        ? "text-black hover:text-green-600"
        : "text-white hover:text-green-200"
    );
  }, [isScrolled, location.pathname]);

  function handleLogout() {
    logout(); // ✅ use context logout
    setActiveNav("projects");
    navigate("/login");
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setProfileMenuOpen(false);
      }
    };

    if (profileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileMenuOpen]);

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled ? "bg-white shadow-lg" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <div className="flex items-center">
            <Link
              to="/"
              className={`text-xl sm:text-2xl font-bold ${
                isScrolled ? "text-green-700" : "text-gray-600"
              }`}
            >
              <i className="fas fa-globe-americas mr-2"></i>
              CarbonFix
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              onClick={() => setActiveNav("home")}
              className={`text-sm font-semibold transition-all duration-300 relative ${navbarTextColor} 
                ${
                  activeNav === "home"
                    ? 'after:content-[""] after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-0.5 after:bg-current'
                    : ""
                }`}
            >
              Home
            </Link>

            {userType !== "Service Provider" && (
              <Link
                to="/project"
                onClick={() => setActiveNav("projects")}
                className={`text-sm font-semibold transition-all duration-300 relative ${navbarTextColor} 
                  ${
                    activeNav === "projects"
                      ? 'after:content-[""] after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-0.5 after:bg-current'
                      : ""
                  }`}
              >
                Projects
              </Link>
            )}

            {isAuthenticated ? (
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center hover:shadow-lg transition duration-200"
                >
                  <i className="fas fa-user"></i>
                </button>

                {profileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-white rounded shadow-lg z-50">
                    <Link
                      to={profileRoute}
                      onClick={() => setProfileMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-green-100"
                    >
                      {userType === "Service Provider"
                        ? "Dashboard"
                        : "Profile"}
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setProfileMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-green-500 hover:bg-green-600 text-white px-5 sm:px-6 py-2 text-sm font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg whitespace-nowrap"
              >
                <i className="fas fa-user-plus mr-2"></i>
                Join Now
              </Link>
            )}
          </div>

          <button
            className={`md:hidden text-2xl z-50 relative ${
              isScrolled ? "text-gray-800" : "text-white"
            }`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <i
              className={`${
                location.pathname === "/" ? "" : "text-black"
              } fas ${isMenuOpen ? "" : "fa-bars"}`}
            ></i>
          </button>
        </div>

        {isMenuOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-end">
            <div className="w-3/4 max-w-xs h-full bg-white shadow-lg flex flex-col py-8 px-6">
              <button
                className="absolute top-4 right-4 text-gray-600 text-2xl"
                onClick={() => setIsMenuOpen(false)}
              >
                <i className="fas fa-times"></i>
              </button>

              <nav className="flex flex-col space-y-6">
                <Link
                  to="/"
                  onClick={() => {
                    setActiveNav("home");
                    setIsMenuOpen(false);
                  }}
                  className="text-gray-800 text-lg font-medium py-2 px-3 rounded hover:bg-green-100 hover:text-green-600 transition-all"
                >
                  Home
                </Link>

                {userType !== "Service Provider" && (
                  <Link
                    to="/project"
                    onClick={() => {
                      setActiveNav("projects");
                      setIsMenuOpen(false);
                    }}
                    className="text-gray-800 text-lg font-medium py-2 px-3 rounded hover:bg-green-100 hover:text-green-600 transition-all"
                  >
                    Projects
                  </Link>
                )}

                {isAuthenticated ? (
                  <>
                    <Link
                      to={profileRoute}
                      onClick={() => setIsMenuOpen(false)}
                      className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 text-lg font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg whitespace-nowrap"
                    >
                      <i className="fas fa-user mr-2"></i>
                      {userType === "Service Provider" ? "Dashboard" : "Profile"}
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="text-white flex bg-red-500 text-lg font-medium py-2 px-3 rounded transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 text-lg font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg whitespace-nowrap"
                  >
                    <i className="fas fa-user-plus mr-2"></i>
                    Join Now
                  </Link>
                )}
              </nav>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Header;
