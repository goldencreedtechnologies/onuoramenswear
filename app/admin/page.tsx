import { AdminClient } from "@/components/admin-client";

export const metadata = {
  title: "Admin Control"
};

export default function AdminPage() {
  return (
    <main className="bg-obsidian pt-24 text-ivory">
      <section className="container-luxe min-h-screen py-10 md:py-12">
        <AdminClient />
      </section>
    </main>
  );
}
