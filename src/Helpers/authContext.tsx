import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { backend_url } from "../backend_route";
import { getWithExpirationCheck } from "./Helpers";

interface AuthContextType {
  isAuthenticated: boolean;
  userType: string | null;
  profileRoute: string;
  user: any | null;
  login: (email: string, password: string, userType: string) => Promise<string>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState<string | null>(null);
  const [profileRoute, setProfileRoute] = useState("");
  const [user, setUser] = useState<any | null>(null);

  const login = async (
    email: string,
    password: string,
    type: string
  ): Promise<string> => {
    let endpoint = "";

    switch (type) {
      case "Participant":
        endpoint = `${backend_url}/participants/login`;
        break;
      case "Service Provider":
        endpoint = `${backend_url}/serviceProviders/login`;
        break;
      case "College":
        endpoint = `${backend_url}/college/login`;
        break;
      case "admin":
        endpoint = `${backend_url}/admin/login`;
        break;
      default:
        throw new Error("Invalid user type");
    }

    const response = await axios.post(
      endpoint,
      { email, password },
      {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      }
    );

    if (response.data.token) {
      const expirationTime = new Date().getTime() + 7 * 24 * 60 * 60 * 1000;

      localStorage.setItem(
        "token",
        JSON.stringify({ value: response.data.token, expirationTime })
      );
      localStorage.setItem(
        "userType",
        JSON.stringify({ value: type, expirationTime })
      );

      let route = "/profile";
      const userData = response.data;

      if (type === "Participant") {
        route = "/profile";
        setUser(userData.participant);
      } else if (type === "Service Provider") {
        route = "/dashboard/service_provider";
        setUser(userData.serviceProvider);
      } else if (type === "admin") {
        route = "/dashboard/admin";
      } else if (type === "College") {
        route = "/dashboard/college";
        setUser(userData.college);
      }

      localStorage.setItem(
        "user",
        JSON.stringify({ value: userData, expirationTime })
      );

      setUserType(type);
      setIsAuthenticated(true);
      setProfileRoute(route);

      return route;
    }

    throw new Error("Login failed");
  };

  const logout = () => {
    localStorage.clear();
    setIsAuthenticated(false);
    setUserType(null);
    setUser(null);
    setProfileRoute("/profile");
  };

  useEffect(() => {
    const token = getWithExpirationCheck("token");
    const type = getWithExpirationCheck("userType");
    const storedUser = getWithExpirationCheck("user");

    if (token && type) {
      setIsAuthenticated(true);
      setUserType(type);
      setUser(storedUser);

      const route =
        type === "Service Provider"
          ? "/dashboard/service_provider"
          : type === "admin"
          ? "/dashboard/admin"
          : "/profile";

      setProfileRoute(route);
    }
  }, []);

  useEffect(() => {
    // console.log("User data changed:", user);
  }, [user]);

  useEffect(() => {
    const data = getWithExpirationCheck("user");
    const userType = localStorage.getItem("userType");

    if (data && userType) {
      setUser(data);
      setUserType(userType);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        userType,
        profileRoute,
        login,
        logout,
        user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
