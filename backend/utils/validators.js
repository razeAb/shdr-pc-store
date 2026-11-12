import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email().min(5).max(200),
  password: z.string().min(8).max(200),
});

export const loginSchema = z.object({
  email: z.string().email().min(5).max(200),
  password: z.string().min(1).max(200),
});

export const googleLoginSchema = z.object({
  credential: z.string().min(20),
});

export const firebaseLoginSchema = z.object({
  idToken: z.string().min(20),
});

export const productSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(5000).optional().default(""),
  images: z
    .array(z.string().url().or(z.string().min(1)))
    .optional()
    .default([]),
  videos: z
    .array(z.string().url().or(z.string().min(1)))
    .optional()
    .default([]),
  price: z.number().nonnegative(),
  sku: z.string().trim().max(120).optional().default(""),
  category: z.string().max(200).optional().default(""),
  subCategory: z.string().max(200).optional().default(""),
  productType: z.string().max(200).optional(),
  brand: z.string().max(200).optional(),
  connectivity: z.string().max(200).optional(),
  priceRange: z.string().max(200).optional(),
  isActive: z.boolean().optional().default(true),
  inStock: z.boolean().optional(),
  tags: z.array(z.string().min(1).max(50)).optional().default([]),
  specs: z
    .object({
      cpuBrand: z.string().trim().max(50).optional(),
      cpu: z.string().trim().max(120).optional(),
      gpu: z.string().trim().max(120).optional(),
      ram: z.string().trim().max(50).optional(),
      storage: z.string().trim().max(50).optional(),
    })
    .optional(),
  attributes: z
    .array(z.object({ key: z.string().trim().min(1).max(50), value: z.string().trim().min(1).max(120) }))
    .max(30)
    .optional(),
  ingredients: z.string().max(5000).optional().default(""),
  servingSize: z.string().max(200).optional().default(""),
});

export const checkoutSchema = z.object({
  customer: z.object({
    fullName: z.string().min(2).max(200),
    phone: z.string().min(5).max(30),
    email: z.string().email().min(5).max(200),
    address: z.string().min(2).max(300),
    city: z.string().min(1).max(120),
  }),
  items: z
    .array(
      z.object({
        productId: z.string().min(24).max(24),
        qty: z.number().int().min(1).max(99),
      })
    )
    .min(1),
});
