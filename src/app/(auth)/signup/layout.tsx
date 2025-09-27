export const metadata = {
  title: "Sign Up | DocoClub",
  description:
    "Create your DocoClub account to start investing and earning online.",
};

export default function SignupLayout({
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
