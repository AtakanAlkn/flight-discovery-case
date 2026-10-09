# Uçuş Keşfi

React Native + TypeScript ile geliştirilmiş; İstanbul–Antalya uçuşlarını listeleme, filtreleme, sıralama, detay görüntüleme ve favorilere kaydetme akışlarını içeren mobil uygulama. `case-kit` mock HTTP servisi, 15 Ekim 2026 kalkışlı 24 sabit ve kurgusal uçuş sağlar.

## Ortam ve sürümler

Doğrulanan platform: Android, `Pixel_4_API_33_2` emulator, API 33. iOS üzerinde doğrulama yapılmadı.

Aşağıdaki paket sürümleri `mobile/package-lock.json` ile kilitlidir; Node.js ve npm sürümleri doğrulama ortamına aittir.

| Araç / paket                                           | Sürüm                   |
| ------------------------------------------------------ | ----------------------- |
| Expo SDK / expo                                        | 57 / 57.0.27            |
| React Native                                           | 0.86.3                  |
| React                                                  | 19.2.3                  |
| TypeScript                                             | 6.0.3                   |
| Node.js                                                | 22.23.3                 |
| npm                                                    | 10.9.9                  |
| React Navigation (native / native-stack / bottom-tabs) | 7.5.0 / 7.20.0 / 7.20.0 |
| TanStack Query                                         | 5.104.1                 |
| Zustand                                                | 5.0.15                  |
| AsyncStorage                                           | 2.2.0                   |
| Jest / jest-expo                                       | 29.7.0 / 57.0.5         |
| React Native Testing Library                           | 13.3.3                  |

## Kurulum ve çalıştırma

Ön koşullar: Node.js 22.13+, Android SDK, emulator ve React Native ile uyumlu JDK.

1. Repoyu klonlayın veya ZIP arşivini açıp proje köküne geçin.

   ```bash
   git clone https://github.com/AtakanAlkn/flight-discovery-case flight-discovery-case
   cd flight-discovery-case
   ```

2. Proje kökünden mock servisi başlatın; terminali açık bırakın. Bağımlılık kurulumu gerekmez.

   ```bash
   cd case-kit
   node server.js
   ```

3. Ayrı bir terminalde, proje kökünden bağımlılıkları kurup Android development build'i çalıştırın. Emulator açık olmalıdır; Metro otomatik başlar.

   ```bash
   cd mobile
   npm ci
   npx expo run:android
   ```

4. Sonraki çalıştırmalarda `mobile` klasöründe Metro'yu başlatın ve kurulu development build'i açın:

   ```bash
   npx expo start --dev-client
   ```

### API bağlantısı

Android emulator varsayılan olarak `http://10.0.2.2:4000` adresini kullanır; ek ayar gerekmez.

Fiziksel cihazda development build kurulu, cihaz ve bilgisayar aynı ağda, servis portu erişilebilir olmalıdır. `mobile` klasöründe `EXPO_PUBLIC_API_URL` değerini bilgisayarın LAN IP adresiyle ayarlayın (PowerShell):

```powershell
$env:EXPO_PUBLIC_API_URL = "http://192.168.1.10:4000"
npx expo start --dev-client
```

`192.168.1.10` yerine kendi IP adresinizi kullanın. Adresi değiştirince Metro'yu yeniden başlatıp uygulamayı yeniden yükleyin. API ayrıntıları: [servis sözleşmesi](case-kit/README.md).

## Mimari kararlar

Feature odaklı veri erişimi ve bileşenler, ortak ekran/navigation katmanlarıyla birlikte tutulur. Bu karma yapı, ilgili kodu yakın tutarken küçük case için ek katmanlar oluşturmaz.

```text
mobile/
├── App.tsx
├── src/
│   ├── features/
│   │   ├── flights/
│   │   │   ├── api/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   └── formatters.ts
│   │   └── favorites/
│   │       ├── components/
│   │       ├── hooks/
│   │       ├── storage/
│   │       └── store/
│   ├── navigation/
│   ├── query/
│   ├── screens/
│   ├── shared/components/
│   └── theme/
└── test-utils/
```

