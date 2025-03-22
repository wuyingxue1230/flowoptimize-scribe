import { OptimizationType } from "@/components/PromptPanel";

// SiliconFlow API配置
const SILICON_FLOW_API_URL = "https://api.siliconflow.cn/v1/chat/completions";
const SILICON_FLOW_API_KEY = import.meta.env.VITE_SILICON_FLOW_API_KEY; // 从环境变量中获取
const DEFAULT_MODEL = "deepseek-ai/DeepSeek-V2.5";

// System Prompt配置
const SYSTEM_PROMPTS = {
  // 通用系统提示，适用于所有优化类型
  simplify: 
  `
  你是一位文案精简专家，擅长将内容以更简洁的方式表达，同时保持原文的专业性和深度。请按照以下原则处理用户提供的文案：

1. 表达精简：
   - 删除冗余词汇和重复表达
   - 用简短词组替代冗长描述
   - 保持句子结构清晰但简练

2. 结构优化：
   - 确保段落紧凑有序
   - 使用精准的标题和小标题
   - 列表内容保持要点式表达

3. 内容聚焦：
   - 突出核心观点和关键信息
   - 移除次要细节但保留专业深度
   - 合并相关概念，减少篇幅

4. 语言效率：
   - 优先使用直接表达方式
   - 减少修饰性和过渡性语言
   - 保持专业术语但确保必要性

5. 格式规范：
   - 去除多余的标记符号
   - 保持一致的排版风格
   - 适当使用空间分隔增强可读性

请将用户提供的内容转化为更精简的版本，但不降低内容的专业性和深度。目标是减少字数约30-40%，同时保持原文的核心价值和信息量。
  `,
  
  // 针对不同优化类型的特定系统提示
  improve: "你是一位资深自媒体编辑，专长于识别并改进文案的表达缺陷、逻辑问题和结构混乱。你会精准保留原文核心意图，同时通过重组段落、优化句式和调整用词，显著提升内容的清晰度和说服力。每次编辑都确保段落层次分明，重点突出，让读者轻松理解作者意图。",
  
  general: "你是一位文案简化专家，擅长将复杂内容转化为简单易懂的表达。你会使用简短句子、常见词汇，移除不必要的术语和复杂结构，让任何人都能轻松理解内容。请确保适当分段，使文本结构清晰。",
  
  persuasive: "你是一位营销文案专家，擅长创作有说服力和吸引力的内容。你了解如何使用情感触发点、社会认同和行动导向的语言，促使读者采取行动。请确保适当分段，使文本结构清晰，突出核心卖点。",
  
  professional: "你是一位商业写作专家，擅长创作专业、正式的商务内容。你的表达精炼、准确、有逻辑，使用适当的商业术语，维持专业形象。请确保适当分段，使文本结构清晰，突出逻辑性和权威性。",
  
  creative: "你是一位创意写作大师，擅长创作引人入胜、富有想象力的内容。你使用生动的描述、新颖的表达和独特的视角，让内容令人难忘。请确保适当分段，使文本结构清晰，保持创意性同时不失专业。",
  
  custom: "你是一位适应性极强的文案专家，能根据特定需求定制内容风格和表达方式。请确保适当分段，使文本结构清晰，同时满足客户的特定要求。"
};

// 根据优化类型获取提示
export const getPromptForType = (type: OptimizationType, customPromptValue: string = ""): string => {
  switch (type) {
    case "improve":
      return "改进这段内容，提高清晰度和效果，同时保持原始意图和语调，请保持适当分段并去除多余的星号标记:";
    case "simplify":
      return "简化这段内容，使用简单语言和较短句子，让它更容易理解，请保持适当分段并去除多余的星号标记:";
    case "persuasive":
      return "让这段内容更有说服力和吸引力，以促使读者采取行动，请保持适当分段并去除多余的星号标记:";
    case "professional":
      return "将这段内容调整为专业商务风格，确保它精炼且正式，请保持适当分段并去除多余的星号标记:";
    case "creative":
      return "让这段内容更有创意，更吸引人，更令人难忘，请保持适当分段并去除多余的星号标记:";
    case "custom":
      return (customPromptValue ? customPromptValue + "，" : "") + "请保持适当分段并去除多余的星号标记:";
    default:
      return "改进这段内容，提高清晰度和效果，同时保持原始意图和语调，请保持适当分段并去除多余的星号标记:";
  }
};

// 根据优化类型获取系统提示
const getSystemPrompt = (type: OptimizationType): string => {
  return SYSTEM_PROMPTS[type] || SYSTEM_PROMPTS.general;
};

// 使用LLM分析文本的可修改部分 - 简化为整体分析
export async function analyzeText(content: string) {
  try {
    if (!SILICON_FLOW_API_KEY) {
      console.error("API密钥未配置");
      throw new Error("API密钥未配置");
    }

    // 直接进行整体分析
    const modifications = [
      {
        original: content,
        reason: "整体优化建议",
        suggestion: "在分析完成后将显示优化建议"
      }
    ];
    
    return { modifications };
  } catch (error) {
    console.error('分析请求时出错:', error);
    throw error;
  }
}

