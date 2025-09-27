export const metadata = {
  title: "Dashboard | DocoClub",
  description:
    "Access your DocoClub dashboard to manage your investments, view reports, and update your profile.",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main>{children}</main>;
}
