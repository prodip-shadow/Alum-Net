/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // এটি যেকোনো ওয়েবসাইটের ডোমেন অ্যাক্সেস করার অনুমতি দেবে
      },
      {
        protocol: 'http',
        hostname: '**', // সিকিউর ছাড়া (http) সাইটগুলোর জন্যও অনুমতি দেবে
      },
    ],
  },
};

export default nextConfig;
