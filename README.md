# FlowOptimize 写作助手

FlowOptimize是一款利用AI技术帮助优化内容的写作助手。通过集成SiliconFlow的LLM API，它能自动分析文本中可改进的部分，并根据不同的优化目标提供改进建议。

## 功能特点

- 内容智能优化：根据不同需求（改进、简化、专业化等）优化文本
- 实时流式输出：优化结果实时显示，无需等待完整响应
- 优化思路展示：查看AI的优化分析思路，了解内容改进的逻辑依据
- 历史记录：保存所有优化记录，方便随时查阅和比较
- 用户友好界面：简洁直观的界面设计，易于使用

## 技术栈

- React / Next.js
- TailwindCSS
- SiliconFlow LLM API

## 安装与设置

1. 克隆仓库
```bash
git clone https://github.com/yourusername/flowoptimize-scribe.git
cd flowoptimize-scribe
```

2. 安装依赖
```bash
npm install
```

3. 配置环境变量

在项目根目录创建一个 `.env.local` 文件，并添加以下内容：

```
VITE_SILICON_FLOW_API_KEY=你的SiliconFlow_API_KEY
```

请将 `你的SiliconFlow_API_KEY` 替换为你在[SiliconFlow平台](https://cloud.siliconflow.cn/)申请的API密钥。

**注意**：由于这是一个Vite项目，前缀为`VITE_`的环境变量会被打包到前端代码中。在生产环境中，应该考虑使用更安全的方式处理API密钥，如使用后端服务中转API请求。

4. 启动开发服务器
```bash
npm run dev
```

5. 访问本地开发服务
在浏览器打开 [http://localhost:5173](http://localhost:5173)

## 使用说明

1. 在左侧编辑器中输入您想要优化的文本
2. 在上方选择优化类型（改进、简化、专业化等）
3. 点击"优化"按钮
4. 右侧将实时显示优化中的内容
5. 点击灯泡图标可查看AI的优化思路和分析
6. 对比优化结果，如满意可点击"接受"保存此次优化

## SiliconFlow API配置

本项目使用[SiliconFlow](https://cloud.siliconflow.cn/)提供的LLM API服务。要使用此功能，请：

1. 在SiliconFlow官网注册账号
2. 前往API密钥页面，创建一个新的API密钥
3. 将密钥复制并配置到`.env.local`文件中

注意：API密钥应该妥善保管，该密钥在本项目中仅在服务器端使用，不会暴露给前端。

## 模型说明

默认使用的是`deepseek-ai/DeepSeek-V2.5`模型，如需更换其他模型，可在`src/pages/api/analyze.ts`和`src/pages/api/optimize.ts`文件中修改`DEFAULT_MODEL`变量。

## 贡献指南

欢迎提交Issue和Pull Request！

## 许可证

[MIT](LICENSE)
