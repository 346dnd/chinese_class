// @ts-nocheck
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// 代理目标可经环境变量覆盖，便于异地/穿透场景：
//   API_PROXY_TARGET       后端 API
//   STORAGE_PROXY_TARGET   存储/TTS 服务
// 默认：192.168.3.22:8080 / 192.168.3.22:8088 （同局域网）
// 注：2026-08-20 试过连学校 VPN 用 2.0.0.1，实测 2.0.0.1 是【本机】VPN 虚拟网卡地址
//     （ping TTL=128、本机无 8080 监听、ECONNREFUSED），不可用于连后端。
//     异地连后端应填【后端机】真实可达地址（其 VPN 地址或公网隧道 URL）。
export default defineConfig(({ mode }) => {
  const apiTarget = process.env.API_PROXY_TARGET || 'http://192.168.3.22:8080'
  const storageTarget = process.env.STORAGE_PROXY_TARGET || 'http://192.168.3.22:8088'

  return {
    plugins: [vue()],
    resolve: {
      alias: {
        '@': process.cwd() + '/src'
      }
    },
    server: {
      port: 5173,
      host: true,
      // 开发期代理：浏览器只访问同源 /api、/storage，由 dev server 转发到目标，
      // 从而绕开跨域、且异地时只需把目标指到后端公网隧道地址。
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true
        },
        '/storage': {
          target: storageTarget,
          changeOrigin: true
        },
        // 互动视频 style-interact.mp4 由 storage 服务(8088) 在 /assets 下提供
        '/assets': {
          target: storageTarget,
          changeOrigin: true
        }
      }
    }
  }
})
