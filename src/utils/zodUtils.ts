import { z, ZodNumber } from 'zod';

export const integerSchema = z.coerce.number().int();

export function simpleParse(schema: ZodNumber, value: number) {
  const result = schema.safeParse(value, {
    errorMap: (_, { defaultError }) => {
      return { message: `${defaultError}. Received: ${value}` };
    },
  });

  if (result.success) {
    return result.data;
  }

  throw new Error(result.error.issues[0]?.message ?? result.error.message);
}
