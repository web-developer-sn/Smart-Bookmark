"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        router.replace("/dashboard");
      } else {
        setLoading(false);
      }
    };
    checkSession();
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session) {
          router.replace("/dashboard");
        }
      }
    );
    return () => {
      listener.subscription.unsubscribe();
    };
  }, [router]);

  const login = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
  };
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-white to-blue-100">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }
  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-white to-blue-100">
      <div className="bg-white/70 backdrop-blur-lg p-10 rounded-2xl shadow-xl w-full max-w-md text-center">
        
        <h1 className="text-3xl font-bold text-gray-800 mb-3">
          Smart Bookmark
        </h1>

        <p className="text-gray-500 mb-8">
          Save, manage and sync your bookmarks in real-time.
        </p>

        <button
          onClick={login}
          className="flex items-center justify-center gap-3 w-full 
                     border border-gray-300 
                     bg-white 
                     text-gray-700 
                     py-3 px-6 
                     rounded-lg 
                     shadow-sm 
                     hover:shadow-md 
                     hover:bg-gray-50 
                     transition 
                     font-medium"
        >
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.5l6.7-6.7C35.6 2.2 30.2 0 24 0 14.6 0 6.6 5.8 2.7 14.1l7.8 6.1C12.3 13.6 17.6 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-2.8-.4-4H24v7.6h12.7c-.3 2.2-1.9 5.5-5.4 7.7l8.3 6.4c4.8-4.4 7.6-10.9 7.6-18.7z"/>
            <path fill="#FBBC05" d="M10.5 28.2c-.5-1.5-.8-3-.8-4.7s.3-3.2.8-4.7l-7.8-6.1C1 16.5 0 20.1 0 24c0 3.9 1 7.5 2.7 10.3l7.8-6.1z"/>
            <path fill="#34A853" d="M24 48c6.2 0 11.4-2 15.2-5.5l-8.3-6.4c-2.3 1.6-5.2 2.6-8.9 2.6-6.4 0-11.7-4.1-13.6-9.7l-7.8 6.1C6.6 42.2 14.6 48 24 48z"/>
          </svg>
          Continue with Google
        </button>

      </div>
    </div>
  );
}
