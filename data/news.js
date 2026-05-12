export const alerts = [
  {
    id: 1,
    source: "Balkanlar Masası",
    title: "Enerji dağıtım ihalesinde iki yeni ortaklık sinyali",
    time: "08:42",
    impact: "Yüksek",
    tone: "emerald",
    tags: ["İhale", "Enerji", "İştirak"],
    summary:
      "Ana tedarikçi ağındaki iki şirket aynı konsorsiyum etrafında kümeleniyor. Alarm koşulu son 24 saat içinde üçüncü kez tetiklendi."
  },
  {
    id: 2,
    source: "Regülasyon Akışı",
    title: "Mobil ödeme lisanslarında yeni uyum takvimi",
    time: "09:16",
    impact: "Orta",
    tone: "amber",
    tags: ["Fintek", "Uyum", "Lisans"],
    summary:
      "Düzenleyici duyuru, iştirak portföyündeki üç bağlı kuruluş için eş zamanlı raporlama gereksinimi doğuruyor."
  },
  {
    id: 3,
    source: "Pazar İzleme",
    title: "Tedarik zinciri risk endeksi kuzey hattında yükseldi",
    time: "10:05",
    impact: "Kritik",
    tone: "coral",
    tags: ["Risk", "Lojistik", "Radar"],
    summary:
      "Haber yoğunluğu, saha bildirimleri ve fiyat oynaklığı tek ekranda birleşerek kritik eşik üzerinde yeni bir sinyal üretti."
  }
];

export const hierarchy = [
  { name: "Sonarat Holding", type: "Ana yapı", score: 94 },
  { name: "Vela Enerji", type: "İştirak", score: 86 },
  { name: "Orion Lojistik", type: "Bağlı ortaklık", score: 73 },
  { name: "Mira Fintek", type: "Stratejik ortak", score: 68 }
];
