# 🚀 FIRSATTO Setup Guide

## Environment Variables Setup

Bu projeyi çalıştırmak için Supabase environment değişkenlerini ayarlamanız gerekiyor.

### 1. Environment Dosyası Oluşturun

Proje kök dizininde `.env.local` dosyası oluşturun:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 2. Supabase Değerlerini Alın

1. [Supabase Dashboard](https://supabase.com/dashboard) adresine gidin
2. Projenizi seçin
3. Settings > API bölümüne gidin
4. Aşağıdaki değerleri kopyalayın:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. Örnek .env.local Dosyası

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvdXItcHJvamVjdC1pZCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjQwMDAwMDAwLCJleHAiOjE5NTU1NTU1NTZ9.example-key
```

### 4. Projeyi Çalıştırın

```bash
npm install
npm run dev
```

## 🔧 Troubleshooting

### Environment Variables Hatası

Eğer şu hatayı alıyorsanız:
```
Error: @supabase/ssr: Your project's URL and API key are required to create a Supabase client!
```

1. `.env.local` dosyasının proje kök dizininde olduğundan emin olun
2. Dosya adının doğru olduğundan emin olun (`.env.local`)
3. Değerlerin doğru kopyalandığından emin olun
4. Sunucuyu yeniden başlatın: `npm run dev`

### Supabase Projesi Oluşturma

Eğer Supabase projeniz yoksa:

1. [Supabase](https://supabase.com) adresine gidin
2. "Start your project" butonuna tıklayın
3. GitHub hesabınızla giriş yapın
4. Yeni proje oluşturun
5. Proje oluşturulduktan sonra API ayarlarından URL ve key'leri alın

## 📱 Features

- ✅ Modern responsive design
- ✅ Multi-language support
- ✅ User authentication
- ✅ Ad creation and management
- ✅ Image and video uploads
- ✅ Real-time messaging
- ✅ Profile management
- ✅ Search and filtering

## 🎨 Design System

- **Colors**: Modern gradient backgrounds
- **Components**: Glassmorphism effects
- **Animations**: Smooth hover transitions
- **Typography**: Clean and readable fonts
- **Layout**: Responsive grid system

## 🔒 Security

- Environment variables are properly secured
- Supabase RLS (Row Level Security) enabled
- Input validation and sanitization
- Error handling and logging

## 📞 Support

Herhangi bir sorun yaşarsanız, lütfen GitHub Issues bölümünde sorun bildirin.
