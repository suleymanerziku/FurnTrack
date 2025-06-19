// src/app/favicon.ico.mjs
// This file is being neutralized to prevent errors.
// It will return a 204 No Content response if Next.js attempts to use it as an icon source.

export const runtime = 'edge'; // Using edge runtime for minimal overhead

/**
 * Handles GET requests to this route.
 * Returns a 204 No Content response, effectively disabling icon generation from this file.
 */
export default async function GET() {
  return new Response(null, {
    status: 204, // No Content
    headers: {
      'Content-Type': 'image/x-icon', // Required to be a valid image response type
      'Cache-Control': 'public, max-age=0, s-maxage=0, must-revalidate', // Prevent caching of "no icon"
    },
  });
}
