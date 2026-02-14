import { signInWithGoogle } from "../lib/auth";

export default function Login() {
  return (
    <button onClick={signInWithGoogle}>
      Continue with Google
    </button>
  );
}
