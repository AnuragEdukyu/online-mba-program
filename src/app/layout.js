
import "./globals.css";

export const metadata = {
  title: "Edukyu mba college page" ,
  description: "ready to complete...",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}