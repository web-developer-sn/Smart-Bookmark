"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

type Bookmark = {
  id: string;
  title: string;
  url: string;
};

export default function Dashboard() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  useEffect(() => {
    const loadSession = async () => {
      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        router.push("/");
      } else {
        setUser(data.session.user);
      }
    };

    loadSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session) {
          router.push("/");
        } else {
          setUser(session.user);
        }
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [router]);
  const fetchBookmarks = async () => {
    const { data } = await supabase
      .from("bookmarks")
      .select("*")
      .order("created_at", { ascending: false });

    setBookmarks(data || []);
  };
  useEffect(() => {
    if (!user) return;

    fetchBookmarks();

    const channel = supabase
      .channel(`bookmarks-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookmarks",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchBookmarks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);
  const addBookmark = async () => {
    if (!title || !url) return;

    const { error } = await supabase.from("bookmarks").insert([
      {
        title,
        url,
        user_id: user.id,
      },
    ]);

    if (!error) {
      setTitle("");
      setUrl("");
      fetchBookmarks(); 
    }
  };
  const deleteBookmark = async (id: string) => {
    const { error } = await supabase
      .from("bookmarks")
      .delete()
      .eq("id", id);

    if (!error) {
      fetchBookmarks(); 
    }
  };
  const logout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (!user)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );

  const userName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email;

  const avatar =
    user?.user_metadata?.avatar_url ||
    user?.user_metadata?.picture ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50">
      <div className="flex justify-between items-center px-10 py-6 bg-white shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800">
          Smart Bookmark
        </h1>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <img
              src={avatar}
              alt="avatar"
              onError={(e) => {
                e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  userName
                )}`;
              }}
              className="w-9 h-9 rounded-full object-cover border"
            />
            <div>
              <p className="text-sm font-semibold text-gray-800">
                {userName}
              </p>
              <p className="text-xs text-gray-500">
                Logged in
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      </div>
      <div className="max-w-3xl mx-auto p-10">
        <div className="bg-white p-6 rounded-xl shadow-md mb-8">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">
            Add New Bookmark
          </h2>

          <input
            className="border border-gray-300 p-3 w-full mb-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <input
            className="border border-gray-300 p-3 w-full mb-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />

          <button
            onClick={addBookmark}
            className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition w-full"
          >
            Add Bookmark
          </button>
        </div>

        {/* Bookmark List */}
        <div>
          <h2 className="text-lg font-semibold mb-4 text-gray-800">
            Your Bookmarks
          </h2>

          {bookmarks.length === 0 && (
            <p className="text-gray-500 text-center">
              No bookmarks yet
            </p>
          )}

          <div className="space-y-3">
            {bookmarks.map((bookmark) => (
              <div
                key={bookmark.id}
                className="bg-white p-4 rounded-xl shadow-sm flex justify-between items-center hover:shadow-md transition"
              >
                <a
                  href={bookmark.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 font-medium hover:underline"
                >
                  {bookmark.title}
                </a>

                <button
                  onClick={() => deleteBookmark(bookmark.id)}
                  className="text-red-500 text-sm hover:text-red-600 transition"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
