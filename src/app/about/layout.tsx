export const metadata = {
  title: "About | DocoClub",
  description: "Learn more about DocoClub, our mission, and how we help you maximize your earnings online.",
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">{children}</main>
    </div>
  );
}
