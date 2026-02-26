import LoginForm from "../features/auth/LoginForm";

export default function Login({ setMe }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoginForm setMe={setMe} />
    </div>
  );
}
