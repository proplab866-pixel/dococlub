export const metadata = {
  title: "Personal Info | Dashboard | DocoClub",
  description:
    "View and update your personal information in your DocoClub dashboard.",
};

export default function PersonalInfoLayout({
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
