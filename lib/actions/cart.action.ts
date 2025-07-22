"use server";

import { CartItem } from "@/types";
import { cookies } from "next/headers";
import { convertToPlainObject, formatError } from "../utils";
import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import { get } from "http";
import { cartItemSchema } from "../validators";

export async function addItemToCart(data: CartItem) {
  try {
    // Get the session cart ID from cookies
    const sessionCartId = (await cookies()).get("sessionCartId")?.value;
    if (!sessionCartId) throw new Error("Session cart ID not found");

    // Get session and user ID
    const session = await auth();
    const userId = session?.user?.id ? (session.user.id as string) : undefined;

    // get cart
    const cart = await getMyCart();

    // Parse and validate the item
    const item = cartItemSchema.parse(data);

    // Find product and database
    const product = await prisma.product.findFirst({
      where: { id: item.productId },
    });

    //Testing
    console.log({
      sessionCartId: sessionCartId,
      userId: userId,
      "Item requested": item,
      "Product found": product,
    });

    return {
      data,
      success: true,
      message: "Produit ajouté au panier",
    };
  } catch (error) {
    return {
      data,
      success: false,
      message: formatError(error),
    };
  }
}

export async function getMyCart() {
  // Get the session cart ID from cookies
  const sessionCartId = (await cookies()).get("sessionCartId")?.value;
  if (!sessionCartId) throw new Error("Session cart ID not found");

  // Get session and user ID
  const session = await auth();
  const userId = session?.user?.id ? (session.user.id as string) : undefined;

  // Get user cart from database
  const cart = await prisma.cart.findFirst({
    where: userId ? { userId: userId } : { sessionCartId: sessionCartId },
  });

  if (!cart) return undefined;

  //convert decimals and return cart items
  return convertToPlainObject({
    ...cart,
    items: cart.items as CartItem[],
    totalPrice: cart.itemsPrice.toString(),
    shippingPrice: cart.itemsPrice.toString(),
    taxPrice: cart.itemsPrice.toString(),
  });
}
