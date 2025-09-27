"use client";

import Image from "next/image";
import { referralLevel1, referralLevel2, referralLevel3 } from "@/constants";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Autoplay } from "swiper/modules";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { FaExclamationCircle } from "react-icons/fa";
import { apiRequest } from "@/utils/api";

/**
 * LandingPage - Main landing page for DocoClub
 * Responsive, modern design using Tailwind CSS
 *
 * Sections: Header, Hero, How It Works, Our Advantages, Levels, Footer
 */

type Plan = {
  _id: string;
  name: string;
  invest: number;
  daily: number;
  total: number;
  days: number;
  roi?: number;
  benefits?: string[];
  badge?: string;
  isActive?: boolean;
};

// Helper to extract error message from unknown
function getErrorMessage(err: unknown): string {
  if (typeof err === "string") return err;
  if (
    err &&
    typeof err === "object" &&
    "message" in err &&
    typeof (err as Record<string, unknown>).message === "string"
  ) {
    return (err as Record<string, unknown>).message as string;
  }
  return "An unknown error occurred.";
}

export default function Home() {
  const router = useRouter();

  // Investment plans data (dynamic)
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [plansError, setPlansError] = useState("");

  const { user: authUser } = useAuth();
  const [modal, setModal] = useState<{
    type: "login" | "balance" | "error";
    message: string;
  } | null>(null);
  const [investing, setInvesting] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlans = async () => {
      setLoadingPlans(true);
      setPlansError("");
      try {
        const data = await apiRequest<{
          success: boolean;
          plans: Plan[];
          error?: string;
        }>("get", "/api/v1/get-investment-plans");
        if (data.success) {
          setPlans(data.data.plans);
        } else {
          setPlansError(data.error || "Failed to fetch plans");
          setModal({
            type: "error",
            message: data.error || "Failed to fetch investment plans.",
          });
        }
      } catch (err: unknown) {
        const msg = getErrorMessage(err) || "Failed to fetch plans";
        setPlansError(msg);
        setModal({
          type: "error",
          message: msg || "Failed to fetch investment plans.",
        });
      } finally {
        setLoadingPlans(false);
      }
    };
    fetchPlans();
  }, []);

  // Feature/advantage icons (SVGs from public folder)
  const icons = {
    signup: (
      <Image
        src="/sign-up.svg"
        alt="Sign Up"
        width={50}
        height={50}
        className="w-16 h-16"
      />
    ),
    invest: (
      <Image
        src="/invest-money.svg"
        alt="Invest Money"
        width={50}
        height={50}
        className="w-16 h-16"
      />
    ),
    refer: (
      <Image
        src="/refer-earn.svg"
        alt="Refer & Earn"
        width={50}
        height={50}
        className="w-16 h-16"
      />
    ),
    income: (
      <Image
        src="/level-based-income.svg"
        alt="Level-Based Income"
        width={50}
        height={50}
        className="w-16 h-16"
      />
    ),
    referral: (
      <Image
        src="/refer-program.svg"
        alt="Referral Program"
        width={50}
        height={50}
        className="w-16 h-16"
      />
    ),
    secure: (
      <Image
        src="/secure-reliable.svg"
        alt="Secure & Reliable"
        width={50}
        height={50}
        className="w-16 h-16"
      />
    ),
  };

  const handleInvestNow = async (plan: Plan) => {
    if (!authUser) {
      setModal({
        type: "login",
        message: "Please login or sign up to invest in a plan.",
      });
      return;
    }
    if ((authUser.availableBalance || 0) < plan.invest) {
      setModal({
        type: "balance",
        message:
          "Insufficient balance. Please deposit funds to invest in this plan.",
      });
      return;
    }
    setInvesting(plan._id);
    try {
      const data = await apiRequest<{
        success: boolean;
        error?: string;
        availableBalance?: number;
      }>("post", "/api/v1/user/invest-in-plan", {
        data: { planId: plan._id },
      });
      if (data.success) {
        router.push("/dashboard");
      } else {
        setModal({
          type: "error",
          message: data.error || "Investment failed. Please try again.",
        });
      }
    } catch (err: unknown) {
      const msg =
        getErrorMessage(err) || "Investment failed. Please try again.";
      setModal({
        type: "error",
        message: msg,
      });
    } finally {
      setInvesting(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Hero Section with Animation */}
      <section className="relative w-full h-[420px] flex items-center justify-center overflow-hidden bg-gradient-to-br from-teal-500 to-blue-600">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="z-10 flex flex-col items-center justify-center text-center px-4"
        >
          <motion.h1
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-4xl md:text-6xl font-extrabold text-white drop-shadow-lg mb-2"
          >
            Maximize Your Earnings Online
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-lg md:text-2xl text-white font-medium mb-6"
          >
            Join DocoClub and start earning with our investment plans & referral
            program
          </motion.p>
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push("/signup")}
            className="px-8 py-3 bg-yellow-400 hover:bg-yellow-500 text-teal-900 font-bold rounded-full text-lg shadow-lg transition flex items-center gap-2"
          >
            <Image
              src="/invest-now.svg"
              alt="Invest Now"
              width={24}
              height={24}
            />
            Get Started
          </motion.button>
        </motion.div>
        <Image
          src="/hero.jpg"
          alt="Hero"
          fill
          priority
          className="object-cover object-center w-full h-full absolute top-0 left-0 opacity-40"
        />
      </section>

      {/* Advertisement/Promo Banner */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.7 }}
        className="w-full bg-gradient-to-r from-yellow-300 to-pink-300 text-center py-3 text-lg font-semibold text-teal-900 shadow-md"
      >
        🚀 Earn up to{" "}
        <span className="text-pink-700 font-bold">28% commission</span> with our
        3-level referral program! Invite friends & boost your income!
      </motion.div>

      {/* Investment Plans Carousel */}
      <section id="plans" className="py-12 bg-white">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-gray-800">
          Investment Plans
        </h2>
        {loadingPlans ? (
          <div className="text-center py-12 text-lg text-gray-500">
            Loading plans...
          </div>
        ) : plansError ? (
          <div className="text-center py-12 text-lg text-red-600">
            {plansError}
          </div>
        ) : plans.length === 0 ? (
          <div className="text-center py-12 text-lg text-gray-500">
            No plans available at the moment.
          </div>
        ) : (
          <Swiper
            spaceBetween={24}
            slidesPerView={1}
            breakpoints={{
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            className="max-w-5xl mx-auto"
            autoplay={{ delay: 2500, disableOnInteraction: false }}
            loop={true}
            modules={[Autoplay]}
          >
            {/* Insert an animated ad banner above the plans carousel */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="w-full bg-gradient-to-r from-pink-400 to-yellow-300 text-center py-4 text-xl font-bold text-white shadow-lg mb-6"
            >
              🎉 Limited Time Offer:{" "}
              <span className="text-yellow-900">Get an extra 5% bonus</span> on
              your first investment!{" "}
              <span className="hidden md:inline">
                Sign up now and maximize your returns.
              </span>
            </motion.div>
            {plans.map((plan) => (
              <SwiperSlide key={plan._id}>
                <motion.div
                  whileHover={{ scale: 1.04 }}
                  className="flex flex-col items-center gap-4 bg-gradient-to-br from-teal-100 to-blue-100 rounded-2xl shadow-lg p-8 m-2 relative"
                >
                  {/* Badge */}
                  {plan.badge && (
                    <span className="absolute top-4 right-4 bg-yellow-400 text-teal-900 text-xs font-bold px-3 py-1 rounded-full shadow animate-pulse">
                      {plan.badge}
                    </span>
                  )}
                  {/* Plan Name - new design */}
                  <div className="flex items-center justify-center mb-2">
                    <span className="text-2xl mr-2">💰</span>
                    <span
                      className="px-5 py-2 rounded-full bg-gradient-to-r from-teal-400 to-blue-400 text-white font-extrabold text-lg md:text-2xl shadow-md drop-shadow-md border-2 border-white"
                      style={{ textShadow: "0 2px 8px rgba(0,0,0,0.12)" }}
                    >
                      {plan.name}
                    </span>
                  </div>
                  <div className="font-semibold text-gray-700 text-lg">
                    Invest: ₹{plan.invest?.toLocaleString("en-IN")}
                  </div>
                  <div className="text-gray-500 text-sm">
                    Daily Income: ₹{plan.daily?.toLocaleString("en-IN")}
                  </div>
                  <div className="text-gray-500 text-sm">
                    Total Income: ₹{plan.total?.toLocaleString("en-IN")}
                  </div>
                  <div className="text-gray-500 text-sm">
                    Duration: {plan.days} days
                  </div>
                  <div className="text-green-700 font-bold text-sm">
                    ROI: {plan.roi}%
                  </div>
                  {/* Progress bar for featured plan */}
                  {plan.badge === "Best Value" && (
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: "100%" }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.2 }}
                      className="h-2 w-full bg-green-200 rounded-full overflow-hidden my-2"
                    >
                      <div
                        className="h-2 bg-green-500 rounded-full"
                        style={{ width: "100%" }}
                      ></div>
                    </motion.div>
                  )}
                  {/* Benefits */}
                  {Array.isArray(plan.benefits) && plan.benefits.length > 0 && (
                    <ul className="text-xs text-gray-600 mb-2 w-full flex flex-wrap gap-2 justify-center">
                      {plan.benefits.map((b: string, i: number) => (
                        <li
                          key={i}
                          className="bg-white border border-teal-200 rounded-full px-3 py-1 shadow-sm"
                        >
                          {b}
                        </li>
                      ))}
                    </ul>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    className="mt-2 px-6 py-2 bg-teal-500 text-white rounded-full font-bold shadow hover:bg-teal-600 transition"
                    onClick={() => handleInvestNow(plan)}
                    disabled={!!investing}
                  >
                    {investing === plan._id ? "Processing..." : "Invest Now"}
                  </motion.button>
                </motion.div>
              </SwiperSlide>
            ))}
          </Swiper>
        )}
        {/* Insert another animated ad banner below the plans carousel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="w-full bg-gradient-to-r from-teal-400 to-blue-400 text-center py-4 text-lg font-semibold text-white shadow-lg mt-6 mb-2"
        >
          💡 Did you know?{" "}
          <span className="text-yellow-200">Referring just 3 friends</span> can
          boost your earnings by up to{" "}
          <span className="text-yellow-300 font-bold">28%</span>! Share your
          referral code after signup.
        </motion.div>
      </section>

      {/* How It Works - Animated Steps */}
      <section className="py-12 bg-gray-50">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-gray-800">
          How It Works
        </h2>
        <div className="flex flex-col md:flex-row justify-center gap-8 max-w-4xl mx-auto">
          {[
            {
              icon: icons.signup,
              title: "Sign Up",
              desc: "Create your account to start earning.",
            },
            {
              icon: icons.invest,
              title: "Invest Money",
              desc: "Choose a plan and invest to grow your wealth.",
            },
            {
              icon: icons.refer,
              title: "Refer & Earn",
              desc: "Invite friends and earn multi-level commissions.",
            },
          ].map((step, idx) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.2, duration: 0.7 }}
              className="flex flex-col items-center text-center gap-2 flex-1 bg-white rounded-xl shadow p-6"
            >
              {step.icon}
              <span className="font-semibold text-gray-700 text-lg">
                {step.title}
              </span>
              <span className="text-gray-500 text-sm">{step.desc}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Advantages/Features - Animated */}
      <section className="py-12 bg-white">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-gray-800">
          Why Choose DocoClub?
        </h2>
        <div className="flex flex-col md:flex-row justify-center gap-8 max-w-4xl mx-auto">
          {[
            {
              icon: icons.income,
              title: "Level-Based Income",
              desc: "Boost your earnings with our 3-level referral system.",
            },
            {
              icon: icons.referral,
              title: "Referral Program",
              desc: "Earn up to 28% commission from your network.",
            },
            {
              icon: icons.secure,
              title: "Secure & Reliable",
              desc: "Your data and earnings are protected with us.",
            },
          ].map((feature, idx) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.2, duration: 0.7 }}
              className="flex flex-col items-center text-center gap-2 flex-1 bg-gray-50 rounded-xl shadow p-6"
            >
              {feature.icon}
              <span className="font-semibold text-gray-700 text-lg">
                {feature.title}
              </span>
              <span className="text-gray-500 text-sm">{feature.desc}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials Carousel */}
      <section className="py-12 bg-gray-50">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-gray-800">
          Success Stories
        </h2>
        <Swiper
          spaceBetween={24}
          slidesPerView={1}
          breakpoints={{
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          className="max-w-5xl mx-auto"
          autoplay={{ delay: 4000, disableOnInteraction: false }}
          loop={true}
          modules={[Autoplay]}
        >
          {[
            {
              name: "Amit S.",
              text: "I doubled my investment in just 30 days! The referral program is a game changer.",
            },
            {
              name: "Priya K.",
              text: "DocoClub is the best platform for passive income. Super easy and secure!",
            },
            {
              name: "Rahul D.",
              text: "The daily income and instant payouts are amazing. Highly recommended!",
            },
          ].map((testimonial, idx) => (
            <SwiperSlide key={idx}>
              <motion.div
                whileHover={{ scale: 1.04 }}
                className="flex flex-col items-center gap-4 bg-white rounded-2xl shadow-lg p-8 m-2 border border-teal-100"
              >
                <div className="w-16 h-16 rounded-full bg-teal-200 flex items-center justify-center text-2xl font-bold text-teal-700 mb-2">
                  {testimonial.name[0]}
                </div>
                <div className="text-gray-700 text-base italic mb-2">
                  “{testimonial.text}”
                </div>
                <div className="font-semibold text-teal-700">
                  {testimonial.name}
                </div>
              </motion.div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* 1. Floating sticky banner (bottom right) */}
      <div className="fixed bottom-4 right-4 z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 1 }}
          className="bg-gradient-to-r from-pink-500 to-yellow-400 text-white font-bold px-6 py-3 rounded-full shadow-lg flex items-center gap-2 animate-bounce cursor-pointer hover:scale-105 hover:shadow-2xl transition"
          onClick={() => window.open("/signup", "_self")}
        >
          <span className="text-2xl">🔥</span>
          Limited seats for <span className="underline">VIP Plan</span>!
        </motion.div>
      </div>

      {/* 2. Large promo card between 'How It Works' and 'Why Choose DocoClub?' */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="max-w-3xl mx-auto my-10 bg-gradient-to-br from-yellow-200 to-pink-100 rounded-3xl shadow-xl p-8 flex flex-col md:flex-row items-center gap-6 border-2 border-yellow-300"
      >
        <div className="flex-shrink-0">
          <Image src="/sign-up.svg" alt="Free eBook" width={80} height={80} />
        </div>
        <div className="flex-1 text-center md:text-left">
          <div className="text-2xl md:text-3xl font-extrabold text-pink-700 mb-2">
            Join now & get a FREE eBook!
          </div>
          <div className="text-gray-700 mb-3">
            Sign up today and receive our exclusive guide:{" "}
            <span className="font-semibold text-teal-700">
              “Smart Investing for Beginners”
            </span>{" "}
            — absolutely free!
          </div>
          <button
            onClick={() => router.push("/signup")}
            className="px-6 py-2 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-full shadow transition"
          >
            Claim Your Gift
          </button>
        </div>
      </motion.div>

      {/* 3. Referral program highlight section before testimonials */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="p-10 bg-gradient-to-r from-teal-100 to-blue-100 my-8 rounded-2xl max-w-5xl mx-auto shadow-lg border border-teal-200 flex flex-col md:flex-row items-center gap-6"
      >
        <div className="flex-shrink-0 flex items-center justify-center w-24 h-24 rounded-full bg-yellow-300">
          <Image src="/refer-earn.svg" alt="Referral" width={60} height={60} />
        </div>
        <div className="flex-1 text-center md:text-left">
          <div className="text-2xl md:text-3xl font-extrabold text-teal-700 mb-2">
            Referral Rewards
          </div>
          <div className="text-gray-700 mb-2">
            Invite your friends and{" "}
            <span className="font-bold text-pink-600">
              earn up to 28% commission
            </span>{" "}
            across 3 levels! The more you share, the more you earn.
          </div>
          <div className="flex flex-wrap gap-2 justify-center md:justify-start mt-2">
            <span className="bg-pink-200 text-pink-700 px-4 py-1 rounded-full font-semibold text-sm">
              Level 1: {referralLevel1}%
            </span>
            <span className="bg-yellow-200 text-yellow-700 px-4 py-1 rounded-full font-semibold text-sm">
              Level 2: {referralLevel2}%
            </span>
            <span className="bg-teal-200 text-teal-700 px-4 py-1 rounded-full font-semibold text-sm">
              Level 3: {referralLevel3}%
            </span>
          </div>
          <button
            onClick={() => router.push("/signup")}
            className="mt-4 px-6 py-2 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-full shadow transition"
          >
            Start Referring
          </button>
        </div>
      </motion.section>

      {/* Modal for login, balance, or error */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full relative flex flex-col items-center"
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-2xl font-bold"
              onClick={() => setModal(null)}
              aria-label="Close"
            >
              &times;
            </button>
            <div className="flex flex-col items-center mb-4">
              <FaExclamationCircle className="text-red-500 text-4xl mb-2 animate-bounce" />
              <div className="text-lg font-bold text-gray-800 mb-1">
                {modal.type === "login"
                  ? "Login Required"
                  : modal.type === "balance"
                  ? "Insufficient Balance"
                  : "Error"}
              </div>
              <div className="text-gray-600 text-center mb-2">
                {modal.message}
              </div>
            </div>
            {modal.type === "login" && (
              <div className="flex gap-3 mt-2">
                <button
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700 transition"
                  onClick={() => router.push("/login")}
                >
                  Login
                </button>
                <button
                  className="px-6 py-2 bg-yellow-400 text-teal-900 rounded-lg font-bold shadow hover:bg-yellow-500 transition"
                  onClick={() => router.push("/signup")}
                >
                  Sign Up
                </button>
              </div>
            )}
            {modal.type === "balance" && (
              <button
                className="mt-2 px-6 py-2 bg-teal-500 text-white rounded-lg font-semibold shadow hover:bg-teal-600 transition"
                onClick={() => {
                  setModal(null);
                  router.push("/dashboard");
                }}
              >
                Go to Dashboard
              </button>
            )}
            {modal.type === "error" && (
              <button
                className="mt-2 px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold shadow hover:bg-gray-300 transition"
                onClick={() => setModal(null)}
              >
                Close
              </button>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
