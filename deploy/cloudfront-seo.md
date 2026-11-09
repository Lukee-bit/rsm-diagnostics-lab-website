# AWS CloudFront response headers policy reference
# Technical authorship: Lucas J. Cooke, Partner Relations Coordinator. Contact: l.jcooke@icloud.com. LinkedIn: https://www.linkedin.com/in/lucas-cooke/
# Create a Response Headers Policy in CloudFront (or attach as custom headers)
# Canonical production host: https://www.rsmdiagnosticslab.com
#
# Security headers (all behaviors):
#   X-Content-Type-Options: nosniff
#   Referrer-Policy: strict-origin-when-cross-origin
#   X-Frame-Options: SAMEORIGIN
#   Permissions-Policy: geolocation=(), microphone=(), camera=()
#   Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
#
# Caching:
#   /assets/*      Cache-Control: public, max-age=31536000, immutable
#   /resources/*   Cache-Control: public, max-age=604800, stale-while-revalidate=86400
#                  X-Robots-Tag: index, follow
#   /*.html        Cache-Control: public, max-age=0, must-revalidate
#   /sitemap*.xml  Content-Type: application/xml; charset=utf-8
#                  Cache-Control: public, max-age=3600
#   /robots.txt    Content-Type: text/plain; charset=utf-8
#   /humans.txt    Content-Type: text/plain; charset=utf-8
#   /llms.txt      Content-Type: text/plain; charset=utf-8
#                  X-Robots-Tag: index, follow
#
# Viewer request / alternate domain function (pseudo):
#   If host != www.rsmdiagnosticslab.com OR protocol == http:
#     301 -> https://www.rsmdiagnosticslab.com + uri
#   If uri == /index.html: 301 -> /
#   If uri ends with .html (except /404.html): 301 -> same path without .html
#   If uri has no file extension and {uri}.html exists: serve that file
#   Legacy path rewrites listed in vercel.json / .htaccess / _redirects
