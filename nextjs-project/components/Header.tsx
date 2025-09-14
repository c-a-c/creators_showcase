import Link from "next/link";
import ThemeSwitcher from "./ThemeSwitcher";

const Header = () => {
  return (
    <header className="border-b dark:border-gray-700">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          コンテスト作品集
        </Link>
        <ThemeSwitcher />
      </div>
    </header>
  );
};
export default Header;