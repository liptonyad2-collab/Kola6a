# Запуск входа в Kola6a CRM

1. Добавить переменные из `.env.example` в локальный `.env.local` или в окружение хостинга.
   В `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` указывать только **publishable** key, никогда не `service_role` или `sb_secret`.
2. В Supabase → Authentication → Users создать пользователя-владельца с его собственным email. Не отправлять пароль в чат или GitHub.
3. После создания аккаунта скопировать его UUID (не пароль). В SQL Editor выполнить **для фактического UUID**:
   ```sql
   insert into public.profiles (id, display_name, role)
   values ('REPLACE_WITH_AUTH_USER_UUID', 'Владелец', 'owner')
   on conflict (id) do update set display_name = excluded.display_name, role = excluded.role;
   ```
   Этот запрос выполняется только администратором базы; не использовать его из браузера.
4. Запустить приложение и войти по email/паролю на `/login`.
5. Доступ к каталогу разрешён исключительно авторизованным аккаунтам с записью в `profiles`. Остальные таблицы закрыты RLS.

**Важно:** CRUD, серверная авторизация и правила внесения продаж ещё не реализованы. Публичную саморегистрацию Auth рекомендуется отключить в Supabase → Authentication → Providers → Email, если она не нужна для сотрудников.

**Замечание:** Отображение UI по профилю — только удобство интерфейса. Граница безопасности — политики RLS на сервере; права на продажи будут внедрены отдельно.
