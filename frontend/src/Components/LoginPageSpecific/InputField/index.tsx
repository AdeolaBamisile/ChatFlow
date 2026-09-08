import InputBox from "./InputBox";

interface InputFieldProps {
  value: string;
  setValue: React.Dispatch<React.SetStateAction<string>>;
  label: string;
  type: string;
  icon: React.JSX.Element;
  children?: React.JSX.Element;
}

const InputField = ({
  label,
  value,
  setValue,
  type,
  icon,
  children,
}: InputFieldProps) => {
  return (
    <div className="input-group">
      <label>{label}</label>
      <div className="input-wrapper">
        {icon}
        <InputBox
          type={type}
          value={value}
          setValue={setValue}
          placeholder={label}
        />
        {children}
      </div>
    </div>
  );
};

export default InputField;
