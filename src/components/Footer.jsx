"use client";

import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Linkedin, Twitter, Github, Mail } from "lucide-react";

export default function Footer() {
    return (
        <footer className="bg-gray-900 dark:bg-slate-900 text-white mt-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Branding */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Image src="/images/logo-02.png" alt="Globium Clouds" width={40} height={40} className="rounded-sm" />
                        <span className="text-lg font-semibold">Globium Clouds</span>
                    </div>
                    <p className="text-sm text-gray-300 max-w-xs">
                        Building reliable cloud and dashboard solutions for businesses. Manage users, bookings, attendance and more — all in one place.
                    </p>

                    <div className="flex items-center space-x-3">
                        <a href="#" aria-label="LinkedIn" className="text-gray-300 hover:text-white">
                            <Linkedin className="w-5 h-5" />
                        </a>
                        <a href="#" aria-label="Twitter" className="text-gray-300 hover:text-white">
                            <Twitter className="w-5 h-5" />
                        </a>
                        <a href="#" aria-label="Github" className="text-gray-300 hover:text-white">
                            <Github className="w-5 h-5" />
                        </a>
                    </div>
                </div>

                {/* Quick Links */}
                <div>
                    <h4 className="text-sm font-semibold mb-3">Quick links</h4>
                    <ul className="space-y-2 text-sm text-gray-300">
                        <li><a href="#home" className="hover:text-white">Home</a></li>
                        <li><a href="#services" className="hover:text-white">Services</a></li>
                        <li><a href="#portfolio" className="hover:text-white">Portfolio</a></li>
                        <li><a href="#team" className="hover:text-white">Team</a></li>
                        <li><a href="#contact" className="hover:text-white">Contact</a></li>
                        <li><a href="/agent/login" className="hover:text-white">Agent</a></li>
                        <li><a href="/login" className="hover:text-white">User</a></li>
                    </ul>
                </div>

                {/* Contact */}
                <div>
                    <h4 className="text-sm font-semibold mb-3">Contact</h4>
                    <p className="text-sm text-gray-300">Email: <a href="mailto:hello@globiumclouds.com" className="hover:text-white">hello@globiumclouds.com</a></p>
                    <p className="text-sm text-gray-300">Phone: <a href="tel:+1234567890" className="hover:text-white">+1 (234) 567-890</a></p>
                    <p className="text-sm text-gray-300 mt-2">Address: 123 Cloud Ave, Suite 400, City, Country</p>
                </div>

                {/* Newsletter */}
                <div>
                    <h4 className="text-sm font-semibold mb-3">Subscribe</h4>
                    <p className="text-sm text-gray-300 mb-3">Get updates, product news and discounts.</p>
                    <div className="flex gap-2">
                        <Input aria-label="Email" placeholder="your@email.com" />
                        <Button className="whitespace-nowrap">Subscribe</Button>
                    </div>
                    <p className="text-xs text-gray-400 mt-3 flex items-center gap-2"><Mail className="w-3 h-3" /> We respect your privacy.</p>
                </div>
            </div>

            <div className="border-t border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items.center justify-between text-xs text-gray-400">
                    <div>© {new Date().getFullYear()} Globium Clouds. All rights reserved.</div>
                    <div className="space-x-4 mt-2 sm:mt-0">
                        <a href="#" className="hover:text-white">Privacy</a>
                        <a href="#" className="hover:text-white">Terms</a>
                        <a href="#" className="hover:text-white">Sitemap</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
