import { generateSW } from 'workbox-build';
import path from 'path';

async function build() {
  const root = process.cwd();
  const dist = path.join(root, 'dist');

  try {
    const { count, size, warnings } = await generateSW({
      // Ensure updates go live immediately (helps on mobile where users often never hard-refresh)
      skipWaiting: true,
      clientsClaim: true,
      cleanupOutdatedCaches: true,
      globDirectory: dist,
      globPatterns: [
        '**/*.{html,js,css,svg,png,json}'
      ],
      swDest: path.join(dist, 'sw.js'),
      maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      navigateFallback: '/index.html',
      navigateFallbackDenylist: [/^\/api\//],
      runtimeCaching: [
        {
          urlPattern: /\/icons\//,
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'shamah-icons',
          },
        },
        {
          urlPattern: /\.(?:png|jpg|jpeg|svg|gif)$/,
          handler: 'StaleWhileRevalidate',
          options: { cacheName: 'images' },
        },
        {
          urlPattern: /\/api\//,
          handler: 'NetworkFirst',
          options: { cacheName: 'api' },
        },
      ],
    });

    if (warnings.length) {
      console.warn('Workbox warnings', warnings);
    }

    console.log(`Generated ${count} files, total ${size} bytes.`);
  } catch (err) {
    console.error('Workbox generation failed:', err);
    process.exit(1);
  }
}

build();