// 优化内容 - 支持流式输出，同时返回整体优化建议
export async function optimizeText(
  content: string, 
  promptType: OptimizationType, 
  customPrompt: string = "", 
  onProgress?: (chunk: string, suggestions?: any) => void
) {
  try {
    if (!SILICON_FLOW_API_KEY) {
      console.error("API密钥未配置");
      throw new Error("API密钥未配置");
    }

    // 根据优化类型获取提示
    const prompt = getPromptForType(promptType, customPrompt);
    // 获取相应的系统提示
    const systemPrompt = getSystemPrompt(promptType);
    
    // 如果提供了进度回调函数，使用流式输出
    if (onProgress) {
      // 先获取优化思路（非流式请求）
      const reasoningResponse = await fetch(SILICON_FLOW_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SILICON_FLOW_API_KEY}`
        },
        body: JSON.stringify({
          model: DEFAULT_MODEL,
          messages: [
            {
              role: "system",
              content: systemPrompt
            },
            { 
              role: "user", 
              content: `${prompt}\n\n${content}\n\n分析这段内容需要优化的地方，解释你的优化思路和计划。请简明扼要地总结你将如何改进这段内容，而不是直接给出改进后的内容。`
            }
          ],
          temperature: 0.7
        })
      });
      
      if (!reasoningResponse.ok) {
        console.warn("获取优化思路失败:", reasoningResponse.status);
      }
      
      let optimizationReasoning = "优化思路生成中...";
      
      try {
        const reasoningData = await reasoningResponse.json();
        optimizationReasoning = reasoningData.choices?.[0]?.message?.content || "无法获取优化思路";
      } catch (e) {
        console.error("解析优化思路时出错:", e);
      }
      
      // 更新初始建议
      const initialModifications = [
        {
          original: content,
          reason: "优化思路",
          suggestion: "",
          reasoning: optimizationReasoning
        }
      ];
      
      // 调用回调函数更新建议
      onProgress("", initialModifications);
      
      // 然后获取流式优化内容
      const response = await fetch(SILICON_FLOW_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SILICON_FLOW_API_KEY}`
        },
        body: JSON.stringify({
          model: DEFAULT_MODEL,
          messages: [
            {
              role: "system",
              content: systemPrompt
            },
            { 
              role: "user", 
              content: `${prompt}\n\n${content}\n\n请提供优化后的内容，保持适当分段格式，移除所有星号标记(*)，确保文本结构清晰。直接给出优化结果，无需解释。`
            }
          ],
          temperature: 0.7,
          stream: true // 启用流式输出
        })
      });

      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("无法读取响应流");
      }

      const decoder = new TextDecoder("utf-8");
      let fullContent = "";
      
      // 处理流式响应
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        // 解码二进制数据
        const chunk = decoder.decode(value, { stream: true });
        
        // 处理SSE格式的数据
        const lines = chunk.split("\n").filter(line => line.trim() !== "");
        
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = line.slice(6); // 移除 "data: " 前缀
              
              // 处理流结束标记
              if (data === "[DONE]") continue;
              
              const json = JSON.parse(data);
              const content = json.choices?.[0]?.delta?.content || "";
              
              if (content) {
                // 将新内容添加到完整内容中
                fullContent += content;
                // 调用回调函数处理进度更新
                onProgress(fullContent);
              }
            } catch (e) {
              console.error("解析流数据时出错:", e);
            }
          }
        }
      }
      
      // 优化完成后，创建整体优化建议
      const modifications = [
        {
          original: content,
          reason: "优化思路",
          suggestion: fullContent,
          reasoning: optimizationReasoning
        }
      ];
      
      // 调用回调函数更新建议
      onProgress(fullContent, modifications);
      
      // 返回完整内容和建议
      return { 
        optimizedContent: fullContent,
        modifications: modifications
      };
    } else {
      // 非流式请求，同时获取优化内容和思路
      const reasoningResponse = await fetch(SILICON_FLOW_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SILICON_FLOW_API_KEY}`
        },
        body: JSON.stringify({
          model: DEFAULT_MODEL,
          messages: [
            {
              role: "system",
              content: systemPrompt
            },
            { 
              role: "user", 
              content: `${prompt}\n\n${content}\n\n分析这段内容需要优化的地方，解释你的优化思路和计划。请简明扼要地总结你将如何改进这段内容，而不是直接给出改进后的内容。`
            }
          ],
          temperature: 0.7
        })
      });
      
      let optimizationReasoning = "无法获取优化思路";
      
      if (reasoningResponse.ok) {
        try {
          const reasoningData = await reasoningResponse.json();
          optimizationReasoning = reasoningData.choices?.[0]?.message?.content || "无法获取优化思路";
        } catch (e) {
          console.error("解析优化思路时出错:", e);
        }
      }
      
      // 获取优化内容
      const response = await fetch(SILICON_FLOW_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SILICON_FLOW_API_KEY}`
        },
        body: JSON.stringify({
          model: DEFAULT_MODEL,
          messages: [
            {
              role: "system",
              content: systemPrompt
            },
            { 
              role: "user", 
              content: `${prompt}\n\n${content}\n\n请提供优化后的内容，保持适当分段格式，移除所有星号标记(*)，确保文本结构清晰。直接给出优化结果，无需解释。`
            }
          ],
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status}`);
      }

      const data = await response.json();
      const optimizedContent = data.choices?.[0]?.message?.content || "";
      
      if (!optimizedContent) {
        throw new Error("API返回的优化内容为空");
      }
      
      // 创建整体优化建议
      const modifications = [
        {
          original: content,
          reason: "优化思路",
          suggestion: optimizedContent,
          reasoning: optimizationReasoning
        }
      ];
      
      return { 
        optimizedContent,
        modifications
      };
    }
  } catch (error) {
    console.error('优化请求时出错:', error);
    throw error;
  }
} 