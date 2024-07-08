import { createProxyMiddleware } from 'http-proxy-middleware';

// تكوين الوسيط
const proxy = createProxyMiddleware({
  target: 'https://8080-zizwar-zip2prompt-2uqzrtfq2fo.ws-eu115.gitpod.io',
  changeOrigin: true,
  pathRewrite: {
    '^/api/proxy': '', // إزالة '/api/proxy' من بداية المسار
  },
});

export default function handler(req, res) {
  // تعطيل body parser لـ Next.js
  if (req.method === 'POST') {
    return new Promise((resolve, reject) => {
      req.pipe(
        proxy(req, res, (err) => {
          if (err) {
            return reject(err);
          }
          resolve();
        })
      );
    });
  }
  
  // للطلبات غير POST
  proxy(req, res, (result) => {
    if (result instanceof Error) {
      throw result;
    }
  });
}

export const config = {
  api: {
    bodyParser: false,
  },
};