import { AccountClient } from "@/components/account-client";

export const metadata = {
  title: "Account"
};

export default function AccountPage() {
  return (
    <main className="bg-obsidian pt-28 text-ivory">
      <section className="container-luxe grid min-h-[70vh] place-items-center py-12 md:py-14">
        <AccountClient />
      </section>
    </main>
  );
}
