export const MailIcon = () => (
  <svg viewBox="0 0 24 24" className="input-icon">
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </svg>
);

export const LockIcon = () => (
  <svg viewBox="0 0 24 24" className="input-icon">
    <rect x="4" y="10" width="16" height="11" rx="2" />
    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
  </svg>
);

export const UserIcon = () => (
  <svg viewBox="0 0 24 24" className="input-icon">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c.8-4 3.4-6 8-6s7.2 2 8 6" />
  </svg>
);

export const EyeIcon = ({ hidden }: { hidden: boolean }) => (
  <svg viewBox="0 0 24 24" className="eye-icon">
    {hidden ? (
      <>
        <path d="M3 3l18 18" />
        <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
        <path d="M9.9 4.2A10.7 10.7 0 0 1 12 4c5 0 8.5 4 9.5 8-.4 1.5-1.2 2.8-2.3 4" />
        <path d="M6.2 6.2C4.5 7.4 3.4 9.2 2.5 12c1 4 4.5 8 9.5 8 1 0 2-.2 2.9-.5" />
      </>
    ) : (
      <>
        <path d="M2.5 12S6 5 12 5s9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z" />
        <circle cx="12" cy="12" r="3" />
      </>
    )}
  </svg>
);
