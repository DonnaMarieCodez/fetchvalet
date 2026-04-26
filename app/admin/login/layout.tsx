export default function AdminLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body className="bg-slate-950">
        {children}
      </body>
    </html>
  );
}