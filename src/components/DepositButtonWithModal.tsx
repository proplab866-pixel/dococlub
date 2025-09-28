
// import React, { useState, ChangeEvent, FormEvent, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import Image from "next/image";
// import { apiRequest } from "@/utils/api";
// import { log } from "console";

// export function DepositButtonWithModal() {
//   const [showModal, setShowModal] = useState(false);
//   const [step, setStep] = useState<"amount" | "qr" | "loading" | "success">("amount");
//   const [amount, setAmount] = useState("");
//   const [utrNumber, setUtrNumber] = useState("");

//   const handleAmountChange = (e: ChangeEvent<HTMLInputElement>) => setAmount(e.target.value);
//   const handleUtrChange = (e: ChangeEvent<HTMLInputElement>) => setUtrNumber(e.target.value);

//   const handleStartPayment = (e: FormEvent) => {
//     e.preventDefault();
//     if (!amount || parseInt(amount) <= 0) {
//       alert("Please enter a valid amount.");
//       return;
//     }
//     setStep("qr"); // move to QR step
//   };

//   const handleSubmitUtr = () => {
//     if (!utrNumber.trim()) {
//       alert("Please enter your UTR number after payment.");
//       return;
//     }
//     setStep("loading"); // trigger API call
//   };

//   const handleClose = () => {
//     setShowModal(false);
//     setStep("amount");
//     setAmount("");
//     setUtrNumber("");
//   };

//   // ✅ Call deposit API when step becomes "loading"
//   useEffect(() => {
//    if (step === "loading") {
//     const submitDeposit = async () => {
//       try {
//         const data = await apiRequest<{
//           success: boolean;
//           balance?: number;
//           error?: string;
//         }>(
//           "post",
//           "/api/v1/payments/verify", // replace with your actual API route
//           {
//             data: { amount: Number(amount), utrNumber },
//           }
//         );

//         if (!data.success) throw new Error(data.error || "Deposit failed");

//         // Deposit success
//         setStep("success");
//       } catch (err: unknown) {
//         alert(err); // or setError state
//         setStep("qr"); // go back to UTR input for retry
//       }
//     };

//     submitDeposit();
//   }

//   }, [step, amount, utrNumber]);

//   return (
//     <>
//       <button
//         className="bg-yellow-500 text-white font-semibold px-4 py-2 rounded-xl shadow hover:bg-yellow-600 transition"
//         onClick={() => setShowModal(true)}
//       >
//         Deposit
//       </button>

//       <AnimatePresence>
//         {showModal && (
//           <motion.div
//             className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//           >
//             <motion.div
//               className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm relative text-center"
//               initial={{ scale: 0.9, y: 40, opacity: 0 }}
//               animate={{ scale: 1, y: 0, opacity: 1 }}
//               exit={{ scale: 0.9, y: 40, opacity: 0 }}
//               transition={{ type: "spring", stiffness: 300, damping: 25 }}
//             >
//               <button
//                 className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-xl font-bold"
//                 onClick={handleClose}
//               >
//                 ×
//               </button>

//               {step === "amount" && (
//                 <>
//                   <h2 className="text-xl font-bold mb-4 text-gray-800">Enter Deposit Amount</h2>
//                   <form onSubmit={handleStartPayment} className="flex flex-col gap-4">
//                     <input
//                       type="number"
//                       min={1}
//                       placeholder="Enter amount in ₹"
//                       value={amount}
//                       onChange={handleAmountChange}
//                       required
//                       className="border border-gray-300 rounded-lg px-3 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
//                       autoFocus
//                     />
//                     <button
//                       type="submit"
//                       className="bg-yellow-500 text-white font-semibold px-4 py-2 rounded-lg shadow hover:bg-yellow-600 transition"
//                     >
//                       Pay
//                     </button>
//                   </form>
//                 </>
//               )}

//               {step === "qr" && (
//                 <>
//                   <h2 className="text-xl font-bold mb-4 text-gray-800">Scan & Pay</h2>
//                   <Image
//                     src="/qr.jpeg"
//                     alt="Payment QR Code"
//                     width={200}
//                     height={200}
//                     className="w-full h-full mx-auto rounded-lg border shadow mb-4"
//                   />
//                   <input
//                     type="text"
//                     placeholder="Enter UTR number"
//                     value={utrNumber}
//                     onChange={handleUtrChange}
//                     className="border border-gray-300 rounded-lg px-3 py-2 text-lg w-full focus:outline-none focus:ring-2 focus:ring-yellow-400 mb-4"
//                   />
//                   <button
//                     onClick={handleSubmitUtr}
//                     className="bg-yellow-500 text-white font-semibold px-4 py-2 rounded-lg shadow hover:bg-yellow-600 transition w-full"
//                   >
//                     Submit UTR
//                   </button>
//                 </>
//               )}

//               {step === "loading" && (
//                 <>
//                   <h2 className="text-xl font-bold mb-4 text-gray-800">Verifying Payment...</h2>
//                   <div className="flex justify-center items-center">
//                     <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
//                   </div>
//                   <p className="text-gray-600 mt-4 text-sm">Please wait while we confirm your payment.</p>
//                 </>
//               )}

//               {step === "success" && (
//                 <>
//                   <h2 className="text-xl font-bold mb-4 text-green-600">Payment Successful 🎉</h2>
//                   <p className="text-gray-700">Your deposit of ₹{amount} has been received. Your account will be updated soon.</p>
//                   <button
//                     onClick={handleClose}
//                     className="mt-4 bg-green-500 text-white font-semibold px-4 py-2 rounded-lg shadow hover:bg-green-600 transition w-full"
//                   >
//                     Close
//                   </button>
//                 </>
//               )}
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </>
//   );
// }

