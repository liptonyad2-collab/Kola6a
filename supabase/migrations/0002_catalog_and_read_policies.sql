-- Changes already applied to the connected Supabase project on 2026-11-15.
-- For NEW databases only: execute AFTER 0001_initial.sql.
-- Safe to repeat for catalog seeds; do not repeat policy CREATE without guards.

begin;
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;

grant select on public.profiles to authenticated;
grant select on public.directions, public.categories, public.services to authenticated;

create policy "profile_self_read" on public.profiles for select to authenticated
  using (id = (select auth.uid()));
create policy "member_can_read_directions" on public.directions for select to authenticated
  using (exists (select 1 from public.profiles p where p.id = (select auth.uid())));
create policy "member_can_read_categories" on public.categories for select to authenticated
  using (exists (select 1 from public.profiles p where p.id = (select auth.uid())));
create policy "member_can_read_services" on public.services for select to authenticated
  using (exists (select 1 from public.profiles p where p.id = (select auth.uid())));

with initial_categories(direction_code, name) as (
  values
  ('houses','Проживание'),('houses','Дополнительное время'),
  ('beach','Места отдыха'),('beach','Оборудование'),
  ('recreation','Водный транспорт'),('recreation','Наземные развлечения'),
  ('recreation','Игры и отдых'),('extras','Товары'),('extras','Сервисы'),
  ('events','Аренда'),('events','Мероприятия')
)
insert into public.categories(direction_id,name)
select d.id, c.name from initial_categories c join public.directions d on d.code=c.direction_code
on conflict (direction_id,name) do nothing;

with initial_services(direction_code,category_name,code,name,kind,unit,booking) as (
  values
  ('houses','Проживание','house-stay','Аренда домика','rental','day',true),
  ('houses','Проживание','extra-bed','Дополнительное место','service','day',false),
  ('houses','Дополнительное время','early-check-in','Ранний заезд','service','booking',false),
  ('houses','Дополнительное время','late-check-out','Поздний выезд','service','booking',false),
  ('beach','Места отдыха','sunbed','Шезлонг','rental','day',false),
  ('beach','Места отдыха','bungalow','Бунгало','rental','day',false),
  ('beach','Места отдыха','beach-bed','Кровать','rental','day',false),
  ('beach','Места отдыха','gazebo','Альтанка','rental','day',false),
  ('beach','Оборудование','barbecue','Мангал','rental','day',false),
  ('recreation','Водный транспорт','pedal-boat','Катамаран','rental','hour',false),
  ('recreation','Водный транспорт','sup','SUP','rental','hour',false),
  ('recreation','Водный транспорт','motor-boat','Катер','rental','hour',false),
  ('recreation','Наземные развлечения','quad','Квадрик','rental','hour',false),
  ('recreation','Наземные развлечения','kids-quad','Детский квадрик','rental','hour',false),
  ('recreation','Игры и отдых','fishing','Рыбалка','service','booking',false),
  ('recreation','Игры и отдых','trampoline','Батут','service','piece',false),
  ('recreation','Игры и отдых','air-hockey','Хоккей','service','piece',false),
  ('recreation','Игры и отдых','arcade','Автоматы','service','piece',false),
  ('recreation','Игры и отдых','toy-cars','Машинки','service','piece',false),
  ('recreation','Игры и отдых','wheel','Колесо','service','piece',false),
  ('extras','Товары','shop','Магазин (позиции добавляются отдельно)','product','piece',false),
  ('extras','Сервисы','hookah','Кальян','service','piece',false),
  ('extras','Сервисы','parking','Парковка','service','day',false),
  ('extras','Сервисы','restroom','Санузел','service','piece',false),
  ('events','Аренда','territory','Аренда территории','rental','day',true),
  ('events','Аренда','venue','Аренда площадки','rental','day',true),
  ('events','Мероприятия','private-event','Частное мероприятие','service','booking',true),
  ('events','Мероприятия','corporate-event','Корпоративное мероприятие','service','booking',true)
)
insert into public.services(category_id,code,name,kind,unit,requires_booking,active)
select c.id,s.code,s.name,s.kind,s.unit,s.booking,false
from initial_services s join public.directions d on d.code=s.direction_code
join public.categories c on c.direction_id=d.id and c.name=s.category_name
on conflict (code) do nothing;
commit;
