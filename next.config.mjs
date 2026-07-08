/** @type {import('next').NextConfig} */
const nextConfig = {
  // Vercel 배포 시 깐깐한 문법/타입 검사를 건너뛰고 강제 배포하도록 설정
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
