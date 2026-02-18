import type { Post } from "../../api/src/types";

const endpoint = import.meta.env.DEV ? "http://localhost:3000/api" : "/api";

async function uploadPost(post: Omit<Post, "id" | "createdAt">): Promise<void> {
  const res = await fetch(`${endpoint}/posts`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(post),
  });
  if (!res.ok || res.status !== 201) {
    throw new Error("Failed to upload post");
  }
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
  const location = {
    latitude: parseFloat(formData.get("latitude") as string),
    longitude: parseFloat(formData.get("longitude") as string),
  };
  const post: Omit<Post, "id" | "createdAt"> = {
    image,
    birdName: formData.get("birdName") as string,
    location:
      isNaN(location.latitude) || isNaN(location.longitude)
        ? undefined
        : location,
    takenAt: formData.get("takenAt") as string | undefined,
  };
  await uploadPost(post);
  form.reset();
}

export default function App() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={onSubmit}>
        <input type="file" name="image" required />
        <input type="text" name="birdName" required placeholder="Bird Name" />
        <input
          type="text"
          name="latitude"
          pattern="[0-9]*[.][0-9]*"
          placeholder="Latitude"
        />
        <input
          type="text"
          name="longitude"
          pattern="[0-9]*[.][0-9]*"
          placeholder="Longitude"
        />
        <input type="datetime-local" name="takenAt" />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}
