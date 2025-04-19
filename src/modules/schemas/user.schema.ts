// schemas/user.ts
import { z } from 'zod';

export const UserSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  age: z.number().min(0),
});

export type User = z.infer<typeof UserSchema>;
