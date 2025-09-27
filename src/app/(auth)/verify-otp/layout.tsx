export const metadata = {
  title: "Verify OTP | DocoClub",
  description:
    "Verify your email address with the OTP sent to you to activate your DocoClub account.",
};

export default function VerifyOtpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex-1 flex flex-col h-full items-center justify-center my-2">
      {children}
    </main>
  );
}
