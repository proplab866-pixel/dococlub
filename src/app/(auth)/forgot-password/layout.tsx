export const metadata = {
  title: "Forgot Password | DocoClub",
  description: "Reset your DocoClub account password securely and easily.",
};

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex-1 flex flex-col h-full items-center justify-center">
      {children}
    </main>
  );
}
