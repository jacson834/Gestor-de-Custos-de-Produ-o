import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    watch: {
      usePolling: true,
      interval: 1000,
      binaryInterval: 1000,
      ignored: ["**/node_modules/**", "**/.git/**", "**/dist/**", "**/coverage/**", "**/.nyc_output/**"],
    },
  },
  plugins: [
    react()
  ],
  resolve: {
    alias: [
      { find: '@', replacement: path.resolve(__dirname, 'src') },
    ],
  },
}));
