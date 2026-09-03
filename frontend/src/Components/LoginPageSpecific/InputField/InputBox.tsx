interface InputBoxProps {
  type: string;
  value: string;
  setValue: React.Dispatch<React.SetStateAction<string>>;
}

const InputBox = ({ type, value, setValue }: InputBoxProps) => {
  return (
    <input
      type={type}
      placeholder="Enter your full name"
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
};

export default InputBox;
