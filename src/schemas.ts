import { z } from 'zod';

export const integerSchema = z.coerce.number().int();
