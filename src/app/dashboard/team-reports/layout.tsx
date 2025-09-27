export const metadata = {
  title: "Team Reports | Dashboard | DocoClub",
  description:
    "Analyze your team performance and reports in your DocoClub dashboard.",
};

export default function TeamReportsLayout({
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
