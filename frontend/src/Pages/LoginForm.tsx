import { useState, type SyntheticEvent } from "react";

import LoginInfo from "../Components/LoginPageSpecific/LoginInfo";
import { MailIcon, LockIcon, UserIcon, EyeIcon } from "../Components/Icons";
import LoginHeaderButtons from "../Components/LoginPageSpecific/LoginHeaderButtons";
import InputField from "../Components/LoginPageSpecific/InputField/index";
import Spinner from "../Components/Spinner";

export type Mode = "login" | "register";

interface LoginFormProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onCreateAccount: (input: {
    name: string;
    username: string;
    email: string;
    password: string;
  }) => Promise<void>;
  error?: string;
  isLoading?: boolean;
}

const LoginForm = ({
  onLogin,
  onCreateAccount,
  error,
  isLoading,
}: LoginFormProps) => {
  const [mode, setMode] = useState<Mode>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const isLogin = mode === "login";

  const handleSubmit = async (event: SyntheticEvent) => {
    event.preventDefault();
    if (isLogin) await onLogin(email, password);
    else await onCreateAccount({ name, username, email, password });
  };

  return (
    <main className="auth-page">
      {isLoading && (
        <div className="spinner-container">
          <Spinner thickness={5} color="#dbdbdb" />
        </div>
      )}
      <section className="auth-container">
        <div className="branding-panel">
          <div className="branding-content">
            <div className="logo-area">
              <img
                src="https://rholprurkjaqsgdwywid.supabase.co/storage/v1/object/public/testing/projectImagesVideos/logo.png"
                alt="ChatFlow"
                className="chat-logo"
              />
            </div>
            <img
              className="logo-name"
              src="https://rholprurkjaqsgdwywid.supabase.co/storage/v1/object/public/testing/projectImagesVideos/Name.png"
              alt="ChatFlow"
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
        <div className="form-panel">
          <div className="auth-tabs">
            <LoginHeaderButtons
              label="Log in"
              isLogin={isLogin}
              setMode={setMode}
              mode="login"
            />
            <LoginHeaderButtons
              label="Create Account"
              isLogin={!isLogin}
              setMode={setMode}
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
            {error && <p className="auth-error">{error}</p>}

            <form onSubmit={handleSubmit}>
              {!isLogin && (
                <>
                  <InputField
                    label="Full Name"
                    value={name}
                    setValue={setName}
                    type="text"
                    icon={<UserIcon />}
                  />
                  <InputField
                    label="Username"
                    value={username}
                    setValue={setUsername}
                    type="text"
                    icon={<UserIcon />}
                  />
                </>
              )}
              <InputField
                label="Email Address"
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
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <EyeIcon hidden={!showPassword} />
                </button>
              </InputField>
              <button type="submit" className="primary-button">
                {isLogin ? "Log In" : "Create Account"}
                <span>→</span>
              </button>
            </form>

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
