"use client"
import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="border-t dark:bg-black px-6 py-4">
            <div className="mx-auto max-w-screen-xl flex justify-between items-center">
                <div className="flex gap-6 text-sm">
                    <Link href="/terms" className="transition hover:opacity-75">
                        Terms & Conditions
                    </Link>
                    <Link href="/privacy" className="transition hover:opacity-75">
                        Privacy Policy
                    </Link>
                    <Link href="/security" className="transition hover:opacity-75">
                        Security
                    </Link>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    © 2025 Nexevo. All rights reserved.
                </p>
            </div>
        </footer>
    )
}
