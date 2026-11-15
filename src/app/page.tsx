import { catalog } from "@/lib/catalog";

const totalServices = catalog.reduce(
  (sum, direction) => sum + direction.categories.reduce((n, c) => n + c.services.length, 0), 0
);

export default function HomePage() {
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
        <div className="sideNote">Демонстрационный каркас · v0.1</div>
      </aside>
      <div className="content">
        <header>
          <div><p className="eyebrow">Управление бизнесом</p><h1>Каталог услуг</h1>
          <p className="muted">Первый экран CRM. Состав направлений и услуг пока хранится в коде.</p></div>
          <div className="pill">Прототип · без реальных данных</div>
        </header>
        <section className="stats" aria-label="Сводка каталога">
          <div><span>Направлений</span><strong>{catalog.length}</strong></div>
          <div><span>Категорий</span><strong>{catalog.reduce((n, d) => n + d.categories.length, 0)}</strong></div>
          <div><span>Позиций каталога</span><strong>{totalServices}</strong></div>
        </section>
        <section className="directions" aria-label="Направления бизнеса">
          {catalog.map(direction => (
            <article className="card" key={direction.key}>
              <div className="cardTitle"><span className="emoji">{direction.icon}</span>
                <div><h2>{direction.name}</h2><p className="muted">{direction.categories.length} категории</p></div>
              </div>
              {direction.categories.map(category => (
                <div className="category" key={category.name}>
                  <h3>{category.name}</h3>
                  <ul>{category.services.map(service => (
                    <li key={service.slug}><span>{service.name}</span><small>{{
                      hour:"час",day:"сутки",piece:"шт.",booking:"заказ"
                    }[service.unit]}</small></li>
                  ))}</ul>
                </div>
              ))}
            </article>
          ))}
        </section>
        <footer>Следующий шаг: защищённый вход, база данных и редактирование услуг.</footer>
      </div>
    </main>
  );
}
