export const metadata = {
  title: 'Admin Dashboard',
  description: 'Meme Project Control Center',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}