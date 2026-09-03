import { NavLink } from "react-router-dom";

interface NavigationMenuProps {
  to: string;
  title: string;
  icon: React.JSX.Element;
}

const NavigationMenu = ({ to, title, icon }: NavigationMenuProps) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `nav-button ${isActive ? "active" : ""}`}
      title={title}
    >
      {icon}
    </NavLink>
  );
};

export default NavigationMenu;
