import { Shield } from "lucide-react";

interface PrivacyRowProps {
  title: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}
const PrivacyRow = ({
  title,
  description,
  checked,
  onChange,
}: PrivacyRowProps) => (
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
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className="settings-slider" />
    </label>
  </div>
);

export default PrivacyRow;
