-- Vadely temel şeması (silinen projenin uygulama kodundan yeniden kurulumu).
-- Çok kiracılılık: her tabloda hesap_id; varsayılanı ozel.aktif_hesap_id(),
-- erişim RLS ile kısıtlanır. ozel şeması Data API'ye açık değildir.

create schema if not exists ozel;
grant usage on schema ozel to authenticated, anon;

-- ============================================================
-- Tablolar
-- ============================================================

create table public.hesaplar (
  id uuid primary key default gen_random_uuid(),
  ad text not null check (length(ad) between 1 and 200),
  paket text not null default 'deneme'
    check (paket in ('deneme', 'baslangic', 'profesyonel', 'isletme')),
  paket_donemi text not null default 'aylik'
    check (paket_donemi in ('aylik', 'yillik')),
  gonderim_modu text not null default 'onayli'
    check (gonderim_modu in ('onayli', 'otomatik')),
  created_at timestamptz not null default now()
);

create table public.kullanici_profilleri (
  id uuid primary key references auth.users (id) on delete cascade,
  hesap_id uuid not null references public.hesaplar (id) on delete cascade,
  ad_soyad text,
  rol text not null default 'sahip'
    check (rol in ('sahip', 'muhasebe', 'salt_okur')),
  kvkk_onay_zamani timestamptz,
  created_at timestamptz not null default now()
);
create index on public.kullanici_profilleri (hesap_id);

