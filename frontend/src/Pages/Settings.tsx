import { useState } from "react";
import { useTheme, useThemeAction } from "../store";
import {
  UserRound,
  Palette,
  Bell,
  Shield,
  Ban,
  UserCog,
  CircleHelp,
  Camera,
  Moon,
  Sun,
  Check,
  Unlock,
  Trash2,
  LogOut,
  ChevronRight,
  Mail,
  AtSign,
  LockKeyhole,
} from "lucide-react";

type SettingsSection =
  | "profile"
  | "appearance"
  | "notifications"
  | "privacy"
  | "blocked"
  | "account"
  | "help";

interface MenuItems {
  id: SettingsSection;
  label: string;
  icon: React.ReactNode;
}

type BlockedUser = {
  id: number;
  name: string;
  username: string;
  avatar: string;
};

type Colors = "blue" | "pruple" | "pink" | "green" | "orange" | "cyan";

const blockedUsers: BlockedUser[] = [
  {
    id: 1,
    name: "Michael Brown",
    username: "@michael.brown",
    avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=MichaelBrown",
  },
  {
    id: 2,
    name: "Sophia Martinez",
    username: "@sophia.martinez",
    avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=SophiaMartinez",
  },
  {
    id: 3,
    name: "Daniel Lee",
    username: "@daniel.lee",
    avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=DanielLee",
  },
];

