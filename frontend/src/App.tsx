import { useState } from "react";
import axios from "axios";
import { Route, Routes, NavLink, useLocation } from "react-router-dom";

import {
  Sun,
  Moon,
  MessageCircle,
  UserPlus,
  Settings as SettingsIcon,
  Send,
} from "lucide-react";

import LoginForm from "./Pages/LoginForm";
import Chats from "./Pages/Chats";
import Discover from "./Pages/Discover";
import Requests from "./Pages/Requests";
import SideNavigationMenu from "./Components/AppSpecific/SideNavigationMenu";
import BottomNavigationMenu from "./Components/AppSpecific/BottomNavigationMenu";
import Settings from "./Pages/Settings";
import { useTheme, useThemeAction } from "./store";

import type { User } from "./types";

const App = () => {
  const theme = useTheme();
  const { setTheme } = useThemeAction();

  const [loggedIn, _setLoggedIn] = useState(true);
  //const [theme, setTheme] = useState<"dark" | "light">(themes);
  const [mobileProfileOpen, setMobileProfileOpen] = useState(false);
  const location = useLocation();

  const createUser = async (newUser: User) => {
    const response = await axios.post("http://localhost:3001/users", newUser);
    console.log(response.data);
  };

  const handleLogin = async (email: string) => {
    const response = await axios.get("http://localhost:3001/users");
    const users: User[] = response.data;
    const user = users.find((user) => user.email === email);
    user ? console.log(user) : console.log("Not found");
  };

  if (!loggedIn) {
    return <LoginForm createUser={createUser} handleLogin={handleLogin} />;
  }

  const isPersonChat = /^\/chat\//.test(location.pathname);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div
      className={`app-shell ${
        theme === "light" ? "light-mode" : ""
      } ${isPersonChat ? "person-chat-open" : ""}`}
    >
      {/* =====================================================
          DESKTOP / LAPTOP NAVIGATION
      ====================================================== */}
      <aside className="navigation-rail">
        <NavLink to="/" className="website-logo" aria-label="Chats">
          <img
            src="https://rholprurkjaqsgdwywid.supabase.co/storage/v1/object/public/testing/projectImagesVideos/logo.png"
            alt="Logo"
            className="brand-logo"
          />
        </NavLink>

        <nav className="main-navigation">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `nav-button ${isActive ? "active" : ""}`
            }
            title="Chats"
          >
            <MessageCircle size={30} />
          </NavLink>
          <SideNavigationMenu
            to="/discover"
            title="Discover"
            icon={<Send size={30} />}
          />
          <SideNavigationMenu
            to="/requests"
            title="Requests"
            icon={<UserPlus size={30} />}
          />
          <SideNavigationMenu
            to="/gemini"
            title="Gemini"
            icon={
              <img
                className="gemini"
                src="https://rholprurkjaqsgdwywid.supabase.co/storage/v1/object/public/testing/projectImagesVideos/Gemini-Icon.png"
                alt="Gemini"
              />
            }
          />
        </nav>

        <nav className="bottom-navigation">
          <button className="nav-button" title="Theme" onClick={toggleTheme}>
            {theme === "dark" ? <Moon size={30} /> : <Sun size={30} />}
          </button>

          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `profile-nav-button ${isActive ? "active-profile" : ""}`
            }
            title="Profile"
          >
            <img
              src="https://api.dicebear.com/9.x/adventurer/svg?seed=User"
              alt="Your profile"
            />
            <span className="online-dot" />
          </NavLink>
        </nav>
      </aside>

      {/* =====================================================
          PAGE CONTENT
      ====================================================== */}
      <main className="page-content">
        <Routes>
          <Route path="/" element={<Chats />} />
          <Route path="/chat/:chatId" element={<Chats />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/requests" element={<Requests />} />
          <Route path="/gemini" element={<h1>Gemini</h1>} />
          <Route path="/settings" element={<Settings />} />
          <Route
            path="*"
            element={<h1 className="page-not-found">Page Not Found</h1>}
          />
        </Routes>
      </main>

      {/* =====================================================
          MOBILE BOTTOM NAVIGATION
      ====================================================== */}
      <nav className="mobile-bottom-navigation">
        <BottomNavigationMenu to="/" title="Chats" icon={<MessageCircle />} />
        <BottomNavigationMenu to="/discover" title="Discover" icon={<Send />} />
        <BottomNavigationMenu
          to="/requests"
          title="Requests"
          icon={<UserPlus />}
        />
        <BottomNavigationMenu
          to="/gemini"
          title="Gemini"
          icon={
            <img
              className="gemini "
              src="https://rholprurkjaqsgdwywid.supabase.co/storage/v1/object/public/testing/projectImagesVideos/Gemini-Icon.png"
              alt="Gemini"
            />
          }
        />

        <button
          className={`mobile-profile-button ${
            mobileProfileOpen ? "active" : ""
          }`}
          title="Profile"
          onClick={() => setMobileProfileOpen((open) => !open)}
        >
          <span className="mobile-profile-avatar">
            <img
              src="https://api.dicebear.com/9.x/adventurer/svg?seed=User"
              alt="Your profile"
            />
            <span className="online-dot" />
          </span>
          <span>Profile</span>
        </button>

        {mobileProfileOpen && !isPersonChat && (
          <div className="mobile-profile-menu">
            <button onClick={toggleTheme}>
              {theme === "dark" ? <Moon /> : <Sun />}
              <span>Change theme</span>
            </button>

            <NavLink to="/settings" onClick={() => setMobileProfileOpen(false)}>
              <SettingsIcon />
              <span>Settings</span>
            </NavLink>
          </div>
        )}
      </nav>
    </div>
  );
};

export default App;
