/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
      },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'bcryptjs'],
  },
  // Não definir DATABASE_URL/DIRECT_URL aqui: no build da Vercel elas podem estar vazias
  // e sobrescrever o runtime. O Prisma lê process.env em tempo de execução.
}

module.exports = nextConfig
