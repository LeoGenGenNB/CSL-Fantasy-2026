
import { GoogleGenAI } from "@google/genai";
import { UserTeam, Player, Position } from "../types";
import { getPlayerById, getClubById } from "./gameService";

const getAPIKey = () => {
    // Safety check for process.env
    try {
        if (typeof process !== 'undefined' && process.env) {
            return process.env.API_KEY || '';
        }
        // Fallback or polyfill check
        if ((window as any).process?.env) {
            return (window as any).process.env.API_KEY || '';
        }
    } catch (e) {
        return '';
    }
    return '';
};

export const generateTeamAnalysis = async (team: UserTeam): Promise<string> => {
  const apiKey = getAPIKey();
  if (!apiKey) return "未配置 API Key，无法使用 AI 功能。";

  const ai = new GoogleGenAI({ apiKey });

  const filledSlots = team.squad.filter(s => s.playerId !== null);
  
  if (filledSlots.length === 0) {
      return "你的阵容为空，请先添加球员。";
  }

  const squadDetails = filledSlots.map(sp => {
    const p = getPlayerById(sp.playerId!);
    const c = p ? getClubById(p.clubId) : null;
    if (!p) return null;
    return ` - ${p.webName} (${p.position}, ${c?.name}, £${p.price}m) ${sp.isCaptain ? '[队长]' : ''} ${!sp.isStarter ? '[替补]' : ''}`;
  }).filter(Boolean).join('\n');

  const prompt = `
    你是一位精通中超联赛（2026赛季）的梦幻足球（Fantasy Football）专家教练。
    请分析以下玩家的阵容，并用中文给出简短、专业的建议。
    
    阵容:
    ${squadDetails}

    规则:
    - 预算有限
    - 同一俱乐部最多3人
    - 队长得分翻倍

    请提供:
    1. 阵容评分 (1-10分)
    2. 核心短板分析
    3. 一个推荐的转会引援目标（真实的中超球员）
    4. 本轮队长推荐

    请使用 Markdown 格式，保持简洁。
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "暂无分析结果。";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "连接 AI 球探失败，请稍后再试。";
  }
};