import { useEffect, useRef, useState } from "react";

import { useMutation, useQuery } from "@apollo/client/react";
import { useNavigate } from "react-router-dom";

import PrivacyRow from "../Components/SettingsSpecific/PrivacyRow";

import {
  BLOCKED_USERS_QUERY,
  CHANGE_EMAIL_MUTATION,
  CHANGE_PASSWORD_MUTATION,
  DELETE_ACCOUNT_MUTATION,
  ME_QUERY,
  PREPARE_PROFILE_UPLOAD_MUTATION,
  UNBLOCK_USER_MUTATION,
  UPDATE_PRIVACY_MUTATION,
  UPDATE_PROFILE_MUTATION,
} from "../services/graphql";

import {
  UserRound,
  Palette,
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

import {
  useAppStore,
  useCurrentUser,
  useTheme,
  useAccentColor,
} from "../store";

import type {
  AccentColor,
  BlockedUser,
  CurrentUser,
  ProfileUpdateInput,
  Theme,
} from "../types";

type SettingsSection =
  | "profile"
  | "appearance"
  | "privacy"
  | "blocked"
  | "account"
  | "help";

type PrepareProfileUploadData = {
  prepareProfileUpload: {
    uploadUrl?: string;
    publicUrl: string;
  };
};

type ChangeEmailData = {
  changeEmail: CurrentUser;
};

const accentColors: AccentColor[] = [
  "blue",
  "purple",
  "pink",
  "green",
  "orange",
  "cyan",
];

const Settings = () => {
  const navigate = useNavigate();
  const currentUser = useCurrentUser();

  const [activeSection, setActiveSection] =
    useState<SettingsSection>("profile");
  const [name, setName] = useState(currentUser?.name ?? "");
  const [username, setUsername] = useState(currentUser?.username ?? "");
  const [bio, setBio] = useState(currentUser?.bio ?? "");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newEmail, setNewEmail] = useState(currentUser?.email ?? "");
  const [showDelete, setShowDelete] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const accentColor = useAccentColor();

  const theme = useTheme();

  const {
    setTheme,
    setAccentColor,
    setCurrentUser,
    updateCurrentUser,
    setOnlineStatusVisible,
    setAllowFriendRequests,
    reset,
  } = useAppStore();

  const profileInputRef = useRef<HTMLInputElement>(null);

  const { data: meData } = useQuery<{ me: CurrentUser }>(ME_QUERY, {
    skip: Boolean(currentUser),
  });

  const { data: blockedData, refetch: refetchBlocked } = useQuery<{
    blockedUsers: BlockedUser[];
  }>(BLOCKED_USERS_QUERY, { skip: activeSection !== "blocked" });

  const [updateProfile] = useMutation<{ updateProfile: CurrentUser }>(
    UPDATE_PROFILE_MUTATION,
  );

  const [updatePrivacy] = useMutation(UPDATE_PRIVACY_MUTATION);
  const [unblock] = useMutation(UNBLOCK_USER_MUTATION);
  const [changePassword] = useMutation(CHANGE_PASSWORD_MUTATION);
  const [changeEmail] = useMutation<ChangeEmailData>(CHANGE_EMAIL_MUTATION);
  const [deleteAccount] = useMutation(DELETE_ACCOUNT_MUTATION);
  const [prepareProfileUpload] = useMutation<PrepareProfileUploadData>(
    PREPARE_PROFILE_UPLOAD_MUTATION,
  );

  useEffect(() => {
    if (meData?.me) setCurrentUser(meData.me);
  }, [meData, setCurrentUser]);

  useEffect(() => {
    if (!currentUser) return;
    setName(currentUser.name);
    setUsername(currentUser.username);
    setBio(currentUser.bio);
    setNewEmail(currentUser.email ?? "");
  }, [currentUser]);

  const saveProfile = async () => {
    const input: ProfileUpdateInput = {
      name: name.trim(),
      username: username.trim(),
      bio: bio.trim(),
    };

    const result = await updateProfile({ variables: { input } });

    if (result.data?.updateProfile)
      updateCurrentUser(result.data.updateProfile);

    setStatusMessage("Profile updated successfully.");
  };

  const changeProfilePicture = async (file: File) => {
    if (!file.type.startsWith("image/")) return;

    const { data } = await prepareProfileUpload({
      variables: { fileName: file.name, mimeType: file.type, size: file.size },
    });

    if (!data?.prepareProfileUpload) return;

    if (data.prepareProfileUpload.uploadUrl) {
      const response = await fetch(data.prepareProfileUpload.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!response.ok) throw new Error("Profile picture upload failed.");
    }

    const result = await updateProfile({
      variables: { input: { avatar: data.prepareProfileUpload.publicUrl } },
    });

    if (result.data?.updateProfile)
      updateCurrentUser(result.data.updateProfile);
  };

  const setPrivacy = async (
    onlineStatusVisible: boolean,
    allowFriendRequests: boolean,
  ) => {
    await updatePrivacy({
      variables: { onlineStatusVisible, allowFriendRequests },
    });
    setOnlineStatusVisible(onlineStatusVisible);
    setAllowFriendRequests(allowFriendRequests);
  };

  const menuItems = [
    { id: "profile", label: "Profile", icon: <UserRound size={20} /> },
    { id: "appearance", label: "Appearance", icon: <Palette size={20} /> },
    { id: "privacy", label: "Privacy & Security", icon: <Shield size={20} /> },
    { id: "blocked", label: "Blocked Users", icon: <Ban size={20} /> },
    { id: "account", label: "Account", icon: <UserCog size={20} /> },
    { id: "help", label: "Help & Support", icon: <CircleHelp size={20} /> },
  ] as const;

  const handleDeleteAccount = async () => {
    await deleteAccount();
    reset();
    navigate("/");
  };

  return (
    <div className="settings-page">
      <header className="settings-page-header">
        <div>
          <h1>Settings</h1>
          <p>Manage your account, preferences and security</p>
        </div>
      </header>

      <div className="settings-layout">
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

          <button
            className="logout-button"
            onClick={() => {
              reset();
              navigate("/");
            }}
          >
            <LogOut size={20} />
            <span>Log Out</span>
          </button>
        </aside>

        <main className="settings-content">
          {statusMessage && (
            <div className="settings-status-message">{statusMessage}</div>
          )}

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
                  <div className="settings-profile-picture">
                    <div className="settings-avatar-wrapper">
                      <img
                        src={currentUser?.avatar}
                        alt={currentUser?.name ?? "Your profile"}
                      />
                      <button
                        className="change-picture-button"
                        onClick={() => profileInputRef.current?.click()}
                        title="Change profile picture"
                      >
                        <Camera size={17} />
                      </button>

                      <input
                        ref={profileInputRef}
                        hidden
                        type="file"
                        accept="image/*"
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          if (file) void changeProfilePicture(file);
                          event.target.value = "";
                        }}
                      />
                    </div>

                    <button
                      className="change-picture-text"
                      onClick={() => profileInputRef.current?.click()}
                    >
                      Change profile picture
                    </button>
                  </div>

                  <div className="profile-fields">
                    <div className="settings-input-group">
                      <label>Full Name</label>
                      <div className="settings-input-wrapper">
                        <UserRound size={18} />
                        <input
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
                          value={username}
                          onChange={(event) => setUsername(event.target.value)}
                        />
                      </div>
                    </div>

                    <div className="settings-input-group full-width">
                      <label>About You</label>
                      <textarea
                        value={bio}
                        onChange={(event) => setBio(event.target.value)}
                        rows={4}
                        style={{ resize: "none" }}
                      />
                    </div>
                  </div>
                </div>

                <div className="settings-card-footer">
                  <button
                    className="primary-settings-button"
                    onClick={() => void saveProfile()}
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </section>
          )}

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
                    {(["dark", "light"] as Theme[]).map((value) => (
                      <button
                        key={value}
                        className={
                          theme === value
                            ? "theme-option active"
                            : "theme-option"
                        }
                        onClick={() => setTheme(value)}
                      >
                        {value === "dark" ? (
                          <Moon size={22} />
                        ) : (
                          <Sun size={22} />
                        )}

                        <span>{value[0].toUpperCase() + value.slice(1)}</span>
                        {theme === value && <Check size={17} />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="appearance-group">
                  <h3>Accent Color</h3>
                  <p className="appearance-description">
                    Choose your favorite accent color.
                  </p>
                  <div className="accent-colors">
                    {accentColors.map((value) => (
                      <button
                        key={value}
                        className={`accent-color ${value} ${accentColor === value ? "active" : ""}`}
                        aria-label={value}
                        onClick={() => setAccentColor(value)}
                      >
                        <span />
                        {accentColor === value && <Check size={15} />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}

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
                  checked={currentUser?.onlineStatusVisible ?? true}
                  onChange={(checked) =>
                    void setPrivacy(
                      checked,
                      currentUser?.allowFriendRequests ?? true,
                    )
                  }
                />

                <PrivacyRow
                  title="Friend Requests"
                  description="Allow people to send you friend requests."
                  checked={currentUser?.allowFriendRequests ?? true}
                  onChange={(checked) =>
                    void setPrivacy(
                      currentUser?.onlineStatusVisible ?? true,
                      checked,
                    )
                  }
                />
              </div>
            </section>
          )}

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

                {!blockedData?.blockedUsers.length ? (
                  <div className="empty-blocked">
                    <div>
                      <Ban size={30} />
                    </div>
                    <h3>No blocked users</h3>
                    <p>People you block will appear here.</p>
                  </div>
                ) : (
                  <div className="blocked-users-list">
                    {blockedData.blockedUsers.map((user) => (
                      <div className="blocked-user" key={user.id}>
                        <img src={user.avatar} alt={user.name} />
                        <div className="blocked-user-info">
                          <strong>{user.name}</strong>
                          <span>{user.username}</span>
                        </div>

                        <button
                          className="unblock-button"
                          onClick={async () => {
                            await unblock({ variables: { userId: user.id } });
                            await refetchBlocked();
                          }}
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
          {activeSection === "account" && (
            <section className="settings-section">
              <div className="settings-card">
                <div className="settings-card-header">
                  <div>
                    <h2>Account</h2>
                    <p>Manage your account information.</p>
                  </div>
                </div>

                <div className="account-form">
                  <label>Email Address</label>
                  <div className="settings-input-wrapper">
                    <Mail size={18} />
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(event) => setNewEmail(event.target.value)}
                    />
                  </div>

                  <label>Password</label>
                  <div className="settings-input-wrapper">
                    <LockKeyhole size={18} />
                    <input
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                    />
                  </div>

                  <button
                    className="secondary-settings-button"
                    onClick={async () => {
                      const result = await changeEmail({
                        variables: { email: newEmail.trim(), password },
                      });
                      if (result.data?.changeEmail)
                        updateCurrentUser({
                          email: result.data.changeEmail.email,
                        });
                      setPassword("");
                      setStatusMessage("Email updated successfully.");
                    }}
                  >
                    Change Email Address
                  </button>

                  <div className="account-divider" />

                  <label>Current Password</label>
                  <div className="settings-input-wrapper">
                    <LockKeyhole size={18} />
                    <input
                      type="password"
                      value={password2}
                      onChange={(event) => setPassword2(event.target.value)}
                    />
                  </div>

                  <label>New Password</label>
                  <div className="settings-input-wrapper">
                    <LockKeyhole size={18} />
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                    />
                  </div>

                  <button
                    className="secondary-settings-button"
                    onClick={async () => {
                      await changePassword({
                        variables: { currentPassword: password2, newPassword },
                      });
                      setPassword2("");
                      setNewPassword("");
                      setStatusMessage("Password updated successfully.");
                    }}
                  >
                    Change Password
                  </button>
                </div>
              </div>

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
                  onClick={() => setShowDelete(true)}
                >
                  <Trash2 size={19} />
                  <span>Delete Account</span>
                </button>
              </div>
            </section>
          )}

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
                {["Help Center", "Report a Problem", "Send Feedback"].map(
                  (item) => (
                    <button className="settings-action-row" key={item}>
                      <div>
                        <CircleHelp size={21} />
                        <span>{item}</span>
                      </div>
                      <ChevronRight size={20} />
                    </button>
                  ),
                )}
              </div>
            </section>
          )}
        </main>
      </div>

      {showDelete && (
        <div
          className="delete-modal-backdrop"
          onClick={() => setShowDelete(false)}
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
                onClick={() => setShowDelete(false)}
              >
                Cancel
              </button>
              <button
                className="confirm-delete-button"
                onClick={() => void handleDeleteAccount()}
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

export default Settings;
