export type DirectionKey = "houses" | "beach" | "recreation" | "extras" | "events";

export type ServiceKind = "rental" | "product" | "service";
export type Unit = "hour" | "day" | "piece" | "booking";

export type CatalogService = {
  slug: string;
  name: string;
  kind: ServiceKind;
  unit: Unit;
  requiresBooking?: boolean;
};

export type CatalogCategory = {
  name: string;
  services: CatalogService[];
};

export type CatalogDirection = {
  key: DirectionKey;
  name: string;
  icon: string;
  categories: CatalogCategory[];
};

export const catalog: CatalogDirection[] = [
  {
    key: "houses", name: "Домики", icon: "🏠", categories: [
      { name: "Проживание", services: [
        { slug: "house-stay", name: "Аренда домика", kind: "rental", unit: "day", requiresBooking: true },
        { slug: "extra-bed", name: "Дополнительное место", kind: "service", unit: "day" }
      ] },
      { name: "Дополнительное время", services: [
        { slug: "early-check-in", name: "Ранний заезд", kind: "service", unit: "booking" },
        { slug: "late-check-out", name: "Поздний выезд", kind: "service", unit: "booking" }
      ] }
    ]
  },
  {
    key: "beach", name: "Пляж", icon: "🏖️", categories: [
      { name: "Места отдыха", services: [
        { slug: "sunbed", name: "Шезлонг", kind: "rental", unit: "day" },
        { slug: "bungalow", name: "Бунгало", kind: "rental", unit: "day" },
        { slug: "beach-bed", name: "Кровать", kind: "rental", unit: "day" },
        { slug: "gazebo", name: "Альтанка", kind: "rental", unit: "day" }
      ] },
      { name: "Оборудование", services: [
        { slug: "barbecue", name: "Мангал", kind: "rental", unit: "day" }
      ] }
    ]
  },
  {
    key: "recreation", name: "Развлечения и водный транспорт", icon: "🚤", categories: [
      { name: "Водный транспорт", services: [
        { slug: "pedal-boat", name: "Катамаран", kind: "rental", unit: "hour" },
        { slug: "sup", name: "SUP", kind: "rental", unit: "hour" },
        { slug: "motor-boat", name: "Катер", kind: "rental", unit: "hour" }
      ] },
      { name: "Наземные развлечения", services: [
        { slug: "quad", name: "Квадрик", kind: "rental", unit: "hour" },
        { slug: "kids-quad", name: "Детский квадрик", kind: "rental", unit: "hour" }
      ] },
      { name: "Игры и отдых", services: [
        { slug: "fishing", name: "Рыбалка", kind: "service", unit: "booking" },
        { slug: "trampoline", name: "Батут", kind: "service", unit: "piece" },
        { slug: "air-hockey", name: "Хоккей", kind: "service", unit: "piece" },
        { slug: "arcade", name: "Автоматы", kind: "service", unit: "piece" },
        { slug: "toy-cars", name: "Машинки", kind: "service", unit: "piece" },
        { slug: "wheel", name: "Колесо", kind: "service", unit: "piece" }
      ] }
    ]
  },
  {
    key: "extras", name: "Дополнительные услуги", icon: "🛍️", categories: [
      { name: "Товары", services: [
        { slug: "shop", name: "Магазин (позиции добавляются отдельно)", kind: "product", unit: "piece" }
      ] },
      { name: "Сервисы", services: [
        { slug: "hookah", name: "Кальян", kind: "service", unit: "piece" },
        { slug: "parking", name: "Парковка", kind: "service", unit: "day" },
        { slug: "restroom", name: "Санузел", kind: "service", unit: "piece" }
      ] }
    ]
  },
  {
    key: "events", name: "Аренда территории и мероприятий", icon: "🎪", categories: [
      { name: "Аренда", services: [
        { slug: "territory", name: "Аренда территории", kind: "rental", unit: "day", requiresBooking: true },
        { slug: "venue", name: "Аренда площадки", kind: "rental", unit: "day", requiresBooking: true }
      ] },
      { name: "Мероприятия", services: [
        { slug: "private-event", name: "Частное мероприятие", kind: "service", unit: "booking", requiresBooking: true },
        { slug: "corporate-event", name: "Корпоративное мероприятие", kind: "service", unit: "booking", requiresBooking: true }
      ] }
    ]
  }
];
