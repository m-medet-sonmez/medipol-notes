**ESP Trust Bölümü Hazır! 🚀**

İstediğiniz gibi ESP Trust sayfasını ve Admin yönetim panelini güncelledim:

1.  **Öğrenci Paneli (`/dashboard/esp-trust`):**
    *   **Sol Taraf:** Şifre talep formu.
    *   **Sağ Taraf:** Ünitelerin listesi (Kutucuklu yapı).
    *   **Görünüm:** Tamamlanan üniteler yeşil, çizili ve kilit açık simgesiyle görünüyor.
    *   **İlerleme:** Sayfanın üstünde toplam ilerleme yüzdesi var.

2.  **Admin Paneli (`/admin/esp-talepler`):**
    *   Tabloya **"Üniteler"** sütunu eklendi.
    *   **"Üniteleri Yönet"** butonuna basarak açılan pencereden öğrencinin tamamladığı üniteleri tek tıkla işaretleyebilirsiniz.

**⚠️ ÇOK ÖNEMLİ:**
Bu sistemin çalışması için veritabanına yeni bir alan ekledim.
Lütfen `add_esp_units.sql` dosyasındaki kodu **Supabase SQL Editor**'de çalıştırın. Aksi takdirde ünite işaretleme çalışmayacaktır.
