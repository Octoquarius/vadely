-- UI English: user-facing RPC errors and default account name in English.
do $$
declare
  r record;
  v_def text;
begin
  for r in
    select p.oid from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where (n.nspname, p.proname) in (
      ('public', 'odeme_eslestir'), ('public', 'eslesme_kaldir'),
      ('public', 'hatirlatma_plani_uret_benim'), ('public', 'hesabimi_sil'),
      ('public', 'yonetim_ozet'), ('public', 'yonetim_hesaplar'),
      ('public', 'yonetim_pilot_basvurulari'), ('public', 'eposta_olayi_isle'),
      ('ozel', 'yeni_kullanici'))
  loop
    v_def := pg_get_functiondef(r.oid);
    v_def := replace(v_def, 'Bu işlem için yetkiniz yok.', 'You do not have permission for this action.');
    v_def := replace(v_def, 'Tutar sıfırdan büyük olmalı.', 'Amount must be greater than zero.');
    v_def := replace(v_def, 'Ödeme bulunamadı.', 'Payment not found.');
    v_def := replace(v_def, 'Fatura bulunamadı.', 'Invoice not found.');
    v_def := replace(v_def, 'Fatura zaten kapalı.', 'Invoice is already closed.');
    v_def := replace(v_def, 'Tutar faturanın kalan bakiyesini (%) aşıyor.', 'Amount exceeds the remaining balance of the invoice (%).');
    v_def := replace(v_def, 'Tutar ödemenin eşleşmemiş kısmını (%) aşıyor.', 'Amount exceeds the unmatched part of the payment (%).');
    v_def := replace(v_def, 'Eşleşme bulunamadı.', 'Match not found.');
    v_def := replace(v_def, 'Hesabı yalnızca hesap sahibi silebilir.', 'Only the account owner can delete the account.');
    v_def := replace(v_def, 'Yetkisiz.', 'Unauthorized.');
    v_def := replace(v_def, 'E-posta teslim edilemedi (bounce)', 'Email could not be delivered (bounce)');
    v_def := replace(v_def, '''Hesabım''', '''My account''');
    execute v_def;
  end loop;
end $$;
