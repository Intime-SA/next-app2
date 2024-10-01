import AcmeLogo from "@/app/ui/acme-logo";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import styles from "@/app/ui/home.module.css";
import imageHero from "@/public/hero-desktop.png";
import imageMobile from "@/public/hero-mobile.png";
import Image from "next/image";
import TrakeoAlimentosNaturales from "./ui/dashboard/ListaDescargas";

export default function Page() {
  return (
    <main className="flex min-h-screen flex-col p-0">
      <TrakeoAlimentosNaturales />
    </main>
  );
}