import React, { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { apiRequest } from "@/utils/api";

export function DepositButtonWithModal() {
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState<"amount" | "qr" | "loading" | "success">("amount");
  const [amount, setAmount] = useState("");
  const [utrNumber, setUtrNumber] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [loadingQr, setLoadingQr] = useState(false);

  const handleAmountChange = (e: ChangeEvent<HTMLInputElement>) => setAmount(e.target.value);
  const handleUtrChange = (e: ChangeEvent<HTMLInputElement>) => setUtrNumber(e.target.value);

  const handleStartPayment = (e: FormEvent) => {
    e.preventDefault();
    if (!amount || parseInt(amount) <= 0) {
      alert("Please enter a valid amount.");
      return;
    }
    setStep("qr"); // move to QR step
    fetchQRCode(); // fetch QR when entering QR step
  };

  const handleSubmitUtr = () => {
    if (!utrNumber.trim()) {
      alert("Please enter your UTR number after payment.");
      return;
    }
    setStep("loading"); // trigger API call
  };

  const handleClose = () => {
    setShowModal(false);
    setStep("amount");
    setAmount("");
    setUtrNumber("");
    setQrCodeUrl(null);
  };

  // ✅ Fetch QR code from API
  const fetchQRCode = async () => {
    try {
      setLoadingQr(true);
      const res = await fetch("/api/v1/qrcode/getqrcode");
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        setQrCodeUrl(url);
      } else {
        setQrCodeUrl(null);
      }
    } catch (err) {
      console.error("Error fetching QR:", err);
      setQrCodeUrl(null);
    } finally {
      setLoadingQr(false);
    }
  };

  // ✅ Call deposit API when step becomes "loading"
  useEffect(() => {
    if (step === "loading") {
      const submitDeposit = async () => {
        try {
          const data = await apiRequest<{ success: boolean; balance?: number; error?: string }>(
            "post",
            "/api/v1/payments/verify",
            { data: { amount: Number(amount), utrNumber } }
          );

          if (!data.success) throw new Error(data.error || "Deposit failed");

          // Deposit success
          setStep("success");
        } catch (err: unknown) {
          alert(err);
          setStep("qr"); // go back to UTR input for retry
        }
      };
      submitDeposit();
    }
  }, [step, amount, utrNumber]);

  return (
    <>
      <button
        className="bg-yellow-500 text-white font-semibold px-4 py-2 rounded-xl shadow hover:bg-yellow-600 transition"
        onClick={() => setShowModal(true)}
      >
        Deposit
      </button>

      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm relative text-center"
              initial={{ scale: 0.9, y: 40, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 40, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <button
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-xl font-bold"
                onClick={handleClose}
              >
                ×
              </button>

              {step === "amount" && (
                <>
                  <h2 className="text-xl font-bold mb-4 text-gray-800">Enter Deposit Amount</h2>
                  <form onSubmit={handleStartPayment} className="flex flex-col gap-4">
                    <input
                      type="number"
                      min={1050} // optional, just to give HTML hint
                      placeholder="Enter amount in ₹"
                      value={amount}
                      onChange={handleAmountChange}
                      required
                      className="border border-gray-300 rounded-lg px-3 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      autoFocus
                    />
                    <p className="text-gray-600 text-sm">
                      Minimum pay: ₹1,050 - ₹100,000
                    </p>
                    <button
                      type="submit"
                      disabled={Number(amount) < 1050} // ✅ disable if less than 1050
                      className={`bg-yellow-500 text-white font-semibold px-4 py-2 rounded-lg shadow hover:bg-yellow-600 transition ${Number(amount) < 1050 ? "opacity-50 cursor-not-allowed hover:bg-yellow-500" : ""
                        }`}
                    >
                      Pay
                    </button>
                  </form>
                </>
              )}

              {step === "qr" && (
                <>
                  <h2 className="text-xl font-bold mb-4 text-gray-800">Scan & Pay</h2>
                  {loadingQr ? (
                    <p className="text-gray-600 my-4">Loading QR code...</p>
                  ) : qrCodeUrl ? (
                    <Image
                      src={qrCodeUrl}
                      alt="Payment QR Code"
                      width={200}
                      height={200}
                      className="w-full h-full mx-auto rounded-lg border shadow mb-4"
                    />
                  ) : (
                    <p className="text-red-500">Failed to load QR code. Try again.</p>
                  )}
                  <p className="text-gray-600 text-sm my-4">
                    Minimum pay: ₹1,050 - ₹100,000
                  </p>
                  <input
                    type="text"
                    placeholder="Enter UTR number"
                    value={utrNumber}
                    onChange={handleUtrChange}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-lg w-full focus:outline-none focus:ring-2 focus:ring-yellow-400 mb-4"
                  />
                  <button
                    onClick={handleSubmitUtr}
                    className="bg-yellow-500 text-white font-semibold px-4 py-2 rounded-lg shadow hover:bg-yellow-600 transition w-full"
                  >
                    Submit UTR
                  </button>
                </>
              )}

              {step === "loading" && (
                <>
                  <h2 className="text-xl font-bold mb-4 text-gray-800">Verifying Payment...</h2>
                  <div className="flex justify-center items-center">
                    <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <p className="text-gray-600 mt-4 text-sm">Please wait while we confirm your payment.</p>
                </>
              )}

              {step === "success" && (
                <>
                  <h2 className="text-xl font-bold mb-4 text-green-600">Payment Successful 🎉</h2>
                  <p className="text-gray-700">Your deposit of ₹{amount} has been received. Your account will be updated soon.</p>
                  <button
                    onClick={handleClose}
                    className="mt-4 bg-green-500 text-white font-semibold px-4 py-2 rounded-lg shadow hover:bg-green-600 transition w-full"
                  >
                    Close
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
