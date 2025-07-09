import { genkitAPI, GENKIT_API_DEFAULT_OPTIONS } from '@genkit-ai/next';

// This is required to initialize the Genkit plugin.
import '@/ai/genkit';
// This is required to register the flow(s).
import '@/ai/flows/summarize-daily-production-and-sales';

export const POST = genkitAPI(GENKIT_API_DEFAULT_OPTIONS);