const Settings = () => {
  const [activeSection, setActiveSection] =
    useState<SettingsSection>("profile");

  const [name, setName] = useState("John Doe");
  const [username, setUsername] = useState("@johndoe");
  const [email, setEmail] = useState("john.doe@example.com");
  const [about, setAbout] = useState(
    "Product designer passionate about creating meaningful experiences and building cool things.",
  );
  const [color, setColor] = useState<Colors>("blue");

  const theme = useTheme();
  const { setTheme } = useThemeAction();

  const [notifications, setNotifications] = useState(true);

  const [blocked, setBlocked] = useState<BlockedUser[]>(blockedUsers);

  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  const menuItems: MenuItems[] = [
    {
      id: "profile",
      label: "Profile",
      icon: <UserRound size={20} />,
    },
    {
      id: "appearance",
      label: "Appearance",
      icon: <Palette size={20} />,
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: <Bell size={20} />,
    },
    {
      id: "privacy",
      label: "Privacy & Security",
      icon: <Shield size={20} />,
    },
    {
      id: "blocked",
      label: "Blocked Users",
      icon: <Ban size={20} />,
    },
    {
      id: "account",
      label: "Account",
      icon: <UserCog size={20} />,
    },
    {
      id: "help",
      label: "Help & Support",
      icon: <CircleHelp size={20} />,
    },
  ];

  const unblockUser = (id: number) => {
    setBlocked((users) => users.filter((user) => user.id !== id));
  };

  const saveProfile = () => {
    console.log({
      name,
      username,
      email,
      about,
    });
  };

  return (
    <div
      className={`settings-page ${
        theme === "light" ? "settings-light-mode" : ""
      }`}
    >
      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="settings-page-header">
        <div>
          <h1>Settings</h1>

          <p>Manage your account, preferences and security</p>
        </div>
      </header>

      {/* =====================================================
          SETTINGS LAYOUT
      ====================================================== */}

      <div className="settings-layout">
        {/* ===================================================
            SETTINGS MENU
        ==================================================== */}

        <aside className="settings-menu">
          <div className="settings-menu-title">SETTINGS</div>

          <div className="settings-menu-items">
            {menuItems.map((item) => (
              <button
                key={item.id}
                className={
                  activeSection === item.id
                    ? "settings-menu-item active"
                    : "settings-menu-item"
                }
                onClick={() => setActiveSection(item.id)}
              >
                {item.icon}

                <span>{item.label}</span>
              </button>
            ))}
          </div>

          {/* Logout */}

          <button
            className="logout-button"
            onClick={() => console.log("Logout")}
          >
            <LogOut size={20} />

            <span>Log Out</span>
          </button>
        </aside>

        {/* ===================================================
            SETTINGS CONTENT
        ==================================================== */}

        <main className="settings-content">
          {/* =================================================
              PROFILE
          ================================================== */}

          {activeSection === "profile" && (
            <section className="settings-section">
              <div className="settings-card profile-settings-card">
                <div className="settings-card-header">
                  <div>
                    <h2>Profile Information</h2>

                    <p>Update your personal information</p>
                  </div>
                </div>

                <div className="profile-edit-area">
                  {/* Avatar */}

                  <div className="settings-profile-picture">
                    <div className="settings-avatar-wrapper">
                      <img
                        src="https://api.dicebear.com/9.x/adventurer/svg?seed=User"
                        alt="Your profile"
                      />

                      <button
                        className="change-picture-button"
                        title="Change profile picture"
                      >
                        <Camera size={17} />
                      </button>
                    </div>

                    <button className="change-picture-text">
                      Change profile picture
                    </button>
                  </div>

                  {/* Fields */}

                  <div className="profile-fields">
                    <div className="settings-input-group">
                      <label>Full Name</label>

                      <div className="settings-input-wrapper">
                        <UserRound size={18} />

                        <input
                          type="text"
                          value={name}
                          onChange={(event) => setName(event.target.value)}
                        />
                      </div>
                    </div>

                    <div className="settings-input-group">
                      <label>Username</label>

                      <div className="settings-input-wrapper">
                        <AtSign size={18} />

                        <input
                          type="text"
                          value={username}
                          onChange={(event) => setUsername(event.target.value)}
                        />
                      </div>
                    </div>

                    <div className="settings-input-group">
                      <label>Email</label>

                      <div className="settings-input-wrapper">
                        <Mail size={18} />

                        <input
                          type="email"
                          value={email}
                          onChange={(event) => setEmail(event.target.value)}
                        />
                      </div>
                    </div>

                    <div className="settings-input-group full-width">
                      <label>About You</label>

                      <textarea
                        value={about}
                        onChange={(event) => setAbout(event.target.value)}
                        rows={4}
                        style={{ resize: "none" }}
                      />
                    </div>
                  </div>
                </div>

                <div className="settings-card-footer">
                  <button
                    className="primary-settings-button"
                    onClick={saveProfile}
                  >
                    Save Changes
                  </button>
                </div>
              </div>

              {/* Password */}

              <div className="settings-card">
                <div className="settings-card-header">
                  <div>
                    <h2>Password</h2>

                    <p>Keep your account secure with a strong password.</p>
                  </div>

                  <LockKeyhole size={22} />
                </div>

                <button
                  className="secondary-settings-button"
                  onClick={() => console.log("Change password")}
                >
                  Change Password
                </button>
              </div>
            </section>
          )}

          {/* =================================================
              APPEARANCE
          ================================================== */}

          {activeSection === "appearance" && (
            <section className="settings-section">
              <div className="settings-card">
                <div className="settings-card-header">
                  <div>
                    <h2>Appearance</h2>

                    <p>Customize how ChatFlow looks.</p>
                  </div>
                </div>

                <div className="appearance-group">
                  <h3>Theme</h3>

                  <p className="appearance-description">
                    Choose your preferred theme for the application.
                  </p>

                  <div className="theme-options">
                    <button
                      className={
                        theme === "dark"
                          ? "theme-option active"
                          : "theme-option"
                      }
                      onClick={() => setTheme("dark")}
                    >
                      <Moon size={22} />

                      <span>Dark</span>

                      {theme === "dark" && <Check size={17} />}
                    </button>

                    <button
                      className={
                        theme === "light"
                          ? "theme-option active"
                          : "theme-option"
                      }
                      onClick={() => setTheme("light")}
                    >
                      <Sun size={22} />

                      <span>Light</span>

                      {theme === "light" && <Check size={17} />}
                    </button>
                  </div>
                </div>

                <div className="appearance-group">
                  <h3>Accent Color</h3>

                  <p className="appearance-description">
                    Choose your favorite accent color.
                  </p>

                  <div className="accent-colors">
                    <button className="accent-color active" aria-label="Blue">
                      <span />
                      <Check size={15} />
                    </button>

                    <button className="accent-color purple" aria-label="Purple">
                      <span />
                    </button>

                    <button className="accent-color pink" aria-label="Pink">
                      <span />
                    </button>

                    <button className="accent-color green" aria-label="Green">
                      <span />
                    </button>

                    <button className="accent-color orange" aria-label="Orange">
                      <span />
                    </button>

                    <button className="accent-color cyan" aria-label="Cyan">
                      <span />
                    </button>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* =================================================
              NOTIFICATIONS
          ================================================== */}

          {activeSection === "notifications" && (
            <section className="settings-section">
              <div className="settings-card">
                <div className="settings-card-header">
                  <div>
                    <h2>Notifications</h2>

                    <p>Choose how you want to be notified.</p>
                  </div>
                </div>

                <SettingToggle
                  icon={<Bell size={21} />}
                  title="Message Notifications"
                  description="Receive notifications when someone sends you a message."
                  checked={notifications}
                  onChange={() => setNotifications(!notifications)}
                />

                <SettingToggle
                  icon={<UserRound size={21} />}
                  title="Friend Requests"
                  description="Get notified when someone sends you a friend request."
                  checked={true}
                />

                <SettingToggle
                  icon={<Bell size={21} />}
                  title="Group Notifications"
                  description="Receive notifications from your groups."
                  checked={true}
                />

                <SettingToggle
                  icon={<Bell size={21} />}
                  title="Notification Sounds"
                  description="Play a sound when a new notification arrives."
                  checked={true}
                />
              </div>
            </section>
          )}

          {/* =================================================
              PRIVACY
          ================================================== */}

          {activeSection === "privacy" && (
            <section className="settings-section">
              <div className="settings-card">
                <div className="settings-card-header">
                  <div>
                    <h2>Privacy & Security</h2>

                    <p>Control who can interact with you.</p>
                  </div>
                </div>

                <PrivacyRow
                  title="Online Status"
                  description="Allow friends to see when you're online."
                  checked={true}
                />

                <PrivacyRow
                  title="Read Receipts"
                  description="Let people know when you've read their messages."
                  checked={true}
                />

                <PrivacyRow
                  title="Typing Indicator"
                  description="Show when you're typing a message."
                  checked={true}
                />

                <PrivacyRow
                  title="Friend Requests"
                  description="Allow people to send you friend requests."
                  checked={true}
                />
              </div>

              <div className="settings-card">
                <div className="settings-card-header">
                  <div>
                    <h2>Security</h2>

                    <p>Protect your account.</p>
                  </div>
                </div>

                <button className="settings-action-row">
                  <div>
                    <Shield size={21} />

                    <span>Two-Factor Authentication</span>
                  </div>

                  <ChevronRight size={20} />
                </button>

                <button className="settings-action-row">
                  <div>
                    <LockKeyhole size={21} />

                    <span>Active Sessions</span>
                  </div>

                  <ChevronRight size={20} />
                </button>
              </div>
            </section>
          )}

          {/* =================================================
              BLOCKED USERS
          ================================================== */}

          {activeSection === "blocked" && (
            <section className="settings-section">
              <div className="settings-card">
                <div className="settings-card-header">
                  <div>
                    <h2>Blocked Users</h2>

                    <p>Manage the people you've blocked.</p>
                  </div>

                  <Ban size={22} />
                </div>

                {blocked.length === 0 ? (
                  <div className="empty-blocked">
                    <div>
                      <Ban size={30} />
                    </div>

                    <h3>No blocked users</h3>

                    <p>People you block will appear here.</p>
                  </div>
                ) : (
                  <div className="blocked-users-list">
                    {blocked.map((user) => (
                      <div className="blocked-user" key={user.id}>
                        <img src={user.avatar} alt={user.name} />

                        <div className="blocked-user-info">
                          <strong>{user.name}</strong>

                          <span>{user.username}</span>
                        </div>

                        <button
                          className="unblock-button"
                          onClick={() => unblockUser(user.id)}
                        >
                          <Unlock size={17} />

                          <span>Unblock</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          )}

          {/* =================================================
              ACCOUNT
          ================================================== */}

          {activeSection === "account" && (
            <section className="settings-section">
              <div className="settings-card">
                <div className="settings-card-header">
                  <div>
                    <h2>Account</h2>

                    <p>Manage your account information.</p>
                  </div>
                </div>

                <button className="settings-action-row">
                  <div>
                    <Mail size={21} />

                    <span>Change Email Address</span>
                  </div>

                  <ChevronRight size={20} />
                </button>

                <button className="settings-action-row">
                  <div>
                    <LockKeyhole size={21} />

                    <span>Change Password</span>
                  </div>

                  <ChevronRight size={20} />
                </button>
              </div>

              {/* Danger Zone */}

              <div className="settings-card danger-card">
                <div className="danger-header">
                  <Trash2 size={22} />

                  <div>
                    <h2>Danger Zone</h2>

                    <p>Permanently delete your account and all of your data.</p>
                  </div>
                </div>

                <button
                  className="delete-account-button"
                  onClick={() => setShowDeleteConfirmation(true)}
                >
                  <Trash2 size={19} />

                  <span>Delete Account</span>
                </button>
              </div>
            </section>
          )}

          {/* =================================================
              HELP
          ================================================== */}

          {activeSection === "help" && (
            <section className="settings-section">
              <div className="settings-card">
                <div className="settings-card-header">
                  <div>
                    <h2>Help & Support</h2>

                    <p>Get help with ChatFlow.</p>
                  </div>

                  <CircleHelp size={23} />
                </div>

                <button className="settings-action-row">
                  <div>
                    <CircleHelp size={21} />

                    <span>Help Center</span>
                  </div>

                  <ChevronRight size={20} />
                </button>

                <button className="settings-action-row">
                  <div>
                    <CircleHelp size={21} />

                    <span>Report a Problem</span>
                  </div>

                  <ChevronRight size={20} />
                </button>

                <button className="settings-action-row">
                  <div>
                    <CircleHelp size={21} />

                    <span>Send Feedback</span>
                  </div>

                  <ChevronRight size={20} />
                </button>
              </div>
            </section>
          )}
        </main>
      </div>

      {/* =====================================================
          DELETE CONFIRMATION
      ====================================================== */}

      {showDeleteConfirmation && (
        <div
          className="delete-modal-backdrop"
          onClick={() => setShowDeleteConfirmation(false)}
        >
          <div
            className="delete-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="delete-modal-icon">
              <Trash2 size={28} />
            </div>

            <h2>Delete your account?</h2>

            <p>
              This action is permanent. Your profile, messages, friends and
              other account data will be permanently deleted.
            </p>

            <div className="delete-modal-actions">
              <button
                className="cancel-delete-button"
                onClick={() => setShowDeleteConfirmation(false)}
              >
                Cancel
              </button>

              <button
                className="confirm-delete-button"
                onClick={() => console.log("Delete account")}
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* =========================================================
   REUSABLE TOGGLE
========================================================= */

type SettingToggleProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  checked: boolean;
  onChange?: () => void;
};

const SettingToggle = ({
  icon,
  title,
  description,
  checked,
  onChange,
}: SettingToggleProps) => {
  return (
    <div className="setting-toggle-row">
      <div className="setting-toggle-information">
        <div className="setting-toggle-icon">{icon}</div>

        <div>
          <h3>{title}</h3>

          <p>{description}</p>
        </div>
      </div>

      <label className="settings-switch">
        <input type="checkbox" checked={checked} onChange={onChange} />

        <span className="settings-slider" />
      </label>
    </div>
  );
};

/* =========================================================
   PRIVACY ROW
========================================================= */

type PrivacyRowProps = {
  title: string;
  description: string;
  checked: boolean;
};

const PrivacyRow = ({ title, description, checked }: PrivacyRowProps) => {
  return (
    <div className="setting-toggle-row">
      <div className="setting-toggle-information">
        <div className="setting-toggle-icon">
          <Shield size={21} />
        </div>

        <div>
          <h3>{title}</h3>

          <p>{description}</p>
        </div>
      </div>

      <label className="settings-switch">
        <input type="checkbox" defaultChecked={checked} />

        <span className="settings-slider" />
      </label>
    </div>
  );
};

export default Settings;
