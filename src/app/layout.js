import {
  ClerkProvider,
} from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import "./globals.css";
import { ModalProvider } from "./context/ModalContext";
import { CacheProvider } from "./context/CacheContext";
import CreateTaskModal from "./components/CreateTaskModal";
import TaskDetailModal from "./components/TaskDetailModal";
import InviteMemberModal from "./components/InviteMemberModal";
import { Inter } from "next/font/google";
import QueryProvider from "./providers/QueryProvider";

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
        <ClerkProvider
          appearance={{
            baseTheme: dark,
            variables: {
              colorPrimary: "#a855f7",
              colorText: "#f1f5f9",
              colorBackground: "#111827",
              borderRadius: "0.75rem",
            },
            elements: {
              userButtonPopoverCard:
                "bg-gray-800 text-white border-gray-700 shadow-xl",
              userButtonPopoverActionButtonText: "text-gray-300",
              userButtonPopoverActionButtonIcon: "text-gray-400",
              formButtonPrimary: "bg-purple-600 hover:bg-purple-700 text-white",
              card: "bg-gray-900 border border-gray-700",
              headerTitle: "text-white text-xl",
              footerActionLink: "text-purple-500 hover:text-purple-400",
            },
          }}
        >
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
        </ClerkProvider>
      </body>
    </html>
  );
}