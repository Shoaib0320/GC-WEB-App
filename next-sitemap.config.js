/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://www.globiumclouds.com/',
  generateRobotsTxt: true,
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/private/'],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
      },
    ],
    additionalSitemaps: [
      'https://www.globiumclouds.com/server-sitemap.xml',
    ],
  },
  exclude: ['/admin/*', '/private/*'],
  changefreq: 'daily',
  priority: 0.7,
  transform: async (config, path) => {
    // Custom priority for important pages
    if (path === '/') {
      return {
        loc: path,
        changefreq: config.changefreq,
        priority: 1.0,
        lastmod: new Date().toISOString(),
      }
    }
    
    if (path === '/services') {
      return {
        loc: path,
        changefreq: 'weekly',
        priority: 0.9,
        lastmod: new Date().toISOString(),
      }
    }
    
    return {
      loc: path,
      changefreq: config.changefreq,
      priority: config.priority,
      lastmod: new Date().toISOString(),
    }
  },
}