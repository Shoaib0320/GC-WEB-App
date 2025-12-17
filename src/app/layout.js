import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import { LoaderProvider } from "../context/LoaderContext";
import GlobalLoader from "@/components/GlobalLoader";

// ✅ Complete Metadata for Software House
export const metadata = {
  title: "Globium Clouds | Software Development Company & IT Solutions Provider",
  description: "Globium Clouds is a leading software development company in Pakistan offering custom software solutions, web development, mobile apps, SaaS products, AI solutions, and digital transformation services. Partner with experts for your next project.",
  keywords: "software development company, software house Pakistan, custom software solutions, web development services, mobile app development, SaaS development, AI solutions, software outsourcing, IT solutions, digital transformation, software consulting, ecommerce development, CRM development, ERP solutions, cloud computing, blockchain development, IoT solutions, machine learning, data analytics, UI/UX design, QA testing, DevOps services, cybersecurity solutions",
  
  // ✅ Open Graph Tags
  openGraph: {
    title: "Globium Clouds | Software Development Company Pakistan",
    description: "Custom software development, web & mobile apps, AI solutions, and IT services by expert developers",
    url: "https://globiumclouds.com",
    siteName: "Globium Clouds",
    images: [
      {
        url: "https://globiumclouds.com/GCLogo-1.png",
        width: 1200,
        height: 630,
        alt: "Globium Clouds - Software Development Company",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  
  // ✅ Twitter Cards
  twitter: {
    card: "summary_large_image",
    title: "Globium Clouds | Software Development Company",
    description: "Expert software development services: Web, Mobile, AI, SaaS, and custom solutions",
    images: ["https://globiumclouds.com/GCLogo-1.png"],
    creator: "@globiumclouds",
    site: "@globiumclouds",
  },
  
  // ✅ Robots Meta
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  // ✅ Authors/Creators
  authors: [
    { name: "Globium Clouds", url: "https://globiumclouds.com" }
  ],
  creator: "Globium Clouds",
  publisher: "Globium Clouds",
  
  // ✅ Icons
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
    other: [
      {
        rel: 'manifest',
        url: '/site.webmanifest',
      },
    ],
  },
  
  // ✅ Canonical URL
  alternates: {
    canonical: "https://globiumclouds.com",
  },
  
  // ✅ Viewport
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
  
  // ✅ Theme Color
  themeColor: '#3b82f6',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* ✅ Direct Favicon Links */}
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        
        {/* ✅ Meta Tags */}
        <meta name="theme-color" content="#3b82f6" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Globium Clouds" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="Globium Clouds" />
        <meta name="msapplication-TileColor" content="#3b82f6" />
        <meta name="msapplication-TileImage" content="/mstile-144x144.png" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        
        {/* ✅ Structured Data - Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "Globium Clouds",
              "url": "https://globiumclouds.com",
              "logo": "https://globiumclouds.com/GCLogo-1.png",
              "description": "Leading software development company offering custom software solutions, web development, mobile apps, AI solutions, and digital transformation services.",
              "applicationCategory": "BusinessApplication",
              "operatingSystem": "Web, iOS, Android, Windows, macOS, Linux",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "author": {
                "@type": "Organization",
                "name": "Globium Clouds",
                "url": "https://globiumclouds.com"
              }
            })
          }}
        />
        
        {/* ✅ Structured Data - Local Business */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              "name": "Globium Clouds",
              "image": "https://globiumclouds.com/GCLogo-1.png",
              "description": "Software Development Company in Karachi, Pakistan",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "House R-84, near Al-Habeeb Restaurant, Sector 15-A/4",
                "addressLocality": "Karachi",
                "addressRegion": "Sindh",
                "addressCountry": "Pakistan",
                "postalCode": "75850"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": "24.8607",
                "longitude": "67.0011"
              },
              "url": "https://globiumclouds.com",
              "telephone": "+923352778488",
              "openingHoursSpecification": [
                {
                  "@type": "OpeningHoursSpecification",
                  "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
                  "opens": "09:00",
                  "closes": "18:00"
                }
              ],
              "priceRange": "$$",
              "sameAs": [
                "https://facebook.com/globiumclouds",
                "https://linkedin.com/company/globiumclouds",
                "https://instagram.com/globiumclouds"
              ]
            })
          }}
        />
        
        {/* ✅ Structured Data - Service List */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ItemList",
              "name": "Software Development Services",
              "description": "Complete software development services offered by Globium Clouds",
              "numberOfItems": "15",
              "itemListElement": [
                {
                  "@type": "Service",
                  "position": 1,
                  "name": "Custom Software Development",
                  "description": "Tailor-made software solutions for your specific business needs"
                },
                {
                  "@type": "Service",
                  "position": 2,
                  "name": "Web Application Development",
                  "description": "Modern web applications using React, Next.js, Angular, Vue.js"
                },
                {
                  "@type": "Service",
                  "position": 3,
                  "name": "Mobile App Development",
                  "description": "iOS & Android apps using React Native, Flutter, Swift, Kotlin"
                },
                {
                  "@type": "Service",
                  "position": 4,
                  "name": "E-commerce Solutions",
                  "description": "Online stores, marketplaces, and shopping platforms"
                },
                {
                  "@type": "Service",
                  "position": 5,
                  "name": "AI & Machine Learning",
                  "description": "Artificial Intelligence solutions, predictive analytics, chatbots"
                },
                {
                  "@type": "Service",
                  "position": 6,
                  "name": "Cloud Computing Services",
                  "description": "Cloud migration, AWS, Azure, Google Cloud solutions"
                },
                {
                  "@type": "Service",
                  "position": 7,
                  "name": "UI/UX Design",
                  "description": "User interface and user experience design services"
                },
                {
                  "@type": "Service",
                  "position": 8,
                  "name": "QA & Testing",
                  "description": "Quality assurance, automated testing, performance testing"
                },
                {
                  "@type": "Service",
                  "position": 9,
                  "name": "DevOps Services",
                  "description": "CI/CD pipelines, Docker, Kubernetes, infrastructure automation"
                },
                {
                  "@type": "Service",
                  "position": 10,
                  "name": "Blockchain Development",
                  "description": "Smart contracts, DApps, cryptocurrency solutions"
                },
                {
                  "@type": "Service",
                  "position": 11,
                  "name": "IoT Solutions",
                  "description": "Internet of Things applications and connected devices"
                },
                {
                  "@type": "Service",
                  "position": 12,
                  "name": "Digital Marketing",
                  "description": "SEO, SEM, social media marketing, content marketing"
                },
                {
                  "@type": "Service",
                  "position": 13,
                  "name": "IT Consulting",
                  "description": "Technology strategy, digital transformation consulting"
                },
                {
                  "@type": "Service",
                  "position": 14,
                  "name": "Cybersecurity Solutions",
                  "description": "Security audits, penetration testing, secure development"
                },
                {
                  "@type": "Service",
                  "position": 15,
                  "name": "Maintenance & Support",
                  "description": "24/7 technical support, software maintenance, updates"
                }
              ]
            })
          }}
        />
        
       
        
        {/* ✅ Performance Optimization */}
        <link rel="dns-prefetch" href="https://api.globiumclouds.com" />
        
      </head>
      <body className="antialiased">
        <AuthProvider>
          <LoaderProvider>
            {children}
            <GlobalLoader />
          </LoaderProvider>
        </AuthProvider>
      </body>
    </html>
  );
}