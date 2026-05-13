import Head from "next/head";
import App from "../App";

export default function Home() {
  return (
    <>
      <Head>
        <title>Sonarat Terminal</title>
        <meta
          name="description"
          content="Sonarat Terminal canlı ekonomi haberleri, piyasa ekranı, Smart-Feed ve topluluk akışı."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <App />
    </>
  );
}
