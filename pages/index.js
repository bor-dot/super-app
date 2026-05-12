import Head from "next/head";
import App from "../App";

export default function Home() {
  return (
    <>
      <Head>
        <title>Sonarat Akışı</title>
        <meta name="description" content="Sonarat Akışı finans terminali, haber akışı, alarm merkezi ve piyasa analiz modülleri." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <App />
    </>
  );
}
