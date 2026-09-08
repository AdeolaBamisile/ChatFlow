import type { Mode } from "../../Pages/LoginForm";

interface LoginHeaderButtonsProps {
  isLogin: Boolean;
  setMode: (mode: Mode) => void;
  label: string;
  mode: Mode;
}

const LoginHeaderButtons = ({
  isLogin,
  setMode,
  label,
  mode,
}: LoginHeaderButtonsProps) => {
  return (
    <button className={isLogin ? "active" : ""} onClick={() => setMode(mode)}>
      {label}
    </button>
  );
};

export default LoginHeaderButtons;
