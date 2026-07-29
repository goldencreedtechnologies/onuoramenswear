import { AccountClient } from "@/components/account-client";

export const metadata = {
  title: "Account"
};

export default function AccountPage() {
  return (
    <main className="account-surface min-h-screen bg-obsidian pt-[104px] text-ivory">
      <section className="container-luxe py-10 md:py-14">
        <AccountClient />
      </section>
    </main>
  );
}
