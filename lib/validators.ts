import { z } from "zod";
import { formatNumberWithDecimal } from "./utils";

const currency = z
  .string()
  .refine(
    (value) => /^\d+(\.\d{2})?$/.test(formatNumberWithDecimal(Number(value))),
    "Price must have exactly two decimal places"
  );

// Schema for inserting products
export const insertProductSchema = z.object({
  name: z.string().min(3, "Le nom doit comporter au moins 3 caractères"),
  slug: z.string().min(3, "Slug must be at least 3 characters"),
  category: z.string().min(3, "Category must be at least 3 characters"),
  brand: z.string().min(3, "Brand must be at least 3 characters"),
  description: z.string().min(3, "Description must be at least 3 characters"),
  stock: z.coerce.number(),
  images: z.array(z.string()).min(1, "Product must have at least 1 image"),
  isFeatured: z.boolean(),
  banner: z.string().nullable(),
  price: currency,
});

//Schema for signing users in
export const signInFormSchema = z.object({
  email: z.email("l'adresse email est invalide"),
  password: z
    .string()
    .min(6, "Le mot de passe doit comporter au moins 6 caractères"),
});

//Schema for signing up a user
export const signUpFormSchema = z
  .object({
    name: z.string().min(3, "Le nom doit comporter au moins 3 caractères"),
    email: z.email("l'adresse email est invalide"),
    password: z
      .string()
      .min(6, "Le mot de passe doit comporter au moins 6 caractères"),
    confirmPassword: z
      .string()
      .min(6, "Le mot de passe doit comporter au moins 6 caractères"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

//Cart Schemas
export const cartItemSchema = z.object({
  productId: z.string().min(1, "Le produit est requis"),
  name: z.string().min(1, "Le nom du produit est requis"),
  slug: z.string().min(1, "le slug du produit est requis"),
  qty: z
    .number()
    .int()
    .nonnegative("La quantité doit être un nombre entier positif"),
  image: z.string().min(1, "l'image du produit est requise"),
  price: currency,
});

export const insertCartSchema = z.object({
  items: z
    .array(cartItemSchema)
    .min(1, "Le panier doit contenir au moins un produit"),
  itemsPrice: currency,
  totalPrice: currency,
  shippingPrice: currency,
  taxPrice: currency,
  sessionCartId: z.string().min(1, "L'ID de la session du panier est requis"),
  userId: z.string().optional().nullable(),
});

// Schema for the shipping address
export const shippingAddressSchema = z.object({
  fullName: z.string().min(3, `Le nom doit être d'au moins 3 caractères`),
  streetAddress: z
    .string()
    .min(3, `L'adresse doit être d'au moins 3 caractères`),
  city: z.string().min(3, `La ville doit être d'au moins 3 caractères`),
  postalCode: z
    .string()
    .min(3, `Le code postal doit être d'au moins 3 caractères`),
  lat: z.number().optional(),
  lng: z.number().optional(),
});
