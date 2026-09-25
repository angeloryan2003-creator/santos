/** @type {import('next').NextConfig} */
const nextConfig = {
  // Tira o selo flutuante de desenvolvimento, que atrapalha a leitura da tela.
  devIndicators: false,
  experimental: {
    serverActions: { bodySizeLimit: '1mb' },
  },
};

export default nextConfig;
