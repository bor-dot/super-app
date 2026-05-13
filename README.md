# Super App

Sonarat Akışı Stitch çıktısından Next.js ve Tailwind CSS uyumlu hale getirilmiş finans terminali arayüzü.

Kaynak Stitch export klasörü:

`/Users/talat/Downloads/stitch_sonarat_news_stream`

## Çalıştırma

```bash
npm install
npm run dev
```

## Vercel

Bu repo GitHub'a gönderildiğinde Vercel projeyi otomatik olarak Next.js uygulaması olarak algılar.

- Build command: `npm run build`
- Development command: `npm run dev`
- Output directory: Next.js varsayılanı

## Piyasa Motoru

- Grafikler `lightweight-charts` ile yerel candlestick motorunda çizilir.
- BIST sembol evreni canlı kaynaklardan çekilir; kaynak kesilirse yerel listeye düşer.
