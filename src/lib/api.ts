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

// 使用LLM分析文本的可修改部分
export async function analyzeText(content: string) {
  try {
    if (!SILICON_FLOW_API_KEY) {
      console.error("API密钥未配置");
      throw new Error("API密钥未配置");
    }

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
            content: `分析以下文本，找出可以改进的部分，包括表达不清、用词重复、语法错误等问题：
                    
                    ${content}
                    
                    对于每个问题部分，请提供：
                    1. 原始文本
                    2. 问题原因
                    3. 改进建议
                    
                    请使用以下JSON格式输出结果：
                    [
                      {
                        "original": "问题文本",
                        "reason": "问题原因",
                        "suggestion": "改进建议"
                      },
                      ...
                    ]`
          }
        ],
        temperature: 0.7,
        response_format: { 
          type: "json_object" 
        }
      })
    });

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status}`);
    }

    const data = await response.json();
    
    // 解析API响应
    const responseContent = data.choices?.[0]?.message?.content;
    if (!responseContent) {
      return { modifications: [] };
    }
    
    // 解析JSON字符串
    let jsonData;
    try {
      // 尝试直接解析返回内容
      jsonData = typeof responseContent === 'string' ? JSON.parse(responseContent) : responseContent;
    } catch (e) {
      // 如果直接解析失败，尝试提取JSON部分
      const jsonMatch = responseContent.match(/\[\s*\{.*\}\s*\]/s);
      if (jsonMatch) {
        jsonData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("无法从响应中提取JSON数据");
      }
    }
    
    // 确保结果是数组
    let modifications = [];
    if (Array.isArray(jsonData)) {
      modifications = jsonData.map(item => ({
        original: item.original || "",
        reason: item.reason || "",
        suggestion: item.suggestion || ""
      }));
    } else if (jsonData.modifications && Array.isArray(jsonData.modifications)) {
      modifications = jsonData.modifications.map(item => ({
        original: item.original || "",
        reason: item.reason || "",
        suggestion: item.suggestion || ""
      }));
    }
    
    return { modifications };
  } catch (error) {
    console.error('分析请求时出错:', error);
    throw error;
  }
}

// 优化内容 - 支持流式输出
export async function optimizeText(
  content: string, 
  promptType: OptimizationType, 
  customPrompt: string = "", 
  onProgress?: (chunk: string) => void
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
              content: `${prompt}\n\n${content}`
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
      
      // 返回完整内容
      return { optimizedContent: fullContent };
    } else {
      // 非流式请求保持不变
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
              content: `${prompt}\n\n${content}`
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
      
      return { optimizedContent };
    }
  } catch (error) {
    console.error('优化请求时出错:', error);
    throw error;
  }
} 