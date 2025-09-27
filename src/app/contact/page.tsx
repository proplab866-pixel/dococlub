"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useState } from "react";
import Link from "next/link";
import { facebook, instagram, mailto } from "@/constants";
import { apiRequest } from "@/utils/api";
import { useError } from "@/context/ErrorContext";

export default function ContactUsPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState(""); // local error state for form
  const { setError: setGlobalError } = useError();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess("");
    setError("");
    setLoading(true);
    try {
      const data = await apiRequest<{
        success: boolean;
        error?: string;
      }>("post", "/api/v1/contact-query", {
        data: { name, email, message },
      });
      if (data.success) {
        setSuccess(
          "Your message has been sent! Our team will contact you soon."
        );
        setName("");
        setEmail("");
        setMessage("");
      } else {
        setError(data.error || "Failed to send message. Please try again.");
        setGlobalError({
          message: data.error || "Failed to send message.",
          solution: "Please try again or contact support if the issue persists.",
          link: "/contact",
          linkText: "Contact Support",
        });
      }
    } catch {
      setError("Failed to send message. Please try again.");
      setGlobalError({
        message: "Failed to send message. Please try again.",
        solution: "Please try again or contact support if the issue persists.",
        link: "/contact",
        linkText: "Contact Support",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Hero Section */}
      <section className="relative w-full h-[320px] md:h-[400px] flex items-center justify-center overflow-hidden bg-gradient-to-br from-teal-500 to-blue-600">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="z-10 flex flex-col items-center justify-center text-center px-4"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg mb-2">
            Contact Us
          </h1>
          <p className="text-lg md:text-2xl text-white font-medium mb-6 max-w-2xl">
            Have questions or need support? Reach out to our team and we’ll be
            happy to help you on your investment journey.
          </p>
        </motion.div>
        <Image
          src="/hero.jpg"
          alt="Contact Hero"
          fill
          priority
          className="object-cover object-center w-full h-full absolute top-0 left-0 opacity-40"
        />
      </section>

      {/* Advertisement Banner */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.7 }}
        className="w-full bg-gradient-to-r from-yellow-300 to-pink-300 text-center py-3 text-lg font-semibold text-teal-900 shadow-md"
      >
        💬 Our support team is available 24/7 for all your queries!
      </motion.div>

      {/* Contact Form & Info */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start">
          {/* Contact Form */}
          <motion.form
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="bg-gray-50 rounded-2xl shadow-lg p-4 sm:p-6 md:p-8 flex flex-col gap-4 w-full"
            onSubmit={handleSubmit}
          >
            <h2 className="text-lg sm:text-xl font-bold text-teal-700 mb-2">
              Send us a message
            </h2>
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-2 text-sm font-semibold">
                {success}
              </div>
            )}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-2 text-sm font-semibold">
                {error}
              </div>
            )}
            <input
              type="text"
              placeholder="Your Name"
              className="px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg border border-gray-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none text-sm sm:text-base w-full"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />
            <input
              type="email"
              placeholder="Your Email"
              className="px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg border border-gray-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none text-sm sm:text-base w-full"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
            <textarea
              placeholder="Your Message"
              rows={5}
              className="px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg border border-gray-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none resize-none text-sm sm:text-base w-full"
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={loading}
            />
            <button
              type="submit"
              className="mt-2 px-4 py-2 sm:px-6 sm:py-2 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-full shadow transition w-full disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Message"}
            </button>
          </motion.form>
          {/* Contact Info */}
          <div className="flex flex-col gap-6 w-full items-start sm:items-center md:items-start mt-8 md:mt-0 max-md:px-4">
            <div className="flex items-center gap-3">
              <Image
                src="/Logo.svg"
                alt="Logo"
                width={36}
                height={36}
                className="rounded-full"
              />
              <span className="font-bold text-lg sm:text-xl text-teal-700">
                DocoClub
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700 mb-1 text-sm sm:text-base">
                Email
              </h3>
              <Link
                href={mailto}
                target="_blank"
                className="text-teal-600 hover:underline text-sm sm:text-base"
              >
                support@dococlub.com
              </Link>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700 mb-1 text-sm sm:text-base">
                Address
              </h3>
              <p className="text-gray-600 text-sm sm:text-base">
                23B, Investment Avenue, Mumbai, India
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700 mb-1 text-sm sm:text-base">
                Phone
              </h3>
              <a
                href="tel:18006000600"
                className="text-teal-600 hover:underline text-sm sm:text-base"
              >
                1800 6000 6000
              </a>
            </div>
            <div className="flex gap-4 mt-2">
              <Link
                href={instagram}
                aria-label="Instagram"
                target="_blank"
                className="hover:text-pink-500 transition"
              >
                <Image
                  src="/instagram.svg"
                  alt="Instagram"
                  width={24}
                  height={24}
                />
              </Link>
              <Link
                href={facebook}
                target="_blank"
                aria-label="Facebook"
                className="hover:text-blue-500 transition"
              >
                <Image
                  src="/Facebook.svg"
                  alt="Facebook"
                  width={24}
                  height={24}
                />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Promo Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="w-full bg-gradient-to-r from-pink-400 to-yellow-300 text-center py-4 text-lg font-semibold text-white shadow-lg mt-6 mb-2"
      >
        🎉 Need help? Our experts are ready to assist you 24/7. Join DocoClub
        and get priority support!
      </motion.div>
    </div>
  );
}
