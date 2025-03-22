import { OptimizationType } from "@/components/PromptPanel";

// SiliconFlow API配置
const SILICON_FLOW_API_URL = "https://api.siliconflow.cn/v1/chat/completions";
const SILICON_FLOW_API_KEY = import.meta.env.VITE_SILICON_FLOW_API_KEY; // 从环境变量中获取
const DEFAULT_MODEL = "deepseek-ai/DeepSeek-V2.5";

// 根据优化类型获取提示
export const getPromptForType = (type: OptimizationType, customPromptValue: string = ""): string => {
  switch (type) {
    case "improve":
      return "改进这段内容，提高清晰度和效果，同时保持原始意图和语调:";
    case "simplify":
      return "简化这段内容，使用简单语言和较短句子，让它更容易理解:";
    case "persuasive":
      return "让这段内容更有说服力和吸引力，以促使读者采取行动:";
    case "professional":
      return "将这段内容调整为专业商务风格，确保它精炼且正式:";
    case "creative":
      return "让这段内容更有创意，更吸引人，更令人难忘:";
    case "custom":
      return customPromptValue || "请根据自定义指令优化这段内容:";
    default:
      return "改进这段内容，提高清晰度和效果，同时保持原始意图和语调:";
  }
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
              role: "user", 
              content: `${prompt}\n\n${content}\n\n请提供优化后的内容，无需详细解释修改过程，只需直接给出优化结果。`
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
              role: "user", 
              content: `${prompt}\n\n${content}\n\n请提供优化后的内容，无需详细解释修改过程，只需直接给出优化结果。`
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