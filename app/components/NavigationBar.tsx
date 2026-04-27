import Link from "next/link";

export default function NavigationBar() {
  return (
    <>
      <nav
        id="main-nav"
        className="w-4/5 mx-auto h-14 rounded-sm flex justify-between items-center px-4 bg-zinc-900 text-white sticky top-8 transition-all duration-300 ease-in-out z-999"
      >
        <Link href="/" className="uppercase font-extrabold italic font-mono">
          WH@F1
        </Link>
        <div className="flex gap-5 font-light font-mono">
          <Link href="/about">about</Link>
          <Link href="#">github</Link>
        </div>
      </nav>
    </>
  );
}
