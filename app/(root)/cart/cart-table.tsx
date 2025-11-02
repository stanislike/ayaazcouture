"use client";
import { useRouter } from "next/navigation";
import { useSonner } from "sonner";
import { useTransition } from "react";
import { addItemToCart, removeItemFromCart } from "@/lib/actions/cart.action";
import { ArrowRight, Loader, Minus, Plus } from "lucide-react";

import { Cart } from "@/types";

import Link from "next/link";
import Image from "next/image";

const CartTable = ({ cart }: { cart?: Cart }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <>
      <h1 className="py-4 h2-bold">Panier</h1>
      {!cart || cart.items.length === 0 ? (
        <div>
          Votre panier est vide. <Link href="/">Continuer vos achats</Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-4 md:gap-5">
          <div className="overflow-x-auto md:col-span-3">Table</div>
        </div>
      )}
    </>
  );
};

export default CartTable;
