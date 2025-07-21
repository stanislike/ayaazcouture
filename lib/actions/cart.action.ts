"use server";

import { CartItem } from "@/types";

export async function addItemToCart(data: CartItem) {
  return {
    data,
    success: true,
    message: "Produit ajouté au panier",
  };
}
