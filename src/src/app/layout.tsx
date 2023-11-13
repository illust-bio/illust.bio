import type { Metadata } from "next";
import { Noto_Sans_Mono, Noto_Sans_JP } from "next/font/google";
import "./globals.css";

export const metadata: Metadata = {
    title: "Illust.bio - Free (sub)domains for illustrators.",
    description:
        "Get a free illust.bio (sub)domain. Host your artwork portfolio, receive emails, and more!",
};

const sans = Noto_Sans_JP({
    weight: ["400", "500", "600", "700"],
    subsets: ["latin"],
    variable: "--font-sans",
});

const mono = Noto_Sans_Mono({
    weight: ["400", "700"],
    subsets: ["latin"],
    variable: "--font-mono",
});

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={`${sans.variable} ${mono.variable}`}>
                {children}
            </body>
        </html>
    );
}
