import OpenAi from 'openai';
import { createClient } from "@supabase/supabase-js";
import { HfInferenceEndpoint } from '@huggingface/inference';

const corsHeaders = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Methods": "POST, OPTIONS",
	"Access-Control-Allow-Headers": "Content-Type"
};

export default {
	async fetch(request, env, ctx): Promise<Response> {
		if (request.method === "OPTIONS") {
			return new Response("OK", { headers: corsHeaders });
		}
		if (request.method !== "POST") {
			return new Response(JSON.stringify({ error: `${request.method} method is not allowed` }), { status: 405, headers: corsHeaders });
		}

		try {
			const { duration, userInputs } = await request.json();
			if (!userInputs || !Array.isArray(userInputs) || userInputs.length === 0) {
				return new Response(JSON.stringify({ error: "Invalid input: userInputs array is required" }), { status: 400, headers: corsHeaders });
			}

			// Initialize API clients
			const openai = new OpenAi({ apiKey: env.OPENAI_KEY });
			const hfe = new HfInferenceEndpoint(env.CLOUDFLARE_AI_GATEWAY_URL + '/microsoft/Phi-3-mini-4k-instruct', HF_API_TOKEN);
			const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);

			// Create an embedding from input text using OpenAI
			const createEmbedding = async (input: string) => {
				const embeddingResponse = await openai.embeddings.create({
					model: "text-embedding-3-small",
					input: input
				});
				return embeddingResponse.data[0].embedding;
			};

			// Return full movie objects from Supabase.
			const fetchEmbeddings = async (embedding: any) => {
				const { data, error } = await supabase.rpc('match_movies', {
					query_embedding: embedding,
					match_threshold: 0.1,
					match_count: 4
				});
				if (error) {
					console.error(error);
					return [];
				}
				return data;
			};

			// Generate a centroid embedding across all user inputs.
			let embedding = Array(1536).fill(0);
			for (const userInput of userInputs) {
				const { q1, q2, q3 } = userInput;
				if (!q1 || !q2 || !q3) {
					console.warn("User entry is missing one or more answers; skipping:", userInput);
					continue;
				}
				const combinedInput = `Title and content: ${q1}. Duration: ${duration} Release Year: ${q2 === "New" ? "2020 - 2025" : "1999 - 2020"}. Mood: ${q3}.`;
				const emb = await createEmbedding(combinedInput);
				for (let i = 0; i < emb.length; i++) {
					embedding[i] += emb[i];
				}
			}
			embedding = embedding.map((num: number) => num / userInputs.length);

			// Get recommended movies from Supabase.
			const matches = await fetchEmbeddings(embedding);
			console.log("Matches:", matches);

			// Build a prompt that instructs the model to output only valid JSON.
			const generationPrompt = `
Generate a JSON array where each element is an object with the following keys:
  "title": a string (the movie title),
  "releaseYear": a number (the release year),
  "link": a string (a URL linking to the movie details; use "https://myapp.com/movies/<slug>" where <slug> is the movie title in lowercase with hyphens),
  "reason": a string (a short summary explaining why this movie is recommended based on the user inputs).

User Inputs: ${JSON.stringify(userInputs)}
Recommended Movies: ${JSON.stringify(matches)}

Output ONLY valid JSON with no additional text or markdown formatting.
      `.trim();

			// Generate the JSON output.
			const generatedResponse = await hfe.textGeneration({
				inputs: generationPrompt,
				parameters: { max_new_tokens: 500, variant: "text-generation-inference" }
			});

			const generatedText = generatedResponse.generated_text || '';

			console.log("Raw generated response:", generatedText.slice(Math.min(generatedText.length, generationPrompt.length + 1)));

			// If the output contains extra text, try to extract the JSON part.
			const extractJson = (text: string): string | null => {
				const firstBracket = text.indexOf('[');
				const lastBracket = text.lastIndexOf(']');
				if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
					return text.slice(firstBracket, lastBracket + 1);
				}
				return null;
			};

			let rawOutput = generatedResponse.generated_text || generatedResponse;
			const jsonPart = extractJson(rawOutput);
			if (!jsonPart) {
				throw new Error("Failed to extract valid JSON from the generated output.");
			}

			let recommendations;
			try {
				recommendations = JSON.parse(jsonPart);
			} catch (parseError) {
				console.error("Error parsing generated JSON:", parseError);
				return new Response(JSON.stringify({ error: "Failed to parse generated output as JSON." }), { status: 500, headers: corsHeaders });
			}

			// Return both the movie details and the generated reasons with links.
			return new Response(JSON.stringify({ movies: matches, recommendations }), { headers: corsHeaders });
		} catch (e: any) {
			console.error(e);
			return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
		}
	},
} satisfies ExportedHandler<Env>;