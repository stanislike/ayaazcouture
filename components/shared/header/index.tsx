import { APP_NAME } from "@/lib/constants";
import Image from "next/image";
import Link from "next/link";
import Menu from "./menu";

const Header = () => {
  return (
    <header className="w-full border-b">
      <div className="wrapper flex-between">
        <div className="flex-start">
          <Link href="/" className="flex-start">
            <Image
              className="block lg:hidden"
              src="/images/logo_48x48.png"
              alt={`${APP_NAME} logo`}
              height={48}
              width={48}
              priority={true}
            />
            <Image
              className="hidden lg:block"
              src="/images/ayaaz_couture_transparent_48h.png"
              alt={`${APP_NAME} logo`}
              height={48}
              width={135}
              priority={true}
            />
            {/* <span className="hidden lg:block font-bold text-2xl ml-3">
              {APP_NAME}
            </span> */}
          </Link>
        </div>
        <Menu />
      </div>
    </header>
  );
};

export default Header;
