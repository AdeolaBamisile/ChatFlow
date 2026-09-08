interface InputBoxProps {
  type: string;
  value: string;
  setValue: React.Dispatch<React.SetStateAction<string>>;
  placeholder: string;
}

const InputBox = ({ type, value, setValue, placeholder }: InputBoxProps) => {
  return (
    <input
      type={type}
      placeholder={`Enter ${placeholder}`}
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
};

export default InputBox;