- **TanStack Query:** uçuş listesi, detay ve favori uçuş verilerini sunucu state'i olarak yönetir. Sayfalama, yüklenme/hata durumları ve istek iptali query katmanında kalır; ekranlarda HTTP çağrısı yapılmaz.
- **Zustand:** yalnızca favori ID'leri ve bunların hydration/persistence durumunu tutar. Liste, detay ve favoriler aynı store'u kullanır. Sunucu verisi zaten Query ile yönetildiği için Redux Toolkit'in ek slice/action/provider yapısı yerine bu kapsamda daha sade bulundu.
- **AsyncStorage:** yalnızca favori ID'lerini saklar; `FlightDto` saklanmaz. Hydration tamamlanmadan favori değişikliği ve boş başlangıç state'inin depoya yazılması engellenir. Sonraki yazımlar sıraya alınır.
- **Expo + development build:** case özel native modül gerektirmediği için seçildi; development build kurulumu tek komutla yapılır ve hazır `jest-expo` test preset'i kullanılır.
- **React Navigation:** üç ekranlık yapı kısa tab/stack navigator dosyalarında okunur; Expo Router'ın sunduğu deep linking bu case'te gerekmiyor. Detaya yalnızca `flightId` taşınır; navigasyon parametreleri TypeScript ile tanımlıdır.
- **FlightCard:** veriyi ve callback'leri props üzerinden alan sunumsal bileşendir; favorites store'unu import etmez. Store bağlantısı, favorites tarafındaki `FavoriteFlightCard` adapter'ı ile kurulur.

## Liste, detay ve favoriler

**Flights:** varsayılan filtre kapalı, sıralama fiyat artandır. `page`, `limit=8`, `onlyDirect` ve `sort=price|duration` sunucuya gönderilir. Liste sonuna yaklaşınca sonraki sayfa istenir; `hasMore=false` olduğunda durur. Devam eden sayfa isteğinin paralel tekrarı engellenir; sonraki sayfa yüklenirken mevcut liste görünür kalır.

Filtre/sıralama query key'e dahildir; değişiklikte ilk sayfadan yeni sonuç alınır ve eski sayfalar yeni sonuçlarla karışmaz. `AbortSignal` HTTP isteğine iletilir. Detail → Back sonrasında ekran bağlı kaldığı ve liste `staleTime: Infinity` kullandığı için filtre/sıralama ve yüklenmiş sayfalar korunur; case'in istediği geri dönüş davranışı için liste sıfırlanmaz.

**Detail:** her yeni girişte `GET /flights/:id` ile güncel veri istenir; `staleTime: 0` ve `gcTime: 0` kullanılır. Kalkış/varış tarihleri ve bagaj bilgisi burada gösterilir.

**Favorites:** her yeni girişte kayıtlı ID'ler için `GET /flights?ids=...` ile güncel veri alınır. API'nin 50 ID sınırı, en fazla 50'lik grupları paralel isteyerek ele alınır; her favori için ayrı istek atan N+1 yaklaşımı veya ana listedeki gibi infinite scroll kullanılmaz. İstek limiti grup büyüklüğüne göre belirlenir. Ekran, ana listenin filtre/sıralamasından bağımsızdır; favoriler kayıtlı ID sırasıyla gösterilir.

Kalp aksiyonu detay navigasyonundan ayrıdır. Favori değişiklikleri ortak store üzerinden ekranlara yansır; favorilerde bir kayıt kaldırılınca kart, son kayıt kaldırılınca boş durum gösterilir.

## Veri gösterimi, hata ve erişilebilirlik

API verisi ham `FlightDto` olarak korunur; fiyat, tarih, saat, süre, aktarma ve bagaj metinleri ortak formatter fonksiyonlarıyla hazırlanır. Ekranlar aynı gösterim kurallarını paylaşır. Bu case için ayrı bir DTO → domain model/mapper katmanı gerçek bir ihtiyaç sağlamadığı için eklenmedi.

`priceMinor` kuruştur; örneğin `355000`, `3.550,00 TL` gösterilir. Tarih/saatler sözleşmedeki `+03:00 / Europe/Istanbul` parçalarından hazırlanır; cihaz saat dilimine kaydırılmaz ve cihazın bugünkü tarihine göre uçuş elenmez. Gece yarısını aşan uçuşlarda kartta “Ertesi gün”, detayda gerçek kalkış/varış tarihleri gösterilir. `baggageKg=0` “Bagaj dahil değil”, `null` “Bagaj bilgisi yok” olarak ayrılır;

Bağlantı hataları, HTTP 5xx ve diğer beklenmeyen hatalar için ayrı mesajlar kullanılır. Otomatik retry kapalıdır; kullanıcı “Tekrar dene” ile yeniden istek başlatır. Sonraki sayfa hatasında mevcut liste korunur ve footer'da retry gösterilir. Detail'deki `FLIGHT_NOT_FOUND` (404) özel durumunda retry sunulmaz.

Favori kontrollerinde erişilebilir ad ile selected/disabled, filtrede checkbox/checked, sıralamada selected state bulunur. Favori ve aksiyon butonları 48 dp hedef kullanır; filtre satırı en az 48 dp yüksekliğindedir. Sıralama kontrollerinin en az 40 dp yüksekliğine 4 dp `hitSlop` eklenir. Font scaling kapatılmaz; büyüyebilen butonlar, sarılabilen alanlar ve font ölçeğine göre tab yüksekliği büyük yazı desteğine katkı sağlar.

