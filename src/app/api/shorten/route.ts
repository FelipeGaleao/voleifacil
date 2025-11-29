import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Priority 1: PXL.to (Requires API Key)
    const pxlKey = process.env.PXL_API_KEY;
    if (pxlKey) {
      try {
        const response = await fetch("https://api.pxl.to/api/v1/short", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept-Encoding": "gzip",
            "Authorization": `Bearer ${pxlKey}`,
          },
          body: JSON.stringify({ destination: url }),
        });

        if (response.ok) {
          const data = await response.json();
          // Try to find the short link in common fields
          const shortUrl = data.short_url || data.link || data.data?.link || data.data?.short_url;
          if (shortUrl) {
            return NextResponse.json({ shortUrl });
          }
        }
      } catch (e) {
        console.warn("PXL.to failed", e);
      }
    }

    // Priority 2: is.gd (Free, No Auth)
    try {
      const response = await fetch(`https://is.gd/create.php?format=simple&url=${encodeURIComponent(url)}`);
      if (response.ok) {
        const shortUrl = await response.text();
        return NextResponse.json({ shortUrl });
      }
    } catch (e) {
      console.warn('is.gd failed', e);
    }



    // Priority 3: TinyURL (Fallback - Works with localhost)
    try {
      const response = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`);
      
      if (response.ok) {
        const shortUrl = await response.text();
        return NextResponse.json({ shortUrl });
      }
    } catch (e) {
      console.warn('TinyURL failed', e);
    }

    return NextResponse.json({ error: 'Failed to shorten URL' }, { status: 500 });
  } catch (error) {
    console.error('Shortener error:', error);
    return NextResponse.json({ error: 'Failed to shorten URL' }, { status: 500 });
  }
}
