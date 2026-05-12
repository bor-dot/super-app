import Head from "next/head";
import App from "../App";

export default function Home() {
  return (
    <>
      <Head>
        <title>Sonarat News Stream</title>
        <meta
          name="description"
          content="Kurumsal haber akışı, alarm aktivasyonu ve iştirak haritası için mobil öncelikli dashboard."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <App />
    </>
  );
}
