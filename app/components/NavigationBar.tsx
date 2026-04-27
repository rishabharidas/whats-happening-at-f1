import Link from "next/link";

export default function NavigationBar() {
    return (
        <>
            <nav id="main-nav" className="w-full mx-auto h-[50px] rounded-sm flex justify-between items-center px-4 bg-zinc-800 text-white sticky top-0 transition-all duration-300 ease-in-out z-10">
                <Link href="/">Home</Link>
                <Link href="/about">About</Link>
            </nav>
        </>
    )
}