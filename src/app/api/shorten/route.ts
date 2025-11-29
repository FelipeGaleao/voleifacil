import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Use is.gd API (Often faster and cleaner than TinyURL)
    // Fallback to TinyURL if is.gd fails (e.g. localhost validation)
    try {
      const response = await fetch(`https://is.gd/create.php?format=simple&url=${encodeURIComponent(url)}`);
      if (response.ok) {
        const shortUrl = await response.text();
        return NextResponse.json({ shortUrl });
      }
    } catch (e) {
      console.warn('is.gd failed, falling back to tinyurl');
    }

    // Fallback: TinyURL
    const response = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`);
    
    if (!response.ok) {
      throw new Error('Failed to shorten URL');
    }

    const shortUrl = await response.text();
    return NextResponse.json({ shortUrl });
  } catch (error) {
    console.error('Shortener error:', error);
    return NextResponse.json({ error: 'Failed to shorten URL' }, { status: 500 });
  }
}
