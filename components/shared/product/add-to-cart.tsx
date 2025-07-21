"use client";
import { Button } from "@/components/ui/button";
import { addItemToCart } from "@/lib/actions/cart.action";
import { CartItem } from "@/types";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const AddToCart = ({ item }: { item: CartItem }) => {
  const router = useRouter();

  const handleAddToCart = async () => {
    const res = await addItemToCart(item);
    if (!res.success) {
      toast.error(res.message);
      return;
    }

    toast.success(`${item.name} a été ajouté au panier`, {
      action: {
        label: "Voir le panier",
        onClick: () => router.push("/cart"),
      },
    });
  };

  return (
    <Button
      className="w-full bg-primary text-white hover:bg-gray-800"
      type="button"
      onClick={handleAddToCart}
    >
      <Plus />
      Add To Cart
    </Button>
  );
};

export default AddToCart;
