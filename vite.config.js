import { defineConfig } from 'vite';
import { readdirSync, existsSync, createReadStream, copyFileSync, mkdirSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const IMAGES_DIR = resolve(__dirname, 'public/images');
const AUDIO_DIR = resolve(__dirname, 'audio');
const PUBLIC_AUDIO_DIR = resolve(__dirname, 'public/audio');

function imageListPlugin() {
  const virtualModuleId = 'virtual:image-list';
  const resolvedVirtualModuleId = '\0' + virtualModuleId;

  const getImages = () => {
    let files = [];
    try {
      if (existsSync(IMAGES_DIR)) {
        files = readdirSync(IMAGES_DIR)
          .filter(f => /\.(jpg|jpeg|png|webp|JPG|JPEG|PNG)$/i.test(f))
          .map(f => `/images/${f}`);
      }
    } catch (e) {
      files = [];
    }
    return files;
  };

  return {
    name: 'image-list-plugin',
    resolveId(id) {
      if (id === virtualModuleId) return resolvedVirtualModuleId;
    },
    load(id) {
      if (id === resolvedVirtualModuleId) {
        const files = getImages();
        // Also write manifest.json to public/images for fallback
        try {
          if (existsSync(IMAGES_DIR)) {
            writeFileSync(resolve(IMAGES_DIR, 'manifest.json'), JSON.stringify(files, null, 2));
          }
        } catch (e) {}
        return `export const images = ${JSON.stringify(files)};`;
      }
    },
    configureServer(server) {
      // Serve files from root audio/ or public/audio/ if requested at /audio/
      server.middlewares.use((req, res, next) => {
        if (req.url && req.url.startsWith('/audio/')) {
          const fileName = req.url.replace(/^\/audio\//, '').split('?')[0];
          let audioPath = resolve(AUDIO_DIR, decodeURIComponent(fileName));
          if (!existsSync(audioPath)) {
            audioPath = resolve(PUBLIC_AUDIO_DIR, decodeURIComponent(fileName));
          }
          if (!existsSync(audioPath)) {
            const findMp3 = (dir) => {
              if (existsSync(dir)) {
                const list = readdirSync(dir).filter(f => /\.mp3$/i.test(f));
                if (list.length > 0) return resolve(dir, list[0]);
              }
              return null;
            };
            audioPath = findMp3(AUDIO_DIR) || findMp3(PUBLIC_AUDIO_DIR);
          }
          if (audioPath && existsSync(audioPath)) {
            res.setHeader('Content-Type', 'audio/mpeg');
            return createReadStream(audioPath).pipe(res);
          }
        }
        next();
      });
    },
    closeBundle() {
      // Copy root audio files to dist/audio if any exist
      try {
        const outAudioDir = resolve(__dirname, 'dist/audio');
        if (!existsSync(outAudioDir)) {
          mkdirSync(outAudioDir, { recursive: true });
        }
        const copyFrom = (dir) => {
          if (existsSync(dir)) {
            const files = readdirSync(dir).filter(f => /\.mp3$/i.test(f));
            files.forEach(file => {
              const srcFile = resolve(dir, file);
              const destFile = resolve(outAudioDir, 'music.mp3');
              copyFileSync(srcFile, destFile);
            });
          }
        };
        copyFrom(AUDIO_DIR);
        copyFrom(PUBLIC_AUDIO_DIR);
      } catch (e) {}

      // Ensure manifest.json is in dist/images
      try {
        const files = getImages();
        const outImagesDir = resolve(__dirname, 'dist/images');
        if (!existsSync(outImagesDir)) {
          mkdirSync(outImagesDir, { recursive: true });
        }
        writeFileSync(resolve(outImagesDir, 'manifest.json'), JSON.stringify(files, null, 2));
      } catch (e) {}
    }
  };
}

export default defineConfig({
  base: './',
  root: '.',
  publicDir: 'public',
  plugins: [imageListPlugin()],
  build: {
    outDir: 'dist',
    assetsInlineLimit: 4096,
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
          gsap: ['gsap'],
        },
      },
    },
  },
  server: {
    port: 5173,
    host: true,
  },
});
