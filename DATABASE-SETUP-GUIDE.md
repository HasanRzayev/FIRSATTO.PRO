# 🚴 FIRSATTO Bicycle Marketplace - Database Setup Guide

## Supabase Database Kurulumu

### Adım 1: Supabase Dashboard'a Girin

1. [Supabase Dashboard](https://supabase.com/dashboard) adresine gidin
2. Projenizi seçin: `ogkwdmtpvupvxlvwouhs`

### Adım 2: SQL Editor'ı Açın

1. Sol menüden **SQL Editor** seçeneğine tıklayın
2. **New Query** butonuna tıklayın

### Adım 3: Database Script'ini Çalıştırın

1. `database-setup.sql` dosyasının tüm içeriğini kopyalayın
2. Supabase SQL Editor'a yapıştırın
3. **Run** butonuna tıklayın

### Adım 4: Tabloları Kontrol Edin

1. Sol menüden **Table Editor** seçeneğine tıklayın
2. Şu tabloları görmelisiniz:
   - ✅ `user_profiles` - Kullanıcı profilleri
   - ✅ `user_ads` - Velosiped ilanları
   - ✅ `comments` - Yorumlar
   - ✅ `user_saved_ads` - Kaydedilen ilanlar
   - ✅ `contacts` - İletişim mesajları

## ✅ Tablo Yapıları

### user_profiles
- `id` (UUID) - Primary Key
- `full_name` (TEXT) - Tam ad
- `username` (TEXT) - Kullanıcı adı (unique)
- `bio` (TEXT) - Biyografi
- `location` (TEXT) - Konum
- `birth_date` (DATE) - Doğum tarihi
- `profile_picture` (TEXT) - Profil resmi URL
- `created_at` (TIMESTAMP) - Oluşturulma tarihi
- `updated_at` (TIMESTAMP) - Güncellenme tarihi

### user_ads (Bicycle Listings)
- `id` (UUID) - Primary Key
- `user_id` (UUID) - Kullanıcı ID
- `title` (TEXT) - İlan başlığı
- `description` (TEXT) - Açıklama
- `category` (TEXT) - Kategori (mountain-bike, road-bike, etc.)
- `image_urls` (TEXT[]) - Resim URL'leri
- `video_urls` (TEXT[]) - Video URL'leri
- `location` (TEXT) - Konum
- `price` (NUMERIC) - Fiyat
- `created_at` (TIMESTAMP) - Oluşturulma tarihi
- `updated_at` (TIMESTAMP) - Güncellenme tarihi

### comments
- `id` (UUID) - Primary Key
- `ad_id` (UUID) - İlan ID
- `user_id` (UUID) - Kullanıcı ID
- `parent_comment_id` (UUID) - Üst yorum ID (replies için)
- `content` (TEXT) - Yorum içeriği
- `is_read` (BOOLEAN) - Okundu mu?
- `created_at` (TIMESTAMP) - Oluşturulma tarihi

### user_saved_ads
- `id` (UUID) - Primary Key
- `user_id` (UUID) - Kullanıcı ID
- `ad_id` (UUID) - İlan ID
- `created_at` (TIMESTAMP) - Kaydedilme tarihi

## 🔒 Row Level Security (RLS)

Tüm tablolarda RLS aktif ve güvenlik politikaları ayarlanmış:

- ✅ Herkes tüm ilanları görebilir
- ✅ Kullanıcılar sadece kendi ilanlarını düzenleyebilir
- ✅ Kullanıcılar sadece kendi profillerini güncelleyebilir
- ✅ Herkes yorum yapabilir
- ✅ Kullanıcılar sadece kendi kayıtlarını görebilir

## 🚀 Test Etme

Database kurulumundan sonra:

1. Uygulamayı çalıştırın: `npm run dev`
2. Kayıt olun (sign up)
3. Profil oluşturun
4. Velosiped ilanı ekleyin
5. İlanları görüntüleyin

## 🔧 Sorun Giderme

### "Could not find the table" Hatası
- Database script'ini çalıştırdınız mı?
- Supabase projesinde doğru database'i seçtiniz mi?
- RLS politikaları aktif mi?

### Profile Oluşturulamıyor
- `handle_new_user` trigger'ı çalışıyor mu?
- Auth.users tablosunda kullanıcı var mı?

### İlanlar Görünmüyor
- `user_ads` tablosu var mı?
- RLS politikaları doğru mu?
- Supabase URL ve Key doğru mu?

## 📞 Yardım

Sorun devam ederse:
1. Supabase Dashboard'da Table Editor'ı kontrol edin
2. SQL Editor'da `SELECT * FROM user_ads LIMIT 10;` çalıştırın
3. Database logs'ları kontrol edin
