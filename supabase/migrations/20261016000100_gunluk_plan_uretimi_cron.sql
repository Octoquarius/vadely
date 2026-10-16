-- Her gün 06:00 UTC (09:00 TR) tüm hesaplar için zamanı gelen hatırlatmaları planlar.
create extension if not exists pg_cron;
select cron.schedule('gunluk-hatirlatma-plani', '0 6 * * *', 'select ozel.tum_hesaplar_plani_uret()');
