import "./globals.css";
import { ModalProvider } from "./context/ModalContext";
import { CacheProvider } from "./context/CacheContext";
import CreateTaskModal from "./components/CreateTaskModal";
import TaskDetailModal from "./components/TaskDetailModal";
import InviteMemberModal from "./components/InviteMemberModal";
import { Inter } from "next/font/google";
import QueryProvider from "./providers/QueryProvider";
import { AuthProvider } from "./context/AuthContext";

import Navigation from "./components/Navigation";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Project Management",
  description: "A modern project management application",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <body className={`min-h-screen w-full flex flex-col m-0 p-0 bg-gray-900 text-gray-100 ${inter.className}`}>
        <AuthProvider>
          <CacheProvider>
            <ModalProvider>
              <Navigation />
              <main className="flex-grow w-full">
                <div className="w-full">{children}</div>
              </main>
              <CreateTaskModal />
              <TaskDetailModal />
              <InviteMemberModal />
            </ModalProvider>
          </CacheProvider>
        </AuthProvider>
      </body>
    </html>
  );
}