export const marketTicks=[{symbol:"BIST100",value:"9,842.15",change:"+1.24%",up:true},{symbol:"USD/TRY",value:"32.45",change:"-0.12%",up:false},{symbol:"EUR/TRY",value:"34.82",change:"+0.05%",up:true},{symbol:"BTC/USD",value:"64,210",change:"+2.10%",up:true},{symbol:"XAU/USD",value:"2,341.50",change:"0.00%",neutral:true}];
export const newsFeed=[{source:"KAP Bildirimi",time:"1m ago",tag:"$THYAO",tagTone:"teal",title:"Türk Hava Yolları, Nisan ayı yolcu trafik verilerini açıkladı.",summary:"Toplam yolcu sayısı geçen yılın aynı dönemine göre %12 artışla 7.2 milyona ulaştı. Uluslararası dış hat doluluk oranı %82.4 olarak gerçekleşti.",meta:"#Havacılık",icon:"business_center"},{source:"Makro Radar",time:"10 dk önce",tag:"#MACRO",tagTone:"gold",title:"Merkez Bankası faiz kararını beklentiler doğrultusunda sabit tuttu.",summary:"Karar metninde enflasyon görünümündeki bozulmaya dikkat çekilirken likidite yönetiminin sıkılaştırılacağı belirtildi.",meta:"TCMB",icon:"account_balance"},{source:"Balina Takibi",time:"18 dk önce",tag:"$ASELS",tagTone:"red",title:"Kurumsal akışta savunma hisseleri için olağan dışı hacim sinyali.",summary:"Derinlik verisi ve aracı kurum dağılımı aynı yönde kümeleniyor. Sistem alarm merkezi için otomatik izleme önerisi üretti.",meta:"Hacim",icon:"radar"}];
export const moduleGroups=["Core","Mobile","Alarm","Analysis","Market","Portfolio","Institutional","Desktop","Share","Subscription"];
export const modules=[
{id:"dashboard",title:"Ana Dashboard",group:"Core",source:"sonarat_ak_ana_dashboard",icon:"dashboard",status:"Aktif"},
{id:"mobile-dashboard",title:"Mobil Dashboard",group:"Mobile",source:"sonarat_ak_mobil_dashboard",icon:"phone_iphone",status:"Aktif"},
{id:"terminal-feed",title:"Mobil Terminal Haber Akışı",group:"Mobile",source:"sonarat_ak_mobil_terminal_haber_ak",icon:"article",status:"Aktif"},
{id:"mobile-filters",title:"Mobil Akıllı Filtreler",group:"Mobile",source:"sonarat_ak_mobil_ak_ll_filtreler",icon:"tune",status:"Aktif"},
{id:"daily-brief",title:"Mobil Günlük Bülten",group:"Mobile",source:"sonarat_ak_mobil_g_nl_k_b_lten",icon:"newspaper",status:"Aktif"},
{id:"alarm-center",title:"Akıllı Alarm Merkezi",group:"Alarm",source:"sonarat_ak_ak_ll_alarm_merkezi",icon:"notifications",status:"Aktif"},
{id:"alarm-detail",title:"Alarm Kurulum Detayı",group:"Alarm",source:"sonarat_ak_ak_ll_alarm_kurulum_detay",icon:"rule",status:"Aktif"},
{id:"new-alarm",title:"Yeni Alarm Konfigürasyonu",group:"Alarm",source:"sonarat_ak_yeni_alarm_konfig_rasyonu",icon:"add_alert",status:"Aktif"},
{id:"advanced-terminal",title:"Gelişmiş Terminal Analiz Arayüzü",group:"Analysis",source:"sonarat_ak_geli_mi_terminal_analiz_aray_z",icon:"terminal",status:"Aktif"},
{id:"chart-terminal",title:"Grafik Destekli Analiz Terminali",group:"Analysis",source:"sonarat_ak_grafik_destekli_analiz_terminali",icon:"monitoring",status:"Aktif"},
{id:"news-detail",title:"Haber Detay Terminali",group:"Analysis",source:"sonarat_ak_haber_detay_terminali",icon:"article",status:"Aktif"},
{id:"correlation",title:"Detaylı Korelasyon Matrisi",group:"Analysis",source:"sonarat_ak_detayl_korelasyon_matrisi",icon:"grid_on",status:"Aktif"},
{id:"market-scan",title:"Piyasa Tarama ve Korelasyon Merkezi",group:"Market",source:"sonarat_ak_piyasa_tarama_ve_korelasyon_merkezi",icon:"query_stats",status:"Aktif"},
{id:"advanced-scan",title:"İleri Düzey Piyasa Tarama",group:"Market",source:"sonarat_ak_i_leri_d_zey_piyasa_tarama_ve_filtreleme",icon:"manage_search",status:"Aktif"},
{id:"depth",title:"Piyasa Derinlik ve Kademe Analizi",group:"Market",source:"sonarat_ak_piyasa_derinlik_ve_kademe_analizi",icon:"stacked_line_chart",status:"Aktif"},
{id:"portfolio",title:"Portföy Analiz Terminali",group:"Portfolio",source:"sonarat_ak_portf_y_analiz_terminali",icon:"pie_chart",status:"Aktif"},
{id:"stock-compare",title:"Hisse Kıyaslama Modu",group:"Portfolio",source:"sonarat_ak_hisse_k_yaslama_modu",icon:"compare_arrows",status:"Aktif"},
{id:"holding-discount",title:"İskontolu Ucuz Hisseler",group:"Portfolio",source:"sonarat_ak_iskontolu_ucuz_hisseler",icon:"percent",status:"Aktif"},
{id:"institutional-flow",title:"Kurumsal Akış ve Balina Takibi",group:"Institutional",source:"sonarat_ak_kurumsal_ak_ve_balina_takibi",icon:"waves",status:"Aktif"},
{id:"corporate-panel",title:"Entegre Kurumsal Akış Paneli",group:"Institutional",source:"sonarat_ak_entegre_kurumsal_ak_paneli",icon:"corporate_fare",status:"Aktif"},
{id:"desktop-terminal",title:"Masaüstü Terminal Akışı",group:"Desktop",source:"sonarat_ak_masa_st_terminal_ak",icon:"desktop_windows",status:"Aktif"},
{id:"share-editor",title:"Mobil Hızlı Paylaşım Editörü",group:"Share",source:"sonarat_ak_mobil_h_zl_payla_m_edit_r",icon:"ios_share",status:"Aktif"},
{id:"share-card",title:"Finansal Sosyal Medya Kartı",group:"Share",source:"a_high_fidelity_social_media_share_card_for_a_financial_app._dark_theme",icon:"image",status:"Aktif"},
{id:"report",title:"Kurumsal Rapor PDF Tasarımı",group:"Subscription",source:"sonarat_ak_kurumsal_rapor_pdf_tasar_m",icon:"picture_as_pdf",status:"Aktif"},
{id:"elite",title:"Elite Abonelik Paneli",group:"Subscription",source:"sonarat_ak_elite_abonelik_paneli",icon:"workspace_premium",status:"Premium"},
{id:"vip-payment",title:"VIP Ödeme Sayfası",group:"Subscription",source:"sonarat_ak_vip_deme_sayfas",icon:"credit_card",status:"Premium"}
];
