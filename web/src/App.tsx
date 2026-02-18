import ExifReader from "exifreader";
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

async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();
  const form = e.currentTarget;
  const formData = new FormData(form);
  const fileReader = new FileReader();
  const imageFile = formData.get("image") as File;
  const image = await new Promise<string>((resolve, reject) => {
    fileReader.onload = () => {
      resolve(fileReader.result as string);
    };
    fileReader.onerror = () => {
      reject(fileReader.error);
    };
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
    takenAt: imageTags.DateTimeOriginal?.description // ex. "2024:01:01 12:00:00"
      .replace(/^(\d+):(\d+):(\d+) /, "$1-$2-$3T"), // ISO 8601 format "2024-01-01T12:00:00"
  };
  await uploadPost(post);
  form.reset();
  await mutate(`${endpoint}/posts`);
}

export default function App() {
  const { data: posts, error } = useSWR<Post[]>(`${endpoint}/posts`, fetcher);

  if (error) {
    console.error(error);
    return <div>Failed to load posts</div>;
  }
  if (!posts) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="flex gap-4">
        {posts.length === 0 ? (
          <div>No posts yet</div>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {posts.map((post) => (
              <li key={post.id} className="border p-4 rounded">
                <img src={post.image} alt={post.birdName} className="mb-2" />
                <div>{post.birdName}</div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <form onSubmit={onSubmit}>
        <input type="file" name="image" required />
        <input type="text" name="birdName" required placeholder="Bird Name" />
        <label>
          📷
          <button type="submit">Submit</button>
        </label>
      </form>
    </div>
  );
}
