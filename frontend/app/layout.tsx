import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

const SITE_URL = "https://bookify-blond-two.vercel.app";

export const metadata: Metadata = {
    metadataBase: new URL(SITE_URL),

    title: {
        default: "Bookify · Sistema de gestión de biblioteca full-stack",
        template: "%s · Bookify",
    },

    description:
        "Aplicación full-stack de gestión de biblioteca con Django, Next.js y PostgreSQL. Catálogo con 449 libros reales, panel de administración propio, roles de usuario y dashboard de estadísticas.",

    keywords: [
        "Bookify",
        "gestión de biblioteca",
        "catálogo de libros",
        "Django",
        "Django REST Framework",
        "Next.js",
        "React",
        "TypeScript",
        "PostgreSQL",
        "Docker",
        "full-stack",
        "portafolio",
        "Joshua Terrones",
    ],

    authors: [{ name: "Joshua Terrones", url: "https://github.com/JoshuaTerrones" }],
    creator: "Joshua Terrones",
    publisher: "Joshua Terrones",

    applicationName: "Bookify",
    category: "technology",

    alternates: {
        canonical: "/",
    },

    openGraph: {
        type: "website",
        locale: "es_PE",
        url: SITE_URL,
        siteName: "Bookify",
        title: "Bookify · Sistema de gestión de biblioteca full-stack",
        description:
            "Aplicación full-stack con Django, Next.js y PostgreSQL. Catálogo con 449 libros, panel admin propio, roles de usuario y dashboard.",
        images: [
            {
                url: "/og-image.png",
                width: 1200,
                height: 630,
                alt: "Bookify - Sistema de gestión de biblioteca",
            },
        ],
    },

    twitter: {
        card: "summary_large_image",
        title: "Bookify · Sistema de gestión de biblioteca",
        description: "Aplicación full-stack con Django, Next.js y PostgreSQL.",
        images: ["/og-image.png"],
    },

    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },

    icons: {
        icon: "/favicon.ico",
        shortcut: "/favicon.ico",
        apple: "/apple-touch-icon.png",
    },

    manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
    themeColor: [
        { media: "(prefers-color-scheme: light)", color: "#ffffff" },
        { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
    ],
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: "Bookify",
        description:
            "Sistema de gestión de biblioteca full-stack con autenticación, panel de administración propio y API REST.",
        url: SITE_URL,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        author: {
            "@type": "Person",
            name: "Joshua Terrones",
            url: "https://github.com/JoshuaTerrones",
        },
        offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
        },
    };

    return (
        <html
            lang="es"
            className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
        >
            <body className="min-h-full flex flex-col">
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
                {children}
            </body>
        </html>
    );
}