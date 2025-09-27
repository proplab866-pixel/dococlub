export const metadata = {
  title: "Account Details | Dashboard | DocoClub",
  description:
    "View and manage your account details in your DocoClub dashboard.",
};

export default function AccountDetailsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex-1 flex justify-center items-center h-full">
      {children}
    </main>
  );
}
