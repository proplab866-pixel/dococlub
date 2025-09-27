export const metadata = {
  title: "Transaction History | Dashboard | DocoClub",
  description: "Review your transaction history in your DocoClub dashboard.",
};

export default function TransactionHistoryLayout({
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