create table public.platform_yoneticileri (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

-- ============================================================
-- Yardımcı fonksiyonlar (RLS ve varsayılanlar)
-- ============================================================

create or replace function ozel.aktif_hesap_id()
returns uuid
language sql stable security definer
set search_path = ''
as $$
  select hesap_id from public.kullanici_profilleri where id = (select auth.uid())
$$;

create or replace function ozel.aktif_rol()
returns text
language sql stable security definer
set search_path = ''
as $$
  select rol from public.kullanici_profilleri where id = (select auth.uid())
$$;

create or replace function ozel.yazabilir()
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select coalesce(ozel.aktif_rol() in ('sahip', 'muhasebe'), false)
$$;

revoke all on function ozel.aktif_hesap_id(), ozel.aktif_rol(), ozel.yazabilir() from public;
grant execute on function ozel.aktif_hesap_id(), ozel.aktif_rol(), ozel.yazabilir() to authenticated;

-- ============================================================
-- Kiracı tabloları
-- ============================================================

create table public.musteriler (
  id uuid primary key default gen_random_uuid(),
  hesap_id uuid not null default ozel.aktif_hesap_id()
    references public.hesaplar (id) on delete cascade,
  unvan text not null check (length(unvan) between 1 and 300),
  vkn text,
  eposta text,
  telefon text,
  whatsapp text,
  -- Hukuki dayanak: ticari alacak takibi (meşru menfaat); kullanıcı kapatabilir.
  izin_eposta boolean not null default true,
  izin_sms boolean not null default false,
  izin_whatsapp boolean not null default false,
  notlar text,
  created_at timestamptz not null default now()
);
create index on public.musteriler (hesap_id);

create table public.faturalar (
  id uuid primary key default gen_random_uuid(),
  hesap_id uuid not null default ozel.aktif_hesap_id()
    references public.hesaplar (id) on delete cascade,
  musteri_id uuid not null references public.musteriler (id) on delete cascade,
  fatura_no text not null check (length(fatura_no) between 1 and 100),
  gib_uuid text,
  fatura_tarihi date not null,
  vade_tarihi date not null,
  tutar numeric(14, 2) not null check (tutar > 0),
  kalan_bakiye numeric(14, 2) not null check (kalan_bakiye >= 0),
  para_birimi text not null default 'TRY' check (para_birimi ~ '^[A-Z]{3}$'),
  durum text not null default 'acik'
    check (durum in ('acik', 'kismi', 'kapali', 'itilafli')),
  kaynak text not null default 'manuel' check (kaynak in ('manuel', 'csv', 'gib')),
  created_at timestamptz not null default now(),
  check (vade_tarihi >= fatura_tarihi),
  unique (hesap_id, fatura_no)
);
create unique index faturalar_gib_uuid_tekil
  on public.faturalar (hesap_id, gib_uuid) where gib_uuid is not null;
create index on public.faturalar (musteri_id);
create index on public.faturalar (hesap_id, durum);

create table public.odemeler (
  id uuid primary key default gen_random_uuid(),
  hesap_id uuid not null default ozel.aktif_hesap_id()
    references public.hesaplar (id) on delete cascade,
  musteri_id uuid references public.musteriler (id) on delete cascade,
  tutar numeric(14, 2) not null check (tutar > 0),
  odeme_tarihi date not null,
  kaynak text not null default 'manuel'
    check (kaynak in ('manuel', 'banka', 'odeme_linki')),
  aciklama text check (length(aciklama) <= 500),
  created_at timestamptz not null default now()
);
create index on public.odemeler (hesap_id, kaynak);
create index on public.odemeler (musteri_id);

create table public.fatura_odeme_eslesmeleri (
  id uuid primary key default gen_random_uuid(),
  hesap_id uuid not null default ozel.aktif_hesap_id()
    references public.hesaplar (id) on delete cascade,
  fatura_id uuid not null references public.faturalar (id) on delete cascade,
  odeme_id uuid not null references public.odemeler (id) on delete cascade,
  tutar numeric(14, 2) not null check (tutar > 0),
  olusturan uuid default auth.uid(),
  created_at timestamptz not null default now()
);
create index on public.fatura_odeme_eslesmeleri (fatura_id);
create index on public.fatura_odeme_eslesmeleri (odeme_id);
create index on public.fatura_odeme_eslesmeleri (hesap_id);

create table public.kadans_adimlari (
  id uuid primary key default gen_random_uuid(),
  hesap_id uuid not null default ozel.aktif_hesap_id()
    references public.hesaplar (id) on delete cascade,
  gun_farki integer not null check (gun_farki between -60 and 365),
  sablon_kodu text not null
    check (sablon_kodu in ('on_hatirlatma', 'vade_gunu', 'nazik_gecikme', 'kararli_gecikme')),
  kanal text not null default 'eposta' check (kanal in ('eposta', 'sms', 'whatsapp')),
  aktif boolean not null default true,
  created_at timestamptz not null default now(),
  unique (hesap_id, gun_farki)
);

create table public.hatirlatmalar (
  id uuid primary key default gen_random_uuid(),
  hesap_id uuid not null default ozel.aktif_hesap_id()
    references public.hesaplar (id) on delete cascade,
  fatura_id uuid not null references public.faturalar (id) on delete cascade,
  musteri_id uuid not null references public.musteriler (id) on delete cascade,
  kadans_adim_id uuid references public.kadans_adimlari (id) on delete set null,
  kanal text not null default 'eposta' check (kanal in ('eposta', 'sms', 'whatsapp')),
  sablon_kodu text,
  planlanan_zaman timestamptz not null default now(),
  gonderilen_zaman timestamptz,
  durum text not null default 'planlandi'
    check (durum in ('planlandi', 'gonderildi', 'acildi', 'tiklandi', 'yanitlandi', 'iptal', 'gonderim_hatasi')),
  hata text,
  saglayici_mesaj_id text,
  maliyet numeric(10, 4),
  created_at timestamptz not null default now(),
  unique (fatura_id, kadans_adim_id)
);
create index on public.hatirlatmalar (hesap_id, durum, planlanan_zaman);
create index on public.hatirlatmalar (fatura_id);
create index on public.hatirlatmalar (musteri_id);
create index on public.hatirlatmalar (kadans_adim_id);
create index on public.hatirlatmalar (saglayici_mesaj_id) where saglayici_mesaj_id is not null;

-- Değiştirilemez olay günlüğü: yalnızca tetikleyiciler/RPC'ler yazar.
create table public.olay_gunlugu (
  id bigint generated always as identity primary key,
  hesap_id uuid not null references public.hesaplar (id) on delete cascade,
  zaman timestamptz not null default now(),
  aktor text not null default coalesce((auth.uid())::text, 'sistem'),
  olay_tipi text not null,
  varlik_id uuid,
  detay jsonb
);
create index on public.olay_gunlugu (hesap_id, zaman desc);

-- Pazarlama sayfasındaki pilot başvuruları (anon yalnızca ekleyebilir).
create table public.pilot_basvurulari (
  id uuid primary key default gen_random_uuid(),
  sirket_adi text not null check (length(sirket_adi) between 1 and 200),
  ad_soyad text not null check (length(ad_soyad) between 1 and 200),
  eposta text not null check (length(eposta) between 3 and 320 and eposta like '%@%'),
  telefon text check (length(telefon) <= 40),
  aylik_fatura_adedi text check (aylik_fatura_adedi in ('0-20', '20-100', '100-500', '500+')),
  kullanilan_yazilim text check (length(kullanilan_yazilim) <= 200),
  mesaj text check (length(mesaj) <= 2000),
  created_at timestamptz not null default now()
);

-- ============================================================
-- RLS
-- ============================================================

alter table public.hesaplar enable row level security;
alter table public.kullanici_profilleri enable row level security;
alter table public.platform_yoneticileri enable row level security;
alter table public.musteriler enable row level security;
alter table public.faturalar enable row level security;
alter table public.odemeler enable row level security;
alter table public.fatura_odeme_eslesmeleri enable row level security;
alter table public.kadans_adimlari enable row level security;
alter table public.hatirlatmalar enable row level security;
alter table public.olay_gunlugu enable row level security;
alter table public.pilot_basvurulari enable row level security;

create policy "hesap okuma" on public.hesaplar for select to authenticated
  using (id = (select ozel.aktif_hesap_id()));
create policy "hesap guncelleme (sahip)" on public.hesaplar for update to authenticated
  using (id = (select ozel.aktif_hesap_id()) and (select ozel.aktif_rol()) = 'sahip')
  with check (id = (select ozel.aktif_hesap_id()) and (select ozel.aktif_rol()) = 'sahip');

create policy "profil okuma" on public.kullanici_profilleri for select to authenticated
  using (hesap_id = (select ozel.aktif_hesap_id()));

-- Kiracı tabloları: okuma tüm roller, yazma sahip/muhasebe.
do $$
declare
  t text;
begin
  foreach t in array array[
    'musteriler', 'faturalar', 'odemeler', 'fatura_odeme_eslesmeleri',
    'kadans_adimlari', 'hatirlatmalar'
  ] loop
    execute format(
      'create policy "kiraci okuma" on public.%I for select to authenticated
         using (hesap_id = (select ozel.aktif_hesap_id()))', t);
    execute format(
      'create policy "kiraci ekleme" on public.%I for insert to authenticated
         with check (hesap_id = (select ozel.aktif_hesap_id()) and (select ozel.yazabilir()))', t);
    execute format(
      'create policy "kiraci guncelleme" on public.%I for update to authenticated
         using (hesap_id = (select ozel.aktif_hesap_id()) and (select ozel.yazabilir()))
         with check (hesap_id = (select ozel.aktif_hesap_id()) and (select ozel.yazabilir()))', t);
    execute format(
      'create policy "kiraci silme" on public.%I for delete to authenticated
         using (hesap_id = (select ozel.aktif_hesap_id()) and (select ozel.yazabilir()))', t);
  end loop;
end $$;

create policy "gunluk okuma" on public.olay_gunlugu for select to authenticated
  using (hesap_id = (select ozel.aktif_hesap_id()));

create policy "pilot basvuru ekleme" on public.pilot_basvurulari for insert to anon, authenticated
  with check (true);

-- Data API yetkileri (RLS satırları ayrıca kısıtlar)
grant select, update on public.hesaplar to authenticated;
grant select on public.kullanici_profilleri to authenticated;
grant select, insert, update, delete on
  public.musteriler, public.faturalar, public.odemeler,
  public.fatura_odeme_eslesmeleri, public.kadans_adimlari, public.hatirlatmalar
  to authenticated;
grant select on public.olay_gunlugu to authenticated;
grant insert on public.pilot_basvurulari to anon, authenticated;
revoke all on public.platform_yoneticileri from anon, authenticated;

-- ============================================================
-- Kayıt: auth.users -> hesap + sahip profili + varsayılan kadans
-- ============================================================

create or replace function ozel.yeni_kullanici()
returns trigger
language plpgsql security definer
set search_path = ''
as $$
declare
  v_hesap uuid;
  v_meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
begin
  insert into public.hesaplar (ad)
  values (coalesce(nullif(trim(v_meta->>'sirket_adi'), ''), 'Hesabım'))
  returning id into v_hesap;

  insert into public.kullanici_profilleri (id, hesap_id, ad_soyad, rol, kvkk_onay_zamani)
  values (
    new.id,
    v_hesap,
    nullif(trim(v_meta->>'ad_soyad'), ''),
    'sahip',
    case when (v_meta->>'kvkk_onayi_verildi')::boolean
      then coalesce((v_meta->>'kvkk_onay_zamani')::timestamptz, now()) end
  );

  insert into public.kadans_adimlari (hesap_id, gun_farki, sablon_kodu) values
    (v_hesap, -3, 'on_hatirlatma'),
    (v_hesap, 0, 'vade_gunu'),
    (v_hesap, 7, 'nazik_gecikme'),
    (v_hesap, 21, 'kararli_gecikme');

  return new;
end;
$$;

create trigger yeni_kullanici_hesap_olustur
  after insert on auth.users
  for each row execute function ozel.yeni_kullanici();

-- ============================================================
-- Olay günlüğü tetikleyicileri (hatırlatmalar)
-- ============================================================

create or replace function ozel.hatirlatma_olayi()
returns trigger
language plpgsql security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.olay_gunlugu (hesap_id, olay_tipi, varlik_id, detay)
    values (new.hesap_id, 'hatirlatma_planlandi', new.id,
      jsonb_build_object('sablon', new.sablon_kodu, 'kanal', new.kanal));
  elsif new.durum is distinct from old.durum then
    insert into public.olay_gunlugu (hesap_id, olay_tipi, varlik_id, detay)
    values (new.hesap_id, 'hatirlatma_' || new.durum, new.id,
      jsonb_build_object('sablon', new.sablon_kodu, 'kanal', new.kanal, 'hata', new.hata));
  end if;
  return new;
end;
$$;

create trigger hatirlatma_olay_gunlugu
  after insert or update of durum on public.hatirlatmalar
  for each row execute function ozel.hatirlatma_olayi();

-- ============================================================
-- Ödeme-fatura eşleştirme RPC'leri
-- ============================================================

create or replace function public.odeme_eslestir(p_odeme_id uuid, p_fatura_id uuid, p_tutar numeric)
returns uuid
language plpgsql security definer
set search_path = ''
as $$
declare
  v_hesap uuid := ozel.aktif_hesap_id();
  v_odeme public.odemeler;
  v_fatura public.faturalar;
  v_eslesmis numeric;
  v_yeni_kalan numeric;
  v_id uuid;
begin
  if v_hesap is null or not ozel.yazabilir() then
    raise exception 'Bu işlem için yetkiniz yok.';
  end if;
  if p_tutar is null or p_tutar <= 0 then
    raise exception 'Tutar sıfırdan büyük olmalı.';
  end if;

  select * into v_odeme from public.odemeler
    where id = p_odeme_id and hesap_id = v_hesap for update;
  if not found then raise exception 'Ödeme bulunamadı.'; end if;

  select * into v_fatura from public.faturalar
    where id = p_fatura_id and hesap_id = v_hesap for update;
  if not found then raise exception 'Fatura bulunamadı.'; end if;

  if v_fatura.durum = 'kapali' or v_fatura.kalan_bakiye <= 0 then
    raise exception 'Fatura zaten kapalı.';
  end if;
  if p_tutar > v_fatura.kalan_bakiye then
    raise exception 'Tutar faturanın kalan bakiyesini (%) aşıyor.', v_fatura.kalan_bakiye;
  end if;

  select coalesce(sum(tutar), 0) into v_eslesmis
    from public.fatura_odeme_eslesmeleri where odeme_id = p_odeme_id;
  if p_tutar > v_odeme.tutar - v_eslesmis then
    raise exception 'Tutar ödemenin eşleşmemiş kısmını (%) aşıyor.', v_odeme.tutar - v_eslesmis;
  end if;

  insert into public.fatura_odeme_eslesmeleri (hesap_id, fatura_id, odeme_id, tutar)
  values (v_hesap, p_fatura_id, p_odeme_id, p_tutar)
  returning id into v_id;

  v_yeni_kalan := v_fatura.kalan_bakiye - p_tutar;
  update public.faturalar
    set kalan_bakiye = v_yeni_kalan,
        durum = case
          when durum = 'itilafli' then 'itilafli'
          when v_yeni_kalan <= 0 then 'kapali'
          else 'kismi' end
    where id = p_fatura_id;

  insert into public.olay_gunlugu (hesap_id, olay_tipi, varlik_id, detay)
  values (v_hesap, 'eslesme_eklendi', v_id,
    jsonb_build_object('tutar', p_tutar, 'fatura_no', v_fatura.fatura_no));

  return v_id;
end;
$$;

create or replace function public.eslesme_kaldir(p_eslesme_id uuid)
returns void
language plpgsql security definer
set search_path = ''
as $$
declare
  v_hesap uuid := ozel.aktif_hesap_id();
  v_eslesme public.fatura_odeme_eslesmeleri;
  v_fatura public.faturalar;
  v_yeni_kalan numeric;
begin
  if v_hesap is null or not ozel.yazabilir() then
    raise exception 'Bu işlem için yetkiniz yok.';
  end if;

  select * into v_eslesme from public.fatura_odeme_eslesmeleri
    where id = p_eslesme_id and hesap_id = v_hesap for update;
  if not found then raise exception 'Eşleşme bulunamadı.'; end if;

  select * into v_fatura from public.faturalar where id = v_eslesme.fatura_id for update;

  delete from public.fatura_odeme_eslesmeleri where id = p_eslesme_id;

  v_yeni_kalan := least(v_fatura.tutar, v_fatura.kalan_bakiye + v_eslesme.tutar);
  update public.faturalar
    set kalan_bakiye = v_yeni_kalan,
        durum = case
          when durum = 'itilafli' then 'itilafli'
          when v_yeni_kalan >= tutar then 'acik'
          else 'kismi' end
    where id = v_fatura.id;

  insert into public.olay_gunlugu (hesap_id, olay_tipi, varlik_id, detay)
  values (v_hesap, 'eslesme_kaldirildi', p_eslesme_id,
    jsonb_build_object('tutar', v_eslesme.tutar, 'fatura_no', v_fatura.fatura_no));
end;
$$;

-- ============================================================
-- Kadans plan üretimi
-- Açık/kısmi her fatura için, zamanı gelmiş (vade + gün farkı <= bugün) en
-- ileri aktif adımı planlar; daha ileri bir adım zaten planlandıysa atlar.
-- Böylece eski faturalara geçmiş adımlar toplu yığılmaz.
-- ============================================================

create or replace function ozel.hatirlatma_plani_uret(p_hesap_id uuid)
returns integer
language plpgsql security definer
set search_path = ''
as $$
declare
  v_adet integer;
  v_bugun date := (now() at time zone 'Europe/Istanbul')::date;
begin
  with adaylar as (
    select distinct on (f.id)
      f.id as fatura_id, f.musteri_id, k.id as adim_id, k.gun_farki, k.sablon_kodu, k.kanal
    from public.faturalar f
    join public.kadans_adimlari k
      on k.hesap_id = f.hesap_id and k.aktif
     and f.vade_tarihi + k.gun_farki <= v_bugun
    where f.hesap_id = p_hesap_id
      and f.durum in ('acik', 'kismi')
      and f.kalan_bakiye > 0
    order by f.id, k.gun_farki desc
  ), eklenen as (
    insert into public.hatirlatmalar
      (hesap_id, fatura_id, musteri_id, kadans_adim_id, kanal, sablon_kodu, planlanan_zaman)
    select p_hesap_id, a.fatura_id, a.musteri_id, a.adim_id, a.kanal, a.sablon_kodu, now()
    from adaylar a
    where not exists (
      select 1
      from public.hatirlatmalar h
      join public.kadans_adimlari hk on hk.id = h.kadans_adim_id
      where h.fatura_id = a.fatura_id and hk.gun_farki >= a.gun_farki
    )
    on conflict (fatura_id, kadans_adim_id) do nothing
    returning 1
  )
  select count(*) into v_adet from eklenen;
  return v_adet;
end;
$$;
revoke all on function ozel.hatirlatma_plani_uret(uuid) from public;

create or replace function public.hatirlatma_plani_uret_benim()
returns integer
language plpgsql security definer
set search_path = ''
as $$
declare
  v_hesap uuid := ozel.aktif_hesap_id();
begin
  if v_hesap is null or not ozel.yazabilir() then
    raise exception 'Bu işlem için yetkiniz yok.';
  end if;
  return ozel.hatirlatma_plani_uret(v_hesap);
end;
$$;

-- Günlük zamanlanmış iş için: tüm hesaplar
create or replace function ozel.tum_hesaplar_plani_uret()
returns integer
language plpgsql security definer
set search_path = ''
as $$
declare
  v_toplam integer := 0;
  r record;
begin
  for r in select id from public.hesaplar loop
    v_toplam := v_toplam + ozel.hatirlatma_plani_uret(r.id);
  end loop;
  return v_toplam;
end;
$$;
revoke all on function ozel.tum_hesaplar_plani_uret() from public;

-- ============================================================
-- Resend webhook olayları (anon çağırır; imza uygulamada doğrulanır)
-- ============================================================

create or replace function public.eposta_olayi_isle(p_mesaj_id text, p_olay text)
returns void
language plpgsql security definer
set search_path = ''
as $$
begin
  if p_mesaj_id is null or length(p_mesaj_id) > 200 then
    return;
  end if;

  if p_olay = 'acildi' then
    update public.hatirlatmalar set durum = 'acildi'
      where saglayici_mesaj_id = p_mesaj_id and durum = 'gonderildi';
  elsif p_olay = 'tiklandi' then
    update public.hatirlatmalar set durum = 'tiklandi'
      where saglayici_mesaj_id = p_mesaj_id and durum in ('gonderildi', 'acildi');
  elsif p_olay = 'gonderim_hatasi' then
    update public.hatirlatmalar set durum = 'gonderim_hatasi', hata = 'E-posta teslim edilemedi (bounce)'
      where saglayici_mesaj_id = p_mesaj_id and durum in ('gonderildi', 'acildi', 'tiklandi');
  end if;
end;
$$;

-- ============================================================
-- KVKK: hesabı kalıcı silme (yalnızca sahip)
-- ============================================================

create or replace function public.hesabimi_sil()
returns void
language plpgsql security definer
set search_path = ''
as $$
declare
  v_hesap uuid := ozel.aktif_hesap_id();
  v_kullanicilar uuid[];
begin
  if v_hesap is null or ozel.aktif_rol() is distinct from 'sahip' then
    raise exception 'Hesabı yalnızca hesap sahibi silebilir.';
  end if;

  select array_agg(id) into v_kullanicilar
    from public.kullanici_profilleri where hesap_id = v_hesap;

  delete from public.hesaplar where id = v_hesap;
  delete from auth.users where id = any (v_kullanicilar);
end;
$$;

-- ============================================================
-- Platform yönetimi
-- ============================================================

create or replace function public.yonetici_miyim()
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.platform_yoneticileri where user_id = (select auth.uid())
  )
$$;

create or replace function public.yonetim_ozet()
returns jsonb
language plpgsql stable security definer
set search_path = ''
as $$
begin
  if not public.yonetici_miyim() then
    raise exception 'Yetkisiz.';
  end if;
  return jsonb_build_object(
    'hesap_sayisi', (select count(*) from public.hesaplar),
    'kullanici_sayisi', (select count(*) from public.kullanici_profilleri),
    'musteri_sayisi', (select count(*) from public.musteriler),
    'fatura_sayisi', (select count(*) from public.faturalar),
    'acik_fatura_sayisi', (select count(*) from public.faturalar where durum in ('acik', 'kismi')),
    'acik_alacak_toplami', (select coalesce(sum(kalan_bakiye), 0) from public.faturalar where durum in ('acik', 'kismi')),
    'tahsil_edilen_toplami', (select coalesce(sum(tutar), 0) from public.fatura_odeme_eslesmeleri),
    'hatirlatma_gonderilen', (select count(*) from public.hatirlatmalar where gonderilen_zaman is not null),
    'pilot_basvuru_sayisi', (select count(*) from public.pilot_basvurulari)
  );
end;
$$;

create or replace function public.yonetim_hesaplar()
returns table (
  id uuid, ad text, paket text, paket_donemi text, created_at timestamptz,
  sahip_eposta text, kullanici_sayisi bigint, musteri_sayisi bigint,
  fatura_sayisi bigint, acik_alacak numeric
)
language plpgsql stable security definer
set search_path = ''
as $$
begin
  if not public.yonetici_miyim() then
    raise exception 'Yetkisiz.';
  end if;
  return query
  select h.id, h.ad, h.paket, h.paket_donemi, h.created_at,
    (select u.email::text from public.kullanici_profilleri p
       join auth.users u on u.id = p.id
       where p.hesap_id = h.id and p.rol = 'sahip'
       order by p.created_at limit 1),
    (select count(*) from public.kullanici_profilleri p where p.hesap_id = h.id),
    (select count(*) from public.musteriler m where m.hesap_id = h.id),
    (select count(*) from public.faturalar f where f.hesap_id = h.id),
    (select coalesce(sum(f.kalan_bakiye), 0) from public.faturalar f
       where f.hesap_id = h.id and f.durum in ('acik', 'kismi'))
  from public.hesaplar h
  order by h.created_at desc;
end;
$$;

create or replace function public.yonetim_pilot_basvurulari()
returns setof public.pilot_basvurulari
language plpgsql stable security definer
set search_path = ''
as $$
begin
  if not public.yonetici_miyim() then
    raise exception 'Yetkisiz.';
  end if;
  return query select * from public.pilot_basvurulari order by created_at desc;
end;
$$;

-- RPC yetkileri: varsayılan PUBLIC yetkisini kaldır, yalnızca gerekene ver.
revoke all on function
  public.odeme_eslestir(uuid, uuid, numeric),
  public.eslesme_kaldir(uuid),
  public.hatirlatma_plani_uret_benim(),
  public.eposta_olayi_isle(text, text),
  public.hesabimi_sil(),
  public.yonetici_miyim(),
  public.yonetim_ozet(),
  public.yonetim_hesaplar(),
  public.yonetim_pilot_basvurulari()
from public, anon;

grant execute on function
  public.odeme_eslestir(uuid, uuid, numeric),
  public.eslesme_kaldir(uuid),
  public.hatirlatma_plani_uret_benim(),
  public.hesabimi_sil(),
  public.yonetici_miyim(),
  public.yonetim_ozet(),
  public.yonetim_hesaplar(),
  public.yonetim_pilot_basvurulari()
to authenticated;

grant execute on function public.eposta_olayi_isle(text, text) to anon, authenticated;

revoke all on function ozel.yeni_kullanici(), ozel.hatirlatma_olayi() from public;
