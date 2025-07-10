'use server';

import { genkitAPI } from '@genkit-ai/next/server';

// This is required to initialize the Genkit plugin.
import '@/ai/genkit';
// This is required to register the flow(s).
import '@/ai/flows/summarize-daily-production-and-sales';

export const { POST } = genkitAPI();
