import { defineConfig } from "vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import { viteSingleFile } from "vite-plugin-singlefile";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), babel({ presets: [reactCompilerPreset()] }), viteSingleFile(), tailwindcss()],
  define: {
    '__IS_LOCAL__': process.env.CI !== 'true' || process.env.GITHUB_REF === 'refs/heads/dev'
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5174,
    proxy: {
      // DEV: aion.ing 크롤링 프록시 (CORS 우회 및 웹 브라우저 위장)
      '/proxy-aion': {
        target: 'https://aion.ing',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/proxy-aion/, ''),
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
          'Referer': 'https://aion.ing/',
          'Origin': 'https://aion.ing',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
          'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7'
        }
      },
      // DEV: cielui.com API 요청 → localhost:5173 (aion 개발서버)으로 프록시
      '/api/meter': {
        target: 'http://localhost:5173',
        changeOrigin: true,
      },
    }
  }
});
