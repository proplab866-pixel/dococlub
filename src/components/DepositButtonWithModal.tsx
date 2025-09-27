// "use client";
// import React, { useState, ChangeEvent, FormEvent, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import qr from '@/public/qr.png';

// interface DepositButtonWithModalProps {
//   qrImageUrl: string; // path or URL of QR image
// }

// export function DepositButtonWithModal({ qrImageUrl }: DepositButtonWithModalProps) {
//   const [showModal, setShowModal] = useState(false);
//   const [step, setStep] = useState<"amount" | "qr" | "loading" | "success">("amount");
//   const [amount, setAmount] = useState("");
//   const [utrNumber, setUtrNumber] = useState("");

//   const handleAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
//     setAmount(e.target.value);
//   };

//   const handleUtrChange = (e: ChangeEvent<HTMLInputElement>) => {
//     setUtrNumber(e.target.value);
//   };

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
//     setStep("loading"); // start loader
//     // Simulate backend verification for 10 sec
//     setTimeout(() => {
//       setStep("success");
//     }, 10000); // 10 seconds
//   };


//   const handleClose = () => {
//     setShowModal(false);
//     setStep("amount");
//     setAmount("");
//     setUtrNumber("");
//   };

//   return (
//     <>
//       {/* Deposit Button */}
//       <button
//         className="bg-yellow-500 text-white font-semibold px-4 py-2 rounded-xl shadow hover:bg-yellow-600 transition"
//         onClick={() => setShowModal(true)}
//       >
//         Deposit
//       </button>

//       {/* Modal */}
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
//               {/* Close Button */}
//               <button
//                 className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-xl font-bold"
//                 onClick={handleClose}
//                 aria-label="Close"
//               >
//                 ×
//               </button>

//               {/* Step 1: Enter Amount */}
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

//               {/* Step 2: Show QR + UTR */}
//               {step === "qr" && (
//                 <>
//                   <h2 className="text-xl font-bold mb-4 text-gray-800">Scan & Pay</h2>
//                   <img
//                     src="/qr.jpeg"
//                     alt="Payment QR Code"
//                     className="w-60 h-60 mx-auto rounded-lg border shadow mb-4"
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
//                   <p className="text-gray-600 mt-4 text-sm">
//                     After completing your payment, enter the UTR number here for verification.
//                   </p>
//                 </>
//               )}

//               {/* Step 3: Loader */}
//               {step === "loading" && (
//                 <>
//                   <h2 className="text-xl font-bold mb-4 text-gray-800">Verifying Payment...</h2>
//                   <div className="flex justify-center items-center">
//                     <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
//                   </div>
//                   <p className="text-gray-600 mt-4 text-sm">
//                     Please wait while we confirm your payment. This may take up to 30 seconds.
//                   </p>
//                 </>
//               )}

//               {/* Step 4: Success */}
//               {step === "success" && (
//                 <>
//                   <h2 className="text-xl font-bold mb-4 text-green-600">Payment Successful 🎉</h2>
//                   <p className="text-gray-700">Your deposit of ₹{amount} has been received. Your account will be Updated soon.</p>
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

"use client";
import React, { useState, ChangeEvent, FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface DepositButtonWithModalProps { }

export function DepositButtonWithModal({ }: DepositButtonWithModalProps) {
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState<"amount" | "qr" | "loading" | "success">("amount");
  const [amount, setAmount] = useState("");
  const [utrNumber, setUtrNumber] = useState("");

  const handleAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value);
  };

  const handleUtrChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUtrNumber(e.target.value);
  };

  const handleStartPayment = (e: FormEvent) => {
    e.preventDefault();
    if (!amount || parseInt(amount) <= 0) {
      alert("Please enter a valid amount.");
      return;
    }
    setStep("qr"); // move to QR step
  };

  const handleSubmitUtr = () => {
    if (!utrNumber.trim()) {
      alert("Please enter your UTR number after payment.");
      return;
    }
    setStep("loading"); // start loader
    setTimeout(() => {
      setStep("success");
    }, 10000); // 10 seconds simulation
  };

  const handleClose = () => {
    setShowModal(false);
    setStep("amount");
    setAmount("");
    setUtrNumber("");
  };

  return (
    <>
      {/* Deposit Button */}
      <button
        className="bg-yellow-500 text-white font-semibold px-4 py-2 rounded-xl shadow hover:bg-yellow-600 transition"
        onClick={() => setShowModal(true)}
      >
        Deposit
      </button>

      {/* Modal */}
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
              {/* Close Button */}
              <button
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-xl font-bold"
                onClick={handleClose}
                aria-label="Close"
              >
                ×
              </button>

              {/* Step 1: Enter Amount */}
              {step === "amount" && (
                <>
                  <h2 className="text-xl font-bold mb-4 text-gray-800">Enter Deposit Amount</h2>
                  <form onSubmit={handleStartPayment} className="flex flex-col gap-4">
                    <input
                      type="number"
                      min={1}
                      placeholder="Enter amount in ₹"
                      value={amount}
                      onChange={handleAmountChange}
                      required
                      className="border border-gray-300 rounded-lg px-3 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      autoFocus
                    />
                    <button
                      type="submit"
                      className="bg-yellow-500 text-white font-semibold px-4 py-2 rounded-lg shadow hover:bg-yellow-600 transition"
                    >
                      Pay
                    </button>
                  </form>
                </>
              )}

              {/* Step 2: Show QR + UTR */}
              {step === "qr" && (
                <>
                  <h2 className="text-xl font-bold mb-4 text-gray-800">Scan & Pay</h2>

                  <Image
                    src="/qr.jpeg"
                    alt="Payment QR Code"
                    width={200}
                    height={200}
                    className="w-full h-full mx-auto rounded-lg border shadow mb-4"
                  />
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
                  <p className="text-gray-600 mt-4 text-sm">
                    After completing your payment, enter the UTR number here for verification.
                  </p>
                </>
              )}

              {/* Step 3: Loader */}
              {step === "loading" && (
                <>
                  <h2 className="text-xl font-bold mb-4 text-gray-800">Verifying Payment...</h2>
                  <div className="flex justify-center items-center">
                    <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <p className="text-gray-600 mt-4 text-sm">
                    Please wait while we confirm your payment. This may take up to 30 seconds.
                  </p>
                </>
              )}

              {/* Step 4: Success */}
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
