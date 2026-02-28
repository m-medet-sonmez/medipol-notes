# Sınav Bildirim Sistemi

Sınav takvimi açıklandığında admin panelinden sınavları girdiğinizde, öğrencilere otomatik bildirim gitmesi için aşağıdaki SQL kodunu çalıştırmanız gerekmektedir.

**Dosya:** `exam_notification_trigger.sql` (Root dizinde)

**Kurulum:**
1. Supabase SQL Editor'ü açın.
2. `exam_notification_trigger.sql` dosyasının içeriğini yapıştırın.
3. **Run** butonuna basın.

**Nasıl Çalışır?**
*   Admin panelinden (`/admin/takvim/yeni`) yeni sınav eklerken "Bildirim Gönder" kutucuğunu işaretlerseniz, tüm öğrencilere anında bildirim düşer.
