import createMDX from '@next/mdx'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure `pageExtensions` to include markdown and MDX files
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  
  // Add performance optimizations
  reactStrictMode: true,
  
  // Optimize images
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      // Add remote patterns if you have external image sources
    ],
  },
  
  // Configure build output for better production performance
  output: 'standalone',
  
  // Server external packages (moved from experimental)
  serverExternalPackages: [],
  
  // Improve performance of large pages
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  
  // Configure experimental features for better performance
  experimental: {
    // Optimize middleware
    optimizePackageImports: ['lucide-react'],
  },
}

const withMDX = createMDX({
  // Add markdown plugins here, as desired
  options: {
    // Don't use any plugins that might cause compatibility issues
    remarkPlugins: [],
    rehypePlugins: [],
  },
})

// Merge MDX config with Next.js config
export default withMDX(nextConfig)

