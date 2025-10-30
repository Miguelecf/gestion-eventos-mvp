import React, { useState } from "react";
import { useAuth } from "../AuthProvider";

export default function LoginForm() {
  const { login, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login({ email, password });
      // Redirect to dashboard or protected page here
    } catch (err: any) {
      setError(err.message || "Login failed");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="Email" required />
      <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Password" required />
      <button type="submit" disabled={loading}>Login</button>
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </form>
  );
}