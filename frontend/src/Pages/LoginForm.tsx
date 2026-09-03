import { useState, type SyntheticEvent } from "react";
import LoginInfo from "../Components/LoginPageSpecific/LoginInfo";
import { MailIcon, LockIcon, UserIcon, EyeIcon } from "../Components/Icons";
import type { User } from "../types";
import LoginHeaderButtons from "../Components/LoginPageSpecific/LoginHeaderButtons";
import InputField from "../Components/LoginPageSpecific/InputField/index";

interface LoginFormProps {
  handleLogin: (email: string) => void;
  createUser: (newUser: User) => void;
}

export type Mode = "login" | "register";

const LoginForm = ({ handleLogin, createUser }: LoginFormProps) => {
  const [mode, setMode] = useState<Mode>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const isLogin = mode === "login";

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();

    if (mode === "login") {
      handleLogin(email);
    } else if (mode === "register") {
      const newUser = {
        name,
        email,
        password,
      };
      createUser(newUser);
    }

    setPassword("");
    setEmail("");
    setName("");
  };

  const handleMode = (mode: Mode) => {
    setMode(mode);
  };

  return (
    <main className="auth-page">
      <section className="auth-container">
        {/* LEFT SIDE */}
        <div className="branding-panel">
          <div className="branding-content">
            <div className="logo-area">
              <img
                src="https://rholprurkjaqsgdwywid.supabase.co/storage/v1/object/public/testing/projectImagesVideos/logo.png"
                alt="Logo"
                className="chat-logo"
              />
            </div>

            <img
              className="logo-name"
              src="https://rholprurkjaqsgdwywid.supabase.co/storage/v1/object/public/testing/projectImagesVideos/Name.png"
              alt="Website Name"
            />

            <p className="tagline">Stay connected. Anytime, anywhere.</p>

            <p className="description">
              {isLogin
                ? "Sign in to continue chatting with your friends and colleagues."
                : "Create your account and start chatting with your friends and colleagues."}
            </p>

            <div className="features">
              <LoginInfo
                icon="♙"
                head="Secure"
                body="Your privacy is our priority"
              />
              <LoginInfo
                icon="ϟ"
                head="Fast"
                body="Quick login, seamless chat."
              />
              <LoginInfo
                icon="◎"
                head="Anywhere"
                body="Access your chats from any device."
              />
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="form-panel">
          {/* Tabs */}
          <div className="auth-tabs">
            <LoginHeaderButtons
              label="Log in"
              isLogin={!isLogin}
              setMode={handleMode}
              mode="login"
            />
            <LoginHeaderButtons
              label="Create Account"
              isLogin={isLogin}
              setMode={handleMode}
              mode="register"
            />
          </div>

          <div className="form-content">
            <div>
              <h2>
                {isLogin ? "Log in to your account" : "Create your account"}
              </h2>
              <p className="form-subtitle">
                {isLogin
                  ? "Welcome back! Please enter your details."
                  : "Create an account to start messaging."}
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              {!isLogin && (
                <InputField
                  label="Full Name"
                  value={name}
                  setValue={setName}
                  type="text"
                  icon={<UserIcon />}
                />
              )}
              <InputField
                label="Email address"
                value={email}
                setValue={setEmail}
                type="email"
                icon={<MailIcon />}
              />
              <InputField
                label="Password"
                value={password}
                setValue={setPassword}
                type={showPassword ? "text" : "password"}
                icon={<LockIcon />}
              >
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <EyeIcon hidden={!showPassword} />
                </button>
              </InputField>

              {isLogin ? (
                <div className="form-options">
                  <label className="remember">
                    <input type="checkbox" className="checked" />
                    Remember me
                  </label>

                  <button className="forgot-password">Forgot password?</button>
                </div>
              ) : (
                <label className="terms">
                  <input type="checkbox" className="checked" />
                  <span>
                    I agree to the <button>Terms of Service</button> and{" "}
                    <button>Privacy Policy</button>
                  </span>
                </label>
              )}

              <button type="submit" className="primary-button">
                {isLogin ? "Log In" : "Create Account"}
                <span>→</span>
              </button>
            </form>

            {/* Bottom switch */}
            <p className="switch-text">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <button onClick={() => setMode(isLogin ? "register" : "login")}>
                {isLogin ? "Create one" : "Log in"}
              </button>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default LoginForm;
