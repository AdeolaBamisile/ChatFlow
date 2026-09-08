import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@apollo/client/react";

import {
  Route,
  Routes,
  NavLink,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  Moon,
  Sun,
  MessageCircle,
  UserPlus,
  Send,
  Settings as SettingsIcon,
} from "lucide-react";

import LoginForm from "./Pages/LoginForm";
import Chats from "./Pages/Chats";
import Discover from "./Pages/Discover";
import Requests from "./Pages/Requests";
import Gemini from "./Pages/Gemini";
import Settings from "./Pages/Settings";

import { useAppStore } from "./store";
import {
  CREATE_ACCOUNT_MUTATION,
  LOGIN_MUTATION,
  ME_QUERY,
} from "./services/graphql";

import SideNavigationMenu from "./Components/AppSpecific/SideNavigationMenu";
import BottomNavigationMenu from "./Components/AppSpecific/BottomNavigationMenu";

import type { CurrentUser } from "./types";

const Logo = () => (
  <img
    src="https://rholprurkjaqsgdwywid.supabase.co/storage/v1/object/public/testing/projectImagesVideos/logo.png"
    alt="ChatFlow"
    className="brand-logo"
  />
);

const GeminiIcon = () => (
  <img
    className="gemini"
    src="https://rholprurkjaqsgdwywid.supabase.co/storage/v1/object/public/testing/projectImagesVideos/Gemini-Icon.png"
    alt="Gemini"
  />
);

const App = () => {
  const [mobileProfileOpen, setMobileProfileOpen] = useState(false);
  const [authError, setAuthError] = useState("");

  const { theme, accentColor, currentUser, setTheme, setCurrentUser, reset } =
    useAppStore();

  const location = useLocation();
  const navigate = useNavigate();

  const isPersonChat = /^\/chat\//.test(location.pathname);

  const { data: meData } = useQuery<{ me: CurrentUser }>(ME_QUERY, {
    skip: !localStorage.getItem("loggedInUser") || Boolean(currentUser),
  });

  const [login, { loading: isLoggingIn }] = useMutation<{
    login: { token: string; user: CurrentUser };
  }>(LOGIN_MUTATION);

  const [createAccount, { loading: isCreatingAccount }] = useMutation<{
    createAccount: { token: string; user: CurrentUser };
  }>(CREATE_ACCOUNT_MUTATION);

  const isAuthenticating = isLoggingIn || isCreatingAccount;

  useEffect(() => {
    if (meData?.me) setCurrentUser(meData.me);
  }, [meData, setCurrentUser]);

  useEffect(() => {
    const titles: Record<string, string> = {
      "/": "ChatFlow | Chats",
      "/discover": "ChatFlow | Discover",
      "/requests": "ChatFlow | Requests",
      "/gemini": "ChatFlow | Gemini",
      "/settings": "ChatFlow | Settings",
    };

    document.title = location.pathname.startsWith("/chat/")
      ? "ChatFlow | Chat"
      : (titles[location.pathname] ?? "ChatFlow");
  }, [location.pathname]);

  const authenticate = async (email: string, password: string) => {
    try {
      setAuthError("");
      const result = await login({ variables: { email, password } });
      if (result.data?.login) {
        localStorage.setItem("loggedInUser", result.data.login.token);
        setCurrentUser(result.data.login.user);
      }
    } catch {
      setAuthError("Unable to log in. Check your details and try again.");
    }
  };

  const register = async (input: {
    name: string;
    username: string;
    email: string;
    password: string;
  }) => {
    try {
      setAuthError("");
      const result = await createAccount({ variables: input });
      if (result.data?.createAccount) {
        localStorage.setItem("loggedInUser", result.data.createAccount.token);
        setCurrentUser(result.data.createAccount.user);
      }
    } catch {
      setAuthError("Unable to create your account.");
    }
  };

  const logout = () => {
    localStorage.clear();
    reset();
    navigate("/");
  };

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  if (!localStorage.getItem("loggedInUser") || !currentUser)
    return (
      <LoginForm
        onLogin={authenticate}
        onCreateAccount={register}
        error={authError}
        isLoading={isAuthenticating}
      />
    );

  return (
    <div
      className={`app-shell ${theme === "light" ? "light-mode" : ""} ${isPersonChat ? "person-chat-open" : ""}`}
      data-theme={theme}
      data-accent={accentColor}
    >
      <aside className="navigation-rail">
        <NavLink to="/" className="website-logo" aria-label="Chats">
          <Logo />
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
            icon={<GeminiIcon />}
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
            <img src={currentUser?.avatar} alt="Your profile" />
            <span className="online-dot" />
          </NavLink>
        </nav>
      </aside>

      <main className="page-content">
        <Routes>
          <Route path="/" element={<Chats />} />
          <Route path="/chat/:chatId" element={<Chats />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/requests" element={<Requests />} />
          <Route path="/gemini" element={<Gemini />} />
          <Route path="/settings" element={<Settings />} />
          <Route
            path="*"
            element={<h1 className="page-not-found">Page Not Found</h1>}
          />
        </Routes>
      </main>

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
          icon={<GeminiIcon />}
        />
        <button
          className={`mobile-profile-button ${mobileProfileOpen ? "active" : ""}`}
          title="Profile"
          onClick={() => setMobileProfileOpen((value) => !value)}
        >
          <span className="mobile-profile-avatar">
            <img src={currentUser?.avatar} alt="Your profile" />
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
            <button onClick={logout}>
              <span>Log out</span>
            </button>
          </div>
        )}
      </nav>
    </div>
  );
};
export default App;
