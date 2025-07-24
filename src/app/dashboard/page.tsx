// app/dashboard/page.tsx

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { User } from "@supabase/supabase-js";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) router.push("/login");
      else setUser(user);
    };
    getUser();
  }, [router]);

  return (
    <section className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold text-primary mb-4">
        Welcome to Your Dashboard
      </h1>

      {user && (
        <p className="mb-6 text-gray-700">
          Logged in as <span className="font-semibold">{user.email}</span>
        </p>
      )}

      <div className="bg-white p-6 rounded-lg shadow border space-y-4">
        <p className="text-gray-700">
          You&apos;re just a few steps away from being NHS procurement-ready.
        </p>
        <Link
          href="/wizard"
          className="inline-block bg-primary text-white px-6 py-2 rounded hover:bg-primary-hover transition-colors"
        >
          Start NHS Readiness Wizard
        </Link>
      </div>

      <div className="mt-8 bg-white p-6 rounded-lg shadow border space-y-4">
        <h2 className="text-xl font-bold text-primary">Tenders Service</h2>
        <p className="text-gray-700">View available procurement tenders</p>
        <Link
          href="/dashboard/tenders"
          className="inline-block bg-primary text-white px-6 py-2 rounded hover:bg-primary-hover transition-colors"
        >
          View Tenders
        </Link>
      </div>

      <div className="mt-8 bg-white p-6 rounded-lg shadow border space-y-4">
        <h2 className="text-xl font-bold text-primary">Contracts</h2>
        <p className="text-gray-700">Create and sign contract documents</p>
        <Link
          href="/dashboard/contracts"
          className="inline-block bg-primary text-white px-6 py-2 rounded hover:bg-primary-hover transition-colors"
        >
          Manage Contracts
        </Link>
      </div>

      <div className="mt-8 bg-white p-6 rounded-lg shadow border space-y-4">
        <h2 className="text-xl font-bold text-primary">Templates</h2>
        <p className="text-gray-700">Start a contract from a prebuilt template</p>
        <Link
          href="/dashboard/templates"
          className="inline-block bg-primary text-white px-6 py-2 rounded hover:bg-primary-hover transition-colors"
        >
          Browse Templates
        </Link>
      </div>

      <div className="mt-8 bg-white p-6 rounded-lg shadow border space-y-4">
        <h2 className="text-xl font-bold text-primary">ClauseMind</h2>
        <p className="text-gray-700">Draft contracts with AI assistance</p>
        <Link
          href="/dashboard/clausemind"
          className="inline-block bg-primary text-white px-6 py-2 rounded hover:bg-primary-hover transition-colors"
        >
          Open ClauseMind
        </Link>
      </div>
    </section>
  );
}