## Performans kararları

`FavoriteFlightCard` memo ile sarılır; listelerdeki `renderItem` ve detay navigasyonu callback'leri stabildir. Favori kartları selector ile ilgili favori durumuna abone olur; `useFlightsInfiniteQuery` yalnızca kullanılan alanları döndürür, query sonucunun tamamını spread etmez. Favori kontrolünde `includes` korunur; küçük ID listesi için ayrı bir `Set` state'i ikinci doğruluk kaynağı oluşturacağından eklenmedi.

## Kapsam sınırları ve bilinçli tercihler

- **Platform:** doğrulama Android'de yapıldı; iOS'ta ortam değişkeni verilmezse API adresi otomatik `http://localhost:4000` seçilir.
- **Tarih/saat:** sözleşmenin garanti ettiği `+03:00` biçimi okunur; beklenmeyen biçimde ekran çökmek yerine `—` gösterir. Gerçek üründe API yanıtları uygulama sınırında bir şemayla doğrulanırdı.
- **Retry:** otomatik retry kapalıdır; yeniden deneme case'teki “Tekrar dene” aksiyonuyla yapılır. Gerçek üründe geçici hatalar için 1–2 otomatik deneme eklenebilir.
- **Kayıt sahipliği:** sunucunun artık döndürmediği favori ID'leri gösterilmez, ancak kullanıcının kaydı sessizce silinmez.
- **HTTP:** mock servise debug build'de düz HTTP erişimi açıktır. Release build'de aynı servise erişmek için `android:usesCleartextTraffic="true"` gerekir; gerçek üründe HTTPS tercih edilir.
- **Test kapsamı:** otomatik testler aşağıdaki dört ana davranışa odaklanır; tüm ekran akışlarını kapsayan bir E2E test paketi bu case'e eklenmedi.

Mock veri sabit ve detaydan dönüşte yüklenmiş sayfaların korunması istendiği için Flights'ta süre bazlı otomatik yenileme veya refresh banner yoktur. Gerçek üründe scroll/liste state'i korunarak `dataUpdatedAt` benzeri bir güncellik bilgisi kontrol edilebilir. Eski sonuçlarda tam ekran yüklenmeye geçmeden “Uçuş sonuçları güncelliğini yitirmiş olabilir / Sonuçları yenile” banner'ı sunulabilir; bu, kullanıcı isteğiyle yenileme için bir ürün önerisidir ve mevcut uygulamada yapılmamıştır.

## Testler ve P0/P1 doğrulaması

`mobile` klasöründe çalıştırın:

```bash
npm test -- --runInBand
npx tsc --noEmit
npx expo-doctor
```

Jest, `jest-expo` preset'ini ve AsyncStorage mock'u içeren `jest.setup.js` dosyasını kullanır. Jest + React Native Testing Library ile dört ana davranış testi vardır; snapshot testi yoktur:

1. **P0 — API parametreleri:** filtre/sıralama ve sayfalama parametrelerinin gerçek fetch çağrısına doğru taşınması (`flightsApi.test.ts`).
2. **P0 — favoriler:** ekleme/çıkarma, AsyncStorage'a yazma, yeniden başlangıçta geri yükleme ve hydration öncesi değişiklik/yazma koruması (`favoritesStore.test.ts`).
3. **P1 — retry:** hata → “Tekrar dene” etkileşimi → başarılı liste; hata durumunun kaybolması ve iki istek yapılması (`FlightsScreen.test.tsx`).
4. **P1 — race:** gerçek Query akışında kontrollü Promise'lerle yeni sıralama yanıtı önce, eski yanıt sonra döndürülür; eski isteğin iptal edildiği ve yeni sonucu ezmediği doğrulanır (`useFlightsInfiniteQuery.test.tsx`).

İki P1 maddesi de uygulanmıştır; otomatik race testi sıralama değişimini sınar, filtre de aynı query key/iptal mekanizmasını kullanır. Manuel hata, boş sonuç, yavaşlık ve sırasız yanıt kontrolleri için mock servisin `/debug/fail-once`, `/debug/empty` ve `/debug/mode` uçları kullanılabilir; ayrıntıları servis sözleşmesindedir.

Son doğrulama: **Jest 4/4**, **TypeScript hatasız**, **Expo Doctor 21/21**.

## Çalışma süresi

Projeyi bana verilen 3 günlük süre içinde tamamladım.

## AI kullanımı

AI araçlarından mimari seçenekleri değerlendirme, uç durum ve test senaryoları hazırlama, kod inceleme ve kullanıcı metinleri/README düzenlemesinde yararlanıldı. Çıktılar kaynak kod ve servis sözleşmesiyle karşılaştırıldı; Android emulator kontrolleri, Jest davranış testleri, TypeScript ve Expo Doctor sonuçlarıyla doğrulandı.
