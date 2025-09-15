import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'FormSet - Create Powerful Forms, Effortlessly.';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  const montserratBold = fetch(
    new URL('./fonts/Montserrat-Bold.ttf', import.meta.url)
  ).then((res) => res.arrayBuffer());

  const montserratRegular = fetch(
    new URL('./fonts/Montserrat-Regular.ttf', import.meta.url)
  ).then((res) => res.arrayBuffer());


  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#fff',
          backgroundImage: 'linear-gradient(to bottom right, #fde6f3 0%, #e7dcf5 100%)',
          fontFamily: '"MontserratRegular"',
        }}
      >
        <div tw="flex flex-col items-center text-center p-8">
            <div tw="flex items-center text-[#e02693]">
                 <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /><path d="M14 2V8H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /><path d="M16 13H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /><path d="M16 17H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /><path d="M10 9H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
                <h1
                    style={{
                    fontSize: '96px',
                    fontFamily: '"MontserratBold"',
                    marginLeft: '16px',
                    }}
                >
                    FormSet
                </h1>
            </div>

          <p
            style={{
              fontSize: '48px',
              color: '#4a4a4a',
              marginTop: '24px',
              maxWidth: '800px'
            }}
          >
            Create Powerful Forms, Effortlessly.
          </p>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: 'MontserratBold',
          data: await montserratBold,
          style: 'normal',
          weight: 700,
        },
        {
            name: 'MontserratRegular',
            data: await montserratRegular,
            style: 'normal',
            weight: 400,
        }
      ],
    }
  );
}
