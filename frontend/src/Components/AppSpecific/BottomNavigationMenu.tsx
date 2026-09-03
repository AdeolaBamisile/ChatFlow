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
      className={({ isActive }) =>
        `mobile-nav-item ${isActive ? "active" : ""}`
      }
      title={title}
    >
      {icon}
      <span>{title}</span>
    </NavLink>
  );
};

export default NavigationMenu;
