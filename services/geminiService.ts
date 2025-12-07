
import { GoogleGenAI } from "@google/genai";
import { UserTeam, Player, Position } from "../types";
import { getPlayerById, getClubById } from "./gameService";

const getAPIKey = () => {
    // In a real app, this comes from process.env.API_KEY
    return process.env.API_KEY || '';
};

export const generateTeamAnalysis = async (team: UserTeam): Promise<string> => {
  const apiKey = getAPIKey();
  if (!apiKey) return "API Key not configured. Please set process.env.API_KEY.";

  const ai = new GoogleGenAI({ apiKey });

  // Filter out empty slots for analysis
  const filledSlots = team.squad.filter(s => s.playerId !== null);
  
  if (filledSlots.length === 0) {
      return "Your squad is empty. Please add players first.";
  }

  // Construct a text representation of the team
  const squadDetails = filledSlots.map(sp => {
    // We checked playerId is not null above
    const p = getPlayerById(sp.playerId!);
    const c = p ? getClubById(p.clubId) : null;
    if (!p) return null;
    return ` - ${p.webName} (${p.position}, ${c?.name}, £${p.price}m) ${sp.isCaptain ? '[CAPTAIN]' : ''} ${!sp.isStarter ? '[BENCH]' : ''}`;
  }).filter(Boolean).join('\n');

  const prompt = `
    You are an expert Fantasy Football manager for the Chinese Super League (CSL) 2026.
    Analyze the following fantasy squad for the upcoming gameweek.
    
    Squad:
    ${squadDetails}

    Rules:
    - Budget is tight.
    - Max 3 players from same club.
    - Captain gets double points.

    Please provide:
    1. A brief rating of the squad strength (1-10).
    2. Identification of the key weakness.
    3. One suggested transfer target (real CSL player) to improve the team.
    4. Advice on captain choice.

    Keep it concise and formatted in Markdown.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "No analysis available.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error contacting AI Scout. Please try again later.";
  }
};
