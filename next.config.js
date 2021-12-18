/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  images: {
    domains: ['dawnofwar.info', 'steamcdn-a.akamaihd.net']
  },
  basePath: process.env.BASE_PATH
}
