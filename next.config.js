/** @type {import('next').NextConfig} */

/**
 * Content Security Policy (CSP): A whitelist for external resources.
 * This is a primary defense against Cross-Site Scripting (XSS) attacks.
 */
const ContentSecurityPolicy = `
  default-src 'self' https://*.supabase.co;
  script-src 'self' 'unsafe-eval' 'unsafe-inline' *.vercel-insights.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https://*.supabase.co https://dayspringaba.ca;
  connect-src *;
  font-src 'self';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
`;

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "idmsergkxsuvxvvjoibb.supabase.co",
      },
    ],
  },

  // Add custom HTTP security headers to all responses.
  async headers() {
    return [
      {
        // Apply these headers to all routes.
        source: "/:path*",
        headers: [
          // Prevents the browser from misinterpreting file types.
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          // Applies the Content Security Policy defined above.
          {
            key: "Content-Security-Policy",
            value: ContentSecurityPolicy.replace(/\s{2,}/g, " ").trim(),
          },
          // Prevents the site from being rendered in an iframe (clickjacking protection).
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          // Disables the legacy XSS auditor in favor of the modern CSP.
          {
            key: "X-XSS-Protection",
            value: "0",
          },
          // Isolates the site's browsing context to prevent cross-origin attacks.
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
