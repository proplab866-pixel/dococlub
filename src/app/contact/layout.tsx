export const metadata = {
  title: "Contact | DocoClub",
  description:
    "Get in touch with the DocoClub team for support, questions, or partnership opportunities.",
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main className="flex-1">{children}</main>;
}
