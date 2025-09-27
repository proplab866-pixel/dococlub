export const metadata = {
  title: "Login | DocoClub",
  description:
    "Access your DocoClub account securely. Login to manage your investments and profile.",
};

export default function LoginLayout({
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
