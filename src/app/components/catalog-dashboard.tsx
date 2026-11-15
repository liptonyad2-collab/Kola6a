"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

type Direction = { id: string; code: string; name: string };
type Category = { id: string; direction_id: string; name: string };
type Service = { id: string; category_id: string; name: string; unit: string; active: boolean };
type Profile = { display_name: string; role: string };

const units: Record<string, string> = { hour: "час", day: "сутки", piece: "шт.", booking: "заказ" };
const icons: Record<string, string> = { houses: "🏠", beach: "🏖️", recreation: "🚤", extras: "🛍️", events: "🎪" };

export default function CatalogDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [directions, setDirections] = useState<Direction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "unauthorized" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  const load = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData.user) {
        router.replace("/login");
        return;
      }
      setUser(authData.user);
      const profileResult = await supabase.from("profiles").select("display_name,role").eq("id", authData.user.id).maybeSingle();
      if (profileResult.error) throw profileResult.error;
      if (!profileResult.data) { setStatus("unauthorized"); return; }
      setProfile(profileResult.data);
      const [d, c, s] = await Promise.all([
        supabase.from("directions").select("id,code,name").order("name"),
        supabase.from("categories").select("id,direction_id,name").order("name"),
        supabase.from("services").select("id,category_id,name,unit,active").order("name")
      ]);
      if (d.error || c.error || s.error) throw (d.error || c.error || s.error);
      setDirections(d.data ?? []);
      setCategories(c.data ?? []);
      setServices(s.data ?? []);
      setStatus("ready");
    } catch (cause) {
      setErrorMessage(cause instanceof Error ? cause.message : "Не удалось загрузить каталог");
      setStatus("error");
    }
  }, [router]);

  useEffect(() => { void load(); }, [load]);

  async function logout() {
    try { await createClient().auth.signOut(); } finally { router.replace("/login"); router.refresh(); }
  }

  if (status === "loading") return <main className="waiting">Загружаем защищённый каталог CRM...</main>;
  if (status === "unauthorized") return (
    <main className="waiting"><h1>Ожидается назначение роли</h1>
      <p>Аккаунт {user?.email} авторизован, но ещё не добавлен в таблицу profiles.</p>
      <p>Владелец проекта должен назначить роль через безопасную административную процедуру.</p>
      <button type="button" onClick={logout}>Выйти</button></main>
  );
  if (status === "error") return (
    <main className="waiting"><h1>Ошибка подключения</h1><p>{errorMessage}</p><button onClick={() => { setStatus("loading"); void load(); }}>Повторить</button></main>
  );

  return (
    <main className="shell">
      <aside className="sidebar">
        <div className="brand"><span className="brandMark">K</span><span>Kola6a <small>CRM</small></span></div>
        <nav aria-label="Основное меню">
          <a className="active" href="/">▦ &nbsp; Каталог услуг</a>
          <span>▤ &nbsp; Продажи <em>позже</em></span>
          <span>▣ &nbsp; Бронирования <em>позже</em></span>
          <span>◫ &nbsp; Финансы <em>позже</em></span>
          <span>◷ &nbsp; Отчёты <em>позже</em></span>
        </nav>
        <div className="sideNote">{profile?.display_name || user?.email} · {profile?.role}
          <button type="button" className="logout" onClick={logout}>Выйти</button>
        </div>
      </aside>
      <div className="content">
        <header>
          <div><p className="eyebrow">Управление бизнесом</p><h1>Каталог услуг</h1>
          <p className="muted">Данные загружены из базы Supabase. Редактирование подключим следующим этапом.</p></div>
          <div className="pill">Подключено к базе · чтение</div>
        </header>
        <section className="stats" aria-label="Сводка каталога">
          <div><span>Направлений</span><strong>{directions.length}</strong></div>
          <div><span>Категорий</span><strong>{categories.length}</strong></div>
          <div><span>Позиций каталога</span><strong>{services.length}</strong></div>
        </section>
        <section className="directions" aria-label="Направления бизнеса">
          {directions.map(direction => {
            const cats = categories.filter(c => c.direction_id === direction.id);
            return (
              <article className="card" key={direction.id}>
                <div className="cardTitle"><span className="emoji">{icons[direction.code] || "📁"}</span>
                  <div><h2>{direction.name}</h2><p className="muted">{cats.length} категории</p></div>
                </div>
                {cats.map(category => (
                  <div className="category" key={category.id}>
                    <h3>{category.name}</h3>
                    <ul>{services.filter(s => s.category_id === category.id).map(service => (
                      <li key={service.id}><span>{service.name}</span>
                        <small>{units[service.unit] || service.unit} · {service.active ? "активна" : "черновик"}</small>
                      </li>
                    ))}</ul>
                  </div>
                ))}
              </article>
            );
          })}
        </section>
        <footer>Сейчас доступен только просмотр каталога. Продажи и финансовые операции ещё не активированы.</footer>
      </div>
    </main>
  );
}
