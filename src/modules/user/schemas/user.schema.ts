// schemas/user.ts
import { z } from 'zod';

export const CreateUserSchema = {
  body: z.object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email(),
    password: z.string().min(8),
  })
};

export const UpdateUserSchema = {
  body: z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.string().email().optional(),
    password: z.string().min(8).optional(),
  })
};

export const UserSchema = CreateUserSchema.body.extend({
  id: z.string().uuid(),
});

export type CreateUserDto = z.infer<typeof CreateUserSchema.body>;
export type UpdateUserDto = z.infer<typeof UpdateUserSchema.body>;
export type UserSchema = z.infer<typeof UserSchema>;





