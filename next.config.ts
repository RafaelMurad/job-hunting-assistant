import type { NextConfig } from "next";

/**
 * Security Headers Configuration
 *
 * Comprehensive security headers to protect against common web vulnerabilities:
 * - XSS (Cross-Site Scripting)
 * - Clickjacking
 * - MIME sniffing
 * - Man-in-the-middle attacks
 *
 * @see https://nextjs.org/docs/app/api-reference/next-config-js/headers
 * @see https://securityheaders.com
 */
const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // Next.js requires 'unsafe-eval' for dev mode and 'unsafe-inline' for styles
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: https: blob:",
      "font-src 'self' https://fonts.gstatic.com",
      // AI API endpoints
      "connect-src 'self' https://api.anthropic.com https://api.openai.com https://generativelanguage.googleapis.com https://*.vercel-insights.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains; preload",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
];

const nextConfig: NextConfig = {
  /**
   * Apply security headers to all routes
   */
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },

  /**
   * Enable React strict mode for better debugging
   */
  reactStrictMode: true,

  /**
   * PoweredBy header reveals technology stack - disable for security
   */
  poweredByHeader: false,
};

export default nextConfig;
