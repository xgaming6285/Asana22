export default function MessagesLayout({ children }) {
  return (
    <div className="h-full w-full">
      <div className="border-b border-gray-700 px-4 py-3">
        <h1 className="text-xl font-semibold text-white">Project Messages</h1>
      </div>
      {children}
    </div>
  );
}
