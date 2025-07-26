"use server";

import { CartItem } from "@/types";
import { cookies } from "next/headers";
import { convertToPlainObject, formatError, round2 } from "../utils";
import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import { Prisma } from "@prisma/client";
import { cartItemSchema, insertCartSchema } from "../validators";
import { revalidatePath } from "next/cache";

// Calculate cart prices

const calcPrice = (items: CartItem[]) => {
  const itemsPrice = round2(
      items.reduce((acc, item) => acc + Number(item.price) * item.qty, 0)
    ),
    shippingPrice = round2(itemsPrice > 100 ? 0 : 10),
    taxPrice = round2(itemsPrice * 0.15),
    totalPrice = round2(itemsPrice + shippingPrice + taxPrice);

  return {
    itemsPrice: itemsPrice.toFixed(2),
    shippingPrice: shippingPrice.toFixed(2),
    taxPrice: taxPrice.toFixed(2),
    totalPrice: totalPrice.toFixed(2),
  };
};

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

    if (!product) throw new Error("Produit introuvable");

    if (!cart) {
      //create new cart
      const newCart = insertCartSchema.parse({
        userId: userId,
        items: [item],
        sessionCartId: sessionCartId,
        ...calcPrice([item]),
      });

      //Add to database
      await prisma.cart.create({
        data: newCart,
      });

      // Revalidate product page
      revalidatePath(`/product/${item.productId}`);
      return {
        data,
        success: true,
        message: `${product.name} a été ajouté au panier`,
      };
    } else {
      // Check if item is already in cart
      const existingItem = (cart.items as CartItem[]).find(
        (x) => x.productId === item.productId
      );

      if (existingItem) {
        //Check stock
        if (product.stock < existingItem.qty + 1) {
          throw new Error("Stock insuffisant pour ce produit");
        }
        // Increase quantity
        (cart.items as CartItem[]).find(
          (x) => x.productId === item.productId
        )!.qty += 1;
      } else {
        //Check stock
        if (product.stock < 1)
          throw new Error("Stock insuffisant pour ce produit");

        // Add item to cart
        cart.items.push(item);
      }

      // Save to database
      await prisma.cart.update({
        where: { id: cart.id },
        data: {
          items: cart.items as Prisma.CartUpdateitemsInput[],
          ...calcPrice(cart.items as CartItem[]),
        },
      });

      revalidatePath(`/product/${product.slug}`);

      return {
        success: true,
        message: `${product.name} ${existingItem ? "a été mis à jour dans" : "a été ajouté à"} votre panier`,
      };
    }
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

export async function removeItemFromCart(productId: string) {
  try {
    const sessionCartId = (await cookies()).get("sessionCartId")?.value;
    if (!sessionCartId) throw new Error("Session cart ID not found");

    // Get product
    const product = await prisma.product.findFirst({
      where: { id: productId },
    });
    if (!product) throw new Error("Produit introuvable");

    //Get user cart
    const cart = await getMyCart();
    if (!cart) throw new Error("Panier introuvable");

    // Check for item
    const exist = (cart.items as CartItem[]).find(
      (x) => x.productId === productId
    );
    if (!exist) throw new Error("Produit non trouvé dans le panier");

    // Check if item is the only one in cart
    if (exist.qty === 1) {
      //Remove from cart
      cart.items = (cart.items as CartItem[]).filter(
        (x) => x.productId !== exist.productId
      );
    } else {
      // Decrease quantity
      (cart.items as CartItem[]).find((x) => x.productId === productId)!.qty =
        exist.qty - 1;
    }

    // Update cart in database
    await prisma.cart.update({
      where: { id: cart.id },
      data: {
        items: cart.items as Prisma.CartUpdateitemsInput[],
        ...calcPrice(cart.items as CartItem[]),
      },
    });
    revalidatePath(`/product/${product.slug}`);

    return {
      success: true,
      message: `${product.name} a été retiré de votre panier`,
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}
