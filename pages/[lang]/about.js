import Head from 'next/head'
 
export default function About({ lang }) {
    return (
      <>
        <Head>
          <title>Create Next App</title>
          <meta name="description" content={lang.f.hello} />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <main >
          <div>
            <p>
              Get started by editing&nbsp;
            </p>
            <p>
              {lang.f.hello}
            </p>
            <p>
                {lang.f.hello}
            </p>
            <p>
                {lang.s.hellos}
            </p>
            <p>
                {lang.s.hellos}
            </p>
          </div>  
          <img
                src="/vercel.svg"
                alt="Vercel Logo"
                width={100}
                height={24}
                priority
              /> 
        </main>
      </>
    )
  }
 
  export async function getStaticPaths() {
    const users = ['en','fr']
 
    const paths = users.map((user) => ({
      params: { lang: user },
    }))
 
 
    return { paths, fallback: false }
  }
 
 
  export async function getStaticProps({ params }) {
    // console.log(params)
    const lang = params.lang;
    const f = await require(`../../public/locale/${lang}/f.json`)
    const s = await require(`../../public/locale/${lang}/s.json`)
    // console.log(f);
    // const res = await fetch(`https://jsonplaceholder.typicode.com/users/${params.id}`)
    // const user = await res.json()
 
    //return { props: { lang: {f, s}} }
    return { props: { lang: {f, s}}}
  }