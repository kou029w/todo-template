import ExifReader from "exifreader";
import { useRef, useState } from "react";
import useSWR, { mutate } from "swr";
import type { Post } from "../../api/src/types";

const endpoint = import.meta.env.DEV ? "http://localhost:3000/api" : "/api";

async function fetcher(
  url: string,
  { method = "GET", body }: { method?: string; body?: any } = {},
): Promise<Post[]> {
  const res = await fetch(url, {
    method,
    ...(body && { body: JSON.stringify(body) }),
  });
  if (!res.ok) {
    throw new Error("Failed to fetch");
  }
  return res.json();
}

async function uploadPost(post: Omit<Post, "id" | "createdAt">): Promise<void> {
  await fetcher(`${endpoint}/posts`, {
    method: "POST",
    body: post,
  });
}

function Sidebar({
  birdNames,
  selected,
  onSelect,
}: {
  birdNames: string[];
  selected: string | null;
  onSelect: (name: string | null) => void;
}) {
  return (
    <aside className="flex flex-col border-r border-gray-200 bg-gray-50 w-16 shrink-0">
      <div className="flex flex-col items-center py-2 gap-1 overflow-y-auto flex-1">
        <button
          onClick={() => onSelect(null)}
          title="すべて"
          className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
            selected === null
              ? "bg-blue-100 text-blue-700"
              : "text-gray-500 hover:bg-gray-100"
          }`}
        >
          三
        </button>
        {birdNames.map((name) => (
          <button
            key={name}
            onClick={() => onSelect(selected === name ? null : name)}
            title={name}
            className={`w-10 h-10 rounded-lg text-xs font-medium leading-tight px-1 transition-colors break-all ${
              selected === name
                ? "bg-blue-100 text-blue-700"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {name.slice(0, 4)}
          </button>
        ))}
      </div>
    </aside>
  );
}

function PostCard({ post }: { post: Post }) {
  return (
    <article className="rounded-xl overflow-hidden bg-white border border-gray-200 flex flex-col">
      <img
        src={post.image}
        alt={post.birdName}
        className="w-full aspect-square object-cover"
      />
      <div className="px-3 py-2 flex flex-col gap-0.5">
        <span className="font-medium text-sm text-gray-900">
          {post.birdName}
        </span>
        <div className="flex justify-between">
          {post.takenAt && (
            <span className="text-xs text-gray-500">
              {new Date(post.takenAt).toLocaleDateString("ja-JP")}
            </span>
          )}
          {post.location && (
            <a
              href={`https://www.google.com/maps?q=${post.location.latitude},${post.location.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-400 hover:underline"
            >
              🗺 撮影場所
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

function PostGrid({ posts }: { posts: Post[] }) {
  if (posts.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
        投稿がありません
      </div>
    );
  }
  return (
    <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 p-4 overflow-y-auto content-start">
      {posts.map((post) => (
        <li key={post.id}>
          <PostCard post={post} />
        </li>
      ))}
    </ul>
  );
}

function PostForm() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [birdName, setBirdName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      const form = e.currentTarget;
      const formData = new FormData(form);
      const imageFile = formData.get("image") as File;

      const image = await new Promise<string>((resolve, reject) => {
        const fileReader = new FileReader();
        fileReader.onload = () => resolve(fileReader.result as string);
        fileReader.onerror = () => reject(fileReader.error);
        fileReader.readAsDataURL(imageFile);
      });

      const imageTags = await ExifReader.load(imageFile);
      const location = {
        latitude: parseFloat(imageTags.GPSLatitude?.description ?? "NaN"),
        longitude: parseFloat(imageTags.GPSLongitude?.description ?? "NaN"),
      };
      const post: Omit<Post, "id" | "createdAt"> = {
        image,
        birdName: formData.get("birdName") as string,
        location:
          isNaN(location.latitude) || isNaN(location.longitude)
            ? undefined
            : location,
        takenAt: imageTags.DateTimeOriginal?.description.replace(
          /^(\d+):(\d+):(\d+) /,
          "$1-$2-$3T",
        ),
      };
      await uploadPost(post);
      form.reset();
      setPreview(null);
      setBirdName("");
      await mutate(`${endpoint}/posts`);
    } finally {
      setSubmitting(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-gray-200 bg-white flex items-center gap-2 px-3 py-2 shrink-0"
    >
      <input
        ref={fileInputRef}
        type="file"
        name="image"
        accept="image/*"
        required
        className="hidden"
        onChange={handleFileChange}
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="text-xl leading-none shrink-0 w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
        title="画像を選択"
      >
        {preview ? (
          <img
            src={preview}
            alt="preview"
            className="w-8 h-8 rounded object-cover"
          />
        ) : (
          "📷"
        )}
      </button>
      <input
        type="text"
        name="birdName"
        required
        placeholder="鳥の名前"
        value={birdName}
        onChange={(e) => setBirdName(e.target.value)}
        className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-blue-400 transition-colors"
      />
      <button
        type="submit"
        disabled={submitting || !preview || !birdName}
        className="shrink-0 bg-blue-500 text-white text-sm font-medium px-4 py-1.5 rounded-lg disabled:opacity-40 hover:bg-blue-600 transition-colors"
      >
        {submitting ? "..." : "投稿"}
      </button>
    </form>
  );
}

export default function App() {
  const { data: posts, error } = useSWR<Post[]>(`${endpoint}/posts`, fetcher);
  const [selectedBird, setSelectedBird] = useState<string | null>(null);

  if (error) {
    console.error(error);
    return (
      <div className="h-screen flex items-center justify-center text-red-500 text-sm">
        データの読み込みに失敗しました
      </div>
    );
  }
  if (!posts) {
    return (
      <div className="h-screen flex items-center justify-center text-gray-400 text-sm">
        読み込み中...
      </div>
    );
  }

  const birdNames = [...new Set(posts.map((p) => p.birdName))];
  const filteredPosts = selectedBird
    ? posts.filter((p) => p.birdName === selectedBird)
    : posts;

  return (
    <div className="h-screen flex overflow-hidden">
      <Sidebar
        birdNames={birdNames}
        selected={selectedBird}
        onSelect={setSelectedBird}
      />
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="px-4 py-2 border-b border-gray-200 bg-white shrink-0 flex items-center gap-2">
          <span className="text-lg">🐦</span>
          <h1 className="text-sm font-semibold text-gray-700">torilog</h1>
          {selectedBird && (
            <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
              {selectedBird}
            </span>
          )}
        </header>
        <div className="flex-1 overflow-y-auto">
          <PostGrid posts={filteredPosts} />
        </div>
        <PostForm />
      </div>
    </div>
  );
}
