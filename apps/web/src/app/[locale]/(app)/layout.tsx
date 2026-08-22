import { Sidebar } from "@/components/layout/sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <Sidebar />
      <main className="px-6 py-8 lg:pl-72 lg:pr-10">{children}</main>
    </div>
  );
}
