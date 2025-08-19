import Image from "next/image";
import Link from "next/link";

export default function LandingPage() {
  const features = [
    "Organize your tasks with boards and columns",
    "Track progress easily in real time",
    "Built with Next.js, Tailwind, and React Query",
    "Fast, modern, responsive design",
  ];
  return (
    <main className="mx-auto max-w-7xl px-6 py-16 bg-white">
      <section className="py-16">
        <h1 className="text-6xl">Welcome to the Kanban Workspace</h1>
        <p className="mt-4 text-xl text-neutral-500 max-w-2xl">
          This is a simple Kanban board application built with Next.js and
          Tailwind CSS.
        </p>
      </section>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {features.map((text, i) => (
          <div
            key={i}
            className="bg-neutral-100 p-4 rounded-md flex flex-col justify-between h-80"
          >
            <p className="text-lg">{text}</p>
            <Image
              src="/file.svg"
              width={60}
              height={60}
              alt="Icon"
              className="self-end"
            />
          </div>
        ))}
      </div>
      <Link
        href="/app"
        className="bg-neutral-700 hover:bg-neutral-900 transition-colors duration-200 ease-in-out text-white py-2 px-4 rounded-md w-full mt-10 h-14 flex items-center justify-center"
      >
        Open App
      </Link>
    </main>
  );
}
