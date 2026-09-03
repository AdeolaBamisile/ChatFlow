interface LoginInfoProps {
  icon: string;
  head: string;
  body: string;
}

const LoginInfo = ({ icon, head, body }: LoginInfoProps) => {
  return (
    <div className="feature">
      <div className="feature-icon">{icon}</div>
      <div>
        <h3>{head}</h3>
        <p>{body}</p>
      </div>
    </div>
  );
};

export default LoginInfo;
