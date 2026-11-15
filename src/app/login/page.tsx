"use client";
import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) throw authError;
      router.replace("/");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Не удалось войти");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="loginScreen">
      <div className="loginCard">
        <div className="brand loginBrand"><span className="brandMark">K</span><span>Kola6a CRM</span></div>
        <h1>Вход в CRM</h1>
        <p className="muted">Доступ только для сотрудников с назначенными ролями.</p>
        <form onSubmit={submit} className="loginForm">
          <label htmlFor="email">Электронная почта</label>
          <input id="email" autoComplete="email" type="email" required value={email} onChange={e => setEmail(e.target.value)} />
          <label htmlFor="password">Пароль</label>
          <input id="password" autoComplete="current-password" type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} />
          {error && <p className="loginError" role="alert">{error}</p>}
          <button disabled={busy} type="submit">{busy ? "Проверяем..." : "Войти"}</button>
        </form>
        <p className="loginHint">Учётные записи создаются администратором проекта в Supabase Auth. Публичная регистрация в CRM не предусмотрена.</p>
        <Link href="/" className="returnLink">На главную</Link>
      </div>
    </main>
  );
}
