"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function AboutUsPage() {
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
            About DocoClub
          </h1>
          <p className="text-lg md:text-2xl text-white font-medium mb-6 max-w-2xl">
            Empowering everyone to grow their wealth through smart investments
            and a powerful referral network.
          </p>
        </motion.div>
        <Image
          src="/hero.jpg"
          alt="About Hero"
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
        🚀 Join DocoClub today and unlock exclusive investment opportunities!
      </motion.div>

      {/* Company Mission Section */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
            Our Mission
          </h2>
          <p className="text-gray-600 text-lg mb-6">
            At DocoClub, our mission is to make wealth-building accessible to
            everyone. We believe in transparency, community, and empowering our
            members to achieve financial freedom through innovative investment
            plans and a rewarding referral system.
          </p>
          <div className="flex flex-col md:flex-row gap-8 justify-center mt-8">
            <div className="flex flex-col items-center flex-1">
              <Image
                src="/secure-reliable.svg"
                alt="Secure"
                width={60}
                height={60}
              />
              <h3 className="font-semibold text-teal-700 mt-2 mb-1">
                Secure & Reliable
              </h3>
              <p className="text-gray-500 text-sm">
                Your data and investments are protected with industry-leading
                security.
              </p>
            </div>
            <div className="flex flex-col items-center flex-1">
              <Image
                src="/refer-program.svg"
                alt="Community"
                width={60}
                height={60}
              />
              <h3 className="font-semibold text-teal-700 mt-2 mb-1">
                Community Driven
              </h3>
              <p className="text-gray-500 text-sm">
                Grow together with our multi-level referral program and
                supportive network.
              </p>
            </div>
            <div className="flex flex-col items-center flex-1">
              <Image
                src="/invest-money.svg"
                alt="Growth"
                width={60}
                height={60}
              />
              <h3 className="font-semibold text-teal-700 mt-2 mb-1">
                Smart Growth
              </h3>
              <p className="text-gray-500 text-sm">
                Choose from a variety of plans designed for steady, sustainable
                returns.
              </p>
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
        className="w-full bg-gradient-to-r from-teal-400 to-blue-400 text-center py-4 text-lg font-semibold text-white shadow-lg mt-6 mb-2"
      >
        💡 Did you know?{" "}
        <span className="text-yellow-200">Referring friends</span> can boost
        your earnings by up to{" "}
        <span className="text-yellow-300 font-bold">28%</span>!
      </motion.div>

      {/* Team/Values Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
            Our Values
          </h2>
          <div className="flex flex-col md:flex-row gap-8 justify-center mt-8">
            <div className="flex flex-col items-center flex-1">
              <Image
                src="/level-based-income.svg"
                alt="Transparency"
                width={60}
                height={60}
              />
              <h3 className="font-semibold text-teal-700 mt-2 mb-1">
                Transparency
              </h3>
              <p className="text-gray-500 text-sm">
                Clear, honest communication and reporting for all members.
              </p>
            </div>
            <div className="flex flex-col items-center flex-1">
              <Image src="/sign-up.svg" alt="Support" width={60} height={60} />
              <h3 className="font-semibold text-teal-700 mt-2 mb-1">Support</h3>
              <p className="text-gray-500 text-sm">
                Our team is here to help you succeed at every step.
              </p>
            </div>
            <div className="flex flex-col items-center flex-1">
              <Image
                src="/refer-earn.svg"
                alt="Innovation"
                width={60}
                height={60}
              />
              <h3 className="font-semibold text-teal-700 mt-2 mb-1">
                Innovation
              </h3>
              <p className="text-gray-500 text-sm">
                We constantly improve our platform to offer the best experience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Add an ad banner after the mission section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="w-full bg-gradient-to-r from-pink-400 to-yellow-300 text-center py-4 text-lg font-semibold text-white shadow-lg mt-6 mb-2"
      >
        🎉 Special Offer: Get a bonus on your first investment when you join
        DocoClub today!
      </motion.div>

      {/* Add an ad banner before the footer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="w-full bg-gradient-to-r from-blue-400 to-teal-400 text-center py-4 text-lg font-semibold text-white shadow-lg mt-6 mb-2"
      >
        🚀 Invite friends and earn up to 28% commission with our referral
        program!
      </motion.div>
    </div>
  );
}
