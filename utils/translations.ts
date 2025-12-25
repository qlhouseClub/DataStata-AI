import { Language } from '../types';

export const translations = {
  'en': {
    title: "DataStata.AI",
    loadData: "Load Data",
    viewData: "View Grid",
    hideData: "Hide Grid",
    variables: "Variables",
    frames: "Frames",
    console: "Console",
    chartWindow: "Chart",
    exportJpg: "Export JPG",
    close: "Close",
    visualize: "Visualize",
    generate: "Generate",
    processing: "Processing...",
    commandPlaceholder: "Enter command (e.g., 'summarize price')",
    quickActions: "Quick Actions",
    createChart: "Chart Builder",
    fullAnalysis: "Full Analysis",
    customAnalysis: "Custom Analysis",
    selectDimensions: "Select Dimensions",
    generatingReport: "Analyzing dataset...",
    reportView: "Analysis Report",
    printPdf: "Export PDF",
    exportHtml: "Export HTML",
    type: "Type",
    xAxis: "X Axis",
    yAxis: "Y Axis",
    colorBy: "Color By",
    sizeBy: "Size By",
    select: "Select...",
    ready: "Ready",
    bar: "Bar",
    line: "Line",
    area: "Area",
    scatter: "Scatter",
    pie: "Pie",
    radar: "Radar",
    donut: "Donut",
    treemap: "Treemap",
    segmentLabel: "Segment Label",
    segmentSize: "Segment Size",
    domain: "Domain (Subject)",
    metric: "Metric",
    groupBy: "Group By",
    // Help topics
    help: "Help",
    helpTopics: {
        intro: {
            title: "System Overview & Architecture",
            content: "DataStata.AI is a professional-grade analytical platform that bridges the gap between the rigor of statistical command-line interfaces and the accessibility of generative AI.\n\n### 1. Core Philosophy\nModern data analysis typically forces a choice between two extremes:\n• **Determinism (Stats Software)**: Tools like Stata, SAS, or Python pandas offer 100% precision but require coding skills.\n• **Probabilistic (AI)**: LLMs offer natural language ease but often \"hallucinate\" numbers.\n\nDataStata.AI solves this by decoupling the **Execution Layer** (deterministic JavaScript engine) from the **Reasoning Layer** (Gemini AI). The AI generates strategy; the engine calculates the math.\n\n### 2. Architecture Diagram\n[UI_PREVIEW: interface_anatomy]\n\n### 3. Data Privacy & Security\nWe strictly adhere to a **Privacy-First** architecture:\n• **Local Execution**: Your raw data (CSV/Excel) is processed entirely within your browser's memory (RAM). It is NOT uploaded to any cloud database.\n• **Metadata Only**: When generating insights, we send only statistical summaries (metadata) to the AI model. For example, we send \"Mean: 50, Max: 100\", not the individual row of \"John Doe, $50\".\n\n> **Note**: For extremely sensitive data, you can use the offline commands (Console) without triggering any AI features."
        },
        workflow: {
            title: "Professional Workflow Guide",
            content: "Follow this end-to-end process to transform raw data into a boardroom-ready strategic report.\n\n[UI_PREVIEW: workflow_timeline]\n\n### Phase 1: Ingestion & Parsing\n1. **Upload**: Use the sidebar to load `.csv` or `.xlsx` files.\n2. **Type Inference**: The system automatically detects data types.\n   - **Dates**: Recognized formats include ISO (2024-01-01) and US (1/1/2024).\n   - **Numbers**: Currency symbols and commas are stripped automatically.\n\n### Phase 2: Inspection & Cleaning\nBefore analysis, verify your data integrity:\n• **Summarize**: Run `summarize` to check for impossible values (e.g., Age = -5).\n• **List**: Use `list in 1/10` to spot-check rows.\n• **Generate**: Create new variables (e.g., `gen profit = revenue - cost`).\n\n### Phase 3: Strategic Analysis\nYou have two powerful modes for generating insights:\n• **Full Analysis**: A broad, automated sweep of the entire dataset. Ideal for initial discovery.\n• **Custom Analysis**: A focused deep-dive. You select specific variables (e.g., \"Marketing Spend\" vs \"ROI\"), and the AI investigates only those relationships, ignoring noise.\n\n### Phase 4: Reporting\n• **HTML Export**: Download a fully formatted, interactive HTML report containing all text and charts.\n• **JPG Export**: Save individual high-resolution charts for slide decks."
        },
        data: {
            title: "Data Management & Frame Logic",
            content: "DataStata.AI uses a sophisticated memory management system inspired by Stata's 'Frames'.\n\n### 1. The Frame System\nInstead of one giant table, we use **Frames**. This allows you to keep multiple datasets loaded simultaneously (e.g., a 'Sales' table and a 'Customers' table) without mixing them up.\n\n[UI_PREVIEW: frame_logic]\n\n• **Active Frame**: Commands always run on the currently visible frame.\n• **Switching**: Click the frame name in the sidebar or use `frame change [name]`.\n\n### 2. Variable Types\nUnderstanding types is crucial for correct chart generation.\n[UI_PREVIEW: variable_types]\n\n### 3. Merging Datasets\nWe support **1:1 Left Joins**. This connects a 'Master' dataset to a 'Using' dataset via a common Key ID.\n\n[UI_PREVIEW: merge_logic]\n\n**Syntax**: `merge 1:1 [key_variable] using [filename]`\n\n**Example**: You have `Sales` (active) and `Users` (loaded in background).\n`merge 1:1 user_id using Users.csv`\n\n> **Result**: Columns from `Users` are added to `Sales` where `user_id` matches. Rows without matches are preserved (Left Join)."
        },
        commands: {
            title: "Command Reference Manual",
            content: "The deterministic engine allows for precise data manipulation. All commands are case-insensitive.\n\n### 1. Inspection Commands\n\n#### `summarize [varlist]`\nCalculates descriptive statistics (Obs, Mean, Std. Dev, Min, Max).\n• **Example**: `summ price cost`\n\n#### `describe`\nDisplays metadata (Type, Format) for all variables.\n\n#### `list [varlist] in [range]`\nDisplays raw data rows.\n• **Example**: `list name date in 1/5` (First 5 rows)\n\n#### `count`\nReturns the total number of rows.\n\n### 2. Manipulation Commands\n\n#### `generate new_var = expression`\nCreates a new variable using JavaScript syntax.\n• **Arithmetic**: `gen margin = (price - cost) / price`\n• **Logic**: `gen is_high = price > 100 ? 1 : 0`\n• **Math Functions**: `gen log_val = Math.log(val)`\n\n#### `drop [varlist]`\nPermanently removes variables from memory.\n• **Example**: `drop temp_id unused_col`\n\n### 3. System Commands\n\n#### `frame change [name]`\nSwitches the active dataset context.\n\n#### `clear all`\nWipes all data from memory."
        },
        ai: {
            title: "AI Analysis & Prompt Engineering",
            content: "DataStata utilizes **Gemini 2.5 Pro** for reasoning. Understanding how it works will help you get better results.\n\n### 1. The RAG Process\nWe do not send your raw data rows to the AI. Instead, we perform **Retrieval-Augmented Generation (RAG)** using statistical profiles.\n1. **Profile**: We calculate Mean, Median, Min, Max, and sample values locally.\n2. **Context**: We send this profile + your question to Gemini.\n3. **Insight**: Gemini infers the story behind the numbers.\n\n### 2. Full vs. Custom Analysis\n\n#### Full Analysis (Sparkle Icon)\n• **Scope**: Scans every variable.\n• **Best For**: \"Tell me what I don't know.\" Identifying unknown unknowns.\n• **Output**: A standardized 5-section report (Trend, Strength, Anomaly, Weakness, Recommendations).\n\n#### Custom Analysis (Filter Icon)\n• **Scope**: Restricted to variables you select.\n• **Best For**: Hypothesis testing. \"Does A cause B?\"\n• **Benefit**: Higher accuracy. By filtering out irrelevant columns, the AI focuses its 'attention' budget entirely on the variables that matter.\n\n### 3. Tips for Better Prompts\n• **Context**: \"We are a retail company...\"\n• **Specificity**: \"Analyze the trend of sales *grouped by region*.\"\n• **Verification**: Use `summarize` to verify the numbers the AI discusses."
        },
        viz: {
            title: "Visualization & Chart Builder",
            content: "Charts can be generated automatically by the AI or manually via the Chart Builder.\n\n### 1. Chart Types\nWe support specific chart types optimized for business reporting:\n\n• **Line**: Continuous time-series trends.\n• **Bar**: Categorical comparisons.\n• **Area**: Volume accumulation over time.\n• **Scatter**: Correlation between two numerical variables.\n• **Treemap**: Hierarchical part-to-whole relationships.\n• **Donut**: Simple composition (limit to < 5 categories).\n\n### 2. The Chart Builder GUI\n[UI_PREVIEW: builder_guide]\n\n• **Filtering**: You can apply a pre-filter (e.g., `Region == 'North'`) before plotting.\n• **Multi-Series**: Add multiple Y-axis series to compare metrics (e.g., Revenue vs Cost) on the same timeline.\n• **Export**: All charts can be exported as high-resolution JPGs for use in PowerPoint or reports."
        }
    }
  },
  'zh-CN': {
    title: "DataStata.AI",
    loadData: "加载数据",
    viewData: "显示网格",
    hideData: "隐藏网格",
    variables: "变量列表",
    frames: "Frames (数据集)",
    console: "控制台",
    chartWindow: "图表",
    exportJpg: "导出 JPG",
    close: "关闭",
    visualize: "可视化",
    generate: "生成",
    processing: "处理中...",
    commandPlaceholder: "输入命令 (如: 'summarize price')",
    quickActions: "快捷操作",
    createChart: "图表构建器",
    fullAnalysis: "全量分析",
    customAnalysis: "自定义分析",
    selectDimensions: "选择维度",
    generatingReport: "正在生成分析报告...",
    reportView: "分析报告",
    printPdf: "导出 PDF",
    exportHtml: "导出 HTML",
    type: "类型",
    xAxis: "X 轴",
    yAxis: "Y 轴",
    colorBy: "分组着色",
    sizeBy: "大小权重",
    select: "选择...",
    ready: "就绪",
    bar: "柱状图",
    line: "折线图",
    area: "面积图",
    scatter: "散点图",
    pie: "饼状图",
    radar: "雷达图",
    donut: "环状图",
    treemap: "矩阵图",
    segmentLabel: "分类标签",
    segmentSize: "数值大小",
    domain: "维度 (Subject)",
    metric: "度量值 (Metric)",
    groupBy: "分组依据",
    help: "帮助文档",
    helpTopics: {
        intro: {
            title: "系统概览与核心架构",
            content: "欢迎使用 DataStata.AI。这是一个旨在弥合传统命令行统计软件（如 Stata）与现代大语言模型（LLM）探索性分析之间鸿沟的下一代分析平台。\n\n### 1. 核心设计哲学\n现代数据分析通常需要在两个极端之间做选择：\n• **确定性 (统计软件)**：如 Stata、SAS 或 Python pandas，提供 100% 的精度，但需要编程技能。\n• **概率性 (AI)**：LLM 提供自然语言的便捷性，但容易产生“数字幻觉”。\n\nDataStata.AI 通过解耦 **执行层**（确定性 JavaScript 引擎）与 **推理层**（Gemini AI）解决了这个问题。AI 负责生成策略，引擎负责计算数学。\n\n### 2. 架构图解\n[UI_PREVIEW: interface_anatomy]\n\n### 3. 数据隐私与安全\n我们严格遵循 **隐私优先** 的架构设计：\n• **本地执行 (Local Execution)**：您的原始数据（CSV/Excel）完全在您的浏览器内存 (RAM) 中处理。**绝不会上传到云端数据库。**\n• **仅传元数据**：在生成洞察时，我们仅向 AI 模型发送统计摘要（元数据）。例如，我们发送“均值：50，最大值：100”，而不是“张三，50元”的具体行数据。\n\n> **注意**：对于极度敏感的数据，您完全可以使用离线命令（控制台）进行分析，而不触发任何 AI 功能。"
        },
        workflow: {
            title: "全流程专业操作指南",
            content: "遵循此端到端流程，将原始数据转化为董事会级别的战略报告。\n\n[UI_PREVIEW: workflow_timeline]\n\n### 第一阶段：数据摄入与解析\n1. **上传**：使用侧边栏加载 `.csv` 或 `.xlsx` 文件。\n2. **类型推断**：系统自动检测数据类型。\n   - **日期**：支持 ISO (2024-01-01) 和美式 (1/1/2024) 格式。\n   - **数值**：自动去除货币符号和千分位逗号。\n\n### 第二阶段：检查与清洗\n在分析之前，验证数据的完整性：\n• **Summarize**：运行 `summarize` 检查不可能的数值（例如：年龄 = -5）。\n• **List**：使用 `list in 1/10` 抽查原始行。\n• **Generate**：创建新变量（例如：`gen profit = revenue - cost`）。\n\n### 第三阶段：战略分析\n您有两种强大的模式来生成洞察：\n• **全量分析 (全自动)**：对整个数据集进行广度扫描。适合初步发现未知风险与机会。\n• **自定义分析 (深度挖掘)**：您选择特定变量（例如“营销支出”与“ROI”），AI 仅调查这些变量之间的关系，忽略噪音干扰。\n\n### 第四阶段：汇报与导出\n• **HTML 导出**：下载格式完整的交互式分析报告，包含所有文本结论与图表。\n• **JPG 导出**：将关键图表单独导出为高清图片，用于 PPT 演示。"
        },
        data: {
            title: "数据管理与 Frame 逻辑",
            content: "DataStata.AI 采用受 Stata 启发的 **Frame (数据帧)** 内存管理系统。\n\n### 1. Frame 系统\n我们不强制合并所有数据，而是使用 **Frame**。这允许您同时加载多个数据集（例如“销售表”和“客户表”），互不干扰。\n\n[UI_PREVIEW: frame_logic]\n\n• **激活 Frame**：所有命令仅对当前可见的 Frame 生效。\n• **切换**：点击侧边栏的名称或使用命令 `frame change [name]`。\n\n### 2. 变量类型\n理解变量类型对于正确生成图表至关重要。\n[UI_PREVIEW: variable_types]\n\n### 3. 数据集合并 (Merge)\n我们支持标准的 **1:1 左连接 (Left Join)**。通过共同的 Key ID 将“主表”与“从表”连接。\n\n[UI_PREVIEW: merge_logic]\n\n**语法**：`merge 1:1 [key_variable] using [filename]`\n\n**示例**：当前激活 `Sales`，后台有 `Users`。\n`merge 1:1 user_id using Users.csv`\n\n> **结果**：`Users` 表中的列会被添加到 `Sales` 表中 `user_id` 匹配的行上。未匹配的行保留原样（左连接特性）。"
        },
        commands: {
            title: "命令参考手册",
            content: "确定性引擎允许精确的数据操作。所有命令不区分大小写。\n\n### 1. 检查类\n\n#### `summarize [varlist]`\n计算描述性统计量（样本数、均值、标准差、极值）。\n• **示例**：`summ price cost`\n\n#### `describe`\n显示所有变量的元数据（类型、格式）。\n\n#### `list [varlist] in [range]`\n显示原始数据行。\n• **示例**：`list name date in 1/5` (显示前5行)\n\n#### `count`\n返回总行数。\n\n### 2. 操作类\n\n#### `generate new_var = expression`\n使用 JavaScript 语法创建新变量。\n• **算术**：`gen margin = (price - cost) / price`\n• **逻辑**：`gen is_high = price > 100 ? 1 : 0`\n• **数学函数**：`gen log_val = Math.log(val)`\n\n#### `drop [varlist]`\n从内存中永久删除变量。\n• **示例**：`drop temp_id unused_col`\n\n### 3. 系统类\n\n#### `frame change [name]`\n切换当前激活的数据集。\n\n#### `clear all`\n清空内存中所有数据。"
        },
        ai: {
            title: "AI 分析原理与 Prompt 技巧",
            content: "DataStata 使用 **Gemini 2.5 Pro** 进行推理。理解其工作原理有助于获得更好的结果。\n\n### 1. RAG 流程\n我们不会将您的原始数据行发送给 AI。相反，我们执行 **检索增强生成 (RAG)**：\n1. **画像**：我们在本地计算均值、中位数、极值和采样值。\n2. **上下文**：我们将此统计画像 + 您的问题发送给 Gemini。\n3. **洞察**：Gemini 推断数字背后的商业故事。\n\n### 2. 全量分析 vs 自定义分析\n\n#### 全量分析 (Sparkle 图标)\n• **范围**：扫描每一个变量。\n• **适用**：“告诉我我还不知道的。” 用于发现未知的未知。\n• **输出**：标准化的 5 维报告（趋势、优势、异常、劣势、建议）。\n\n#### 自定义分析 (Filter 图标)\n• **范围**：仅限您选择的变量。\n• **适用**：假设验证。“A 是否导致了 B？”\n• **优势**：精度更高。通过过滤掉无关列，AI 将“注意力”预算完全集中在关键变量上。\n\n### 3. 提问技巧\n• **背景**：“我们是一家零售公司...”\n• **具体化**：“分析*按地区分组*的销售额趋势。”\n• **验证**：使用 `summarize` 来验证 AI 讨论的数字。"
        },
        viz: {
            title: "可视化与图表构建器",
            content: "图表可以由 AI 自动生成，也可以通过图表构建器手动创建。\n\n### 1. 图表类型\n我们支持专为商业报告优化的图表类型：\n\n• **折线图 (Line)**：连续的时间序列趋势。\n• **柱状图 (Bar)**：分类比较。\n• **面积图 (Area)**：随时间变化的累积量。\n• **散点图 (Scatter)**：两个数值变量之间的相关性。\n• **矩阵树图 (Treemap)**：层级化的整体构成关系。\n• **环形图 (Donut)**：简单的占比构成（建议分类少于 5 个）。\n\n### 2. 图表构建器 GUI\n[UI_PREVIEW: builder_guide]\n\n• **筛选器**：您可以在绘图前应用预过滤（例如 `Region == 'North'`）。\n• **多系列**：在同一时间轴上添加多个 Y 轴系列以对比指标（例如 收入 vs 成本）。\n• **导出**：所有图表均可导出为高清 JPG，用于 PPT 或报告。"
        }
    }
  },
  'zh-TW': {
     title: "DataStata.AI",
    loadData: "載入資料",
    viewData: "顯示網格",
    hideData: "隱藏網格",
    variables: "變數列表",
    frames: "Frames (資料集)",
    console: "控制台",
    chartWindow: "圖表",
    exportJpg: "匯出 JPG",
    close: "關閉",
    visualize: "視覺化",
    generate: "產生",
    processing: "處理中...",
    commandPlaceholder: "輸入指令 (如: 'summarize price')",
    quickActions: "快速操作",
    createChart: "圖表建構器",
    fullAnalysis: "全量分析",
    customAnalysis: "自定義分析",
    selectDimensions: "選擇維度",
    generatingReport: "正在產生分析報告...",
    reportView: "分析報告",
    printPdf: "匯出 PDF",
    exportHtml: "匯出 HTML",
    type: "類型",
    xAxis: "X 軸",
    yAxis: "Y 軸",
    colorBy: "分組著色",
    sizeBy: "大小權重",
    select: "選擇...",
    ready: "就緒",
    bar: "柱狀圖",
    line: "折線圖",
    area: "面積圖",
    scatter: "散點圖",
    pie: "圓餅圖",
    radar: "雷達圖",
    donut: "環狀圖",
    treemap: "矩陣圖",
    segmentLabel: "分類標籤",
    segmentSize: "數值大小",
    domain: "維度 (Subject)",
    metric: "度量值 (Metric)",
    groupBy: "分組依據",
    help: "說明文件",
    helpTopics: {
        intro: {
            title: "系統概覽與核心架構",
            content: "歡迎使用 DataStata.AI。這是一個旨在彌合傳統命令行統計軟體（如 Stata）與現代大語言模型（LLM）探索性分析之間鴻溝的下一代分析平台。\n\n### 1. 核心設計哲學\n傳統的統計軟體（Stata, SAS, SPSS）提供極高的精度，但學習曲線陡峭。現代 BI 工具（Tableau, PowerBI）視覺化出色，但靈活性不足。DataStata.AI 結合了兩者的優勢：\n• **確定性精度**：基於瀏覽器的本地 JavaScript 引擎負責執行確定性指令（數學運算、過濾、合併），確保資料處理零幻覺，結果絕對準確。\n• **探索性直覺**：Gemini 驅動的 AI 層將自然語言問題（“為什麼銷售額下降？”）轉化為統計查詢和定性洞察。\n\n### 2. 架構圖解\n[UI_PREVIEW: interface_anatomy]\n\n### 3. 隱私與安全機制\n• **本地執行 (Local Execution)**：您的原始資料（CSV/Excel 行）完全在您的瀏覽器記憶體中處理。當您執行 `gen` 或 `summarize` 等指令時，資料從未離開您的設備。\n• **AI 隱私隔離**：僅有“元資料”（Metadata，如列名、均值/最大值/最小值等統計摘要，以及極少量的匿名採樣）會被發送到 AI API 以生成洞察。**完整的原始資料集絕不會上傳到雲端或用於模型訓練。**\n\n### 4. 系統需求\n• **瀏覽器**：建議使用 Chrome, Edge, Brave 等 Chromium 核心瀏覽器，或最新版 Firefox/Safari。需要開啟 WebGL 以支援圖表渲染。\n• **記憶體**：系統完全在 RAM 中運行。建議資料集大小在 50MB 以內（約 50萬行），以確保流暢體驗。超大資料集可能會導致介面回應變慢。"
        },
        workflow: {
            title: "全流程操作指南",
            content: "本指南詳細介紹了從原始資料到生成專業報告的端到端流程。\n\n[UI_PREVIEW: workflow_timeline]\n\n### 第一階段：資料攝入 (Ingestion)\n1. **上傳**：點擊側邊欄的“載入資料”。支援 `.csv`（逗號分隔）和 `.xlsx`（Excel 工作簿）。\n2. **自動解析**：系統會自動檢測：\n   - **表頭**：預設第一行為變數名。\n   - **類型推斷**：自動識別數值 (Number)、字串 (String) 或日期 (Date)。\n   - **日期格式**：支援 ISO (YYYY-MM-DD)、美式 (MM/DD/YYYY) 及 Excel 序列號。\n\n### 第二階段：資料清洗 (Wrangling)\n資料很少是完美的。使用控制台指令進行清洗：\n• **生成變數**：使用 `gen` 建立新指標（如 `gen profit = rev - cost`）。\n• **刪除列**：移除無關干擾項 `drop col_name`。\n• **Frame 管理**：如果上傳了多張表，使用 Frame 切換視角。\n\n### 第三階段：探索性分析 (EDA)\n1. **統計概覽**：執行 `summarize` 檢查異常值（例如年齡欄位出現 999）。\n2. **視覺檢查**：點擊“顯示網格”查看原始資料行。\n3. **分布詢問**：直接問 AI “收入的分布情況如何？”，獲取直方圖或文字描述。\n\n### 第四階段：洞察生成 (Insights)\n• **全量分析 (Sparkle 圖標)**：AI 讀取所有變數的統計摘要，生成一份包含執行摘要、風險分析、機會識別和結構分析的完整報告。\n• **自定義分析 (Filter 圖標)**：勾選特定維度（例如“價格”和“銷量”），強制 AI 僅調查這兩個變數之間的相關性。這能生成更深入、更具體的報告。\n\n### 第五階段：匯出與匯報\n• **圖表匯出**：所有圖表均可單獨下載為高畫質 JPG。\n• **報告匯出**：支援將生成的分析報告匯出為 HTML 格式，便於分享給利益相關者。"
        },
        data: {
            title: "資料管理與 Frame 概念",
            content: "### 1. 'Frame' (資料幀) 概念詳解\n受 Stata 啟發，DataStata.AI 使用 'Frame' 在記憶體中同時管理多個資料集。\n\n#### 為什麼需要 Frame？\n分析複雜業務問題通常需要多張表（例如“交易流水表”和“客戶資訊表”）。Frame 機制允許您將它們分開載入，按需切換，而不是強制立即合併。\n\n#### Frame 操作\n• **啟用 Frame**：任何時候只有一個 Frame 是“啟用”狀態。所有指令僅對目前啟用的 Frame 生效。\n• **切換**：點擊側邊欄的資料集名稱。\n• **指令切換**：`frame change [name]`。\n\n### 2. 變數類型系統\n[UI_PREVIEW: variable_types]\n\n• **數值 (Numeric)**：雙精度浮點數 (Double)。用於數學運算。支援 15 位精度。\n• **字串 (String)**：分類文字。用於分組、標籤。區分大小寫。\n• **日期 (Date)**：內部儲存為 JavaScript Date 物件。對於時間序列分析至關重要。系統能智慧解析多種日期格式。\n\n### 3. 資料集合併 (Merging)\nDataStata 支援標準的 **1:1 Merging**（邏輯上等同於 SQL 的 Left Join）。\n\n**語法**：`merge 1:1 [key_variable] using [other_filename]`\n\n**場景範例**：\n1. Frame A (目前啟用): `Sales.csv` (包含 `user_id`, `amount`)\n2. Frame B: `Users.csv` (包含 `user_id`, `email`)\n3. 執行指令: `merge 1:1 user_id using Users.csv`\n4. **結果**：Frame A 新增了 `email` 列。Frame A 中沒有匹配到的行保留原樣（Left Join 邏輯），未匹配的 B 中資料被丟棄。"
        },
        commands: {
            title: "指令參考手冊 (Command Reference)",
            content: "本手冊涵蓋本地確定性引擎的所有指令。指令不區分大小寫。\n\n### 1. 檢查與統計類\n\n#### `summarize [varlist]`\n計算描述性統計量。\n- **用法**：`summ` (所有變數) 或 `summ price mpg`\n- **輸出**：樣本數 (Obs), 均值 (Mean), 標準差 (Std. Dev.), 最小值, 最大值。\n- **邏輯**：自動忽略缺失值 (null/NaN)。\n\n#### `describe`\n列出元資料。\n- **用法**：`d`\n- **輸出**：變數名、儲存類型、顯示格式。\n\n#### `list [varlist] in [range]`\n顯示原始資料行。\n- **用法**：`list name price in 1/10` (顯示前 10 行)\n- **注意**：為了效能，大列表會被截斷。\n\n#### `count`\n返回目前 Frame 的總行數。\n\n### 2. 資料操作類\n\n#### `generate new_var = expression`\n使用 JavaScript 語法建立新變數。極其強大。\n- **算術**：`gen profit = revenue - cost`\n- **對數**：`gen log_price = Math.log(price)`\n- **取整**：`gen score_int = Math.round(score)`\n- **邏輯判斷**：`gen is_adult = age >= 18 ? 1 : 0` (三元運算符)\n\n#### `drop [varlist]`\n**破壞性操作**。從記憶體中永久刪除列。\n- **用法**：`drop temp_id legacy_code`\n\n### 3. 系統類\n\n#### `clear all`\n清空記憶體中所有資料集。不可撤銷。\n\n#### `frame change [name]`\n切換焦點到另一個資料集。"
        },
        ai: {
            title: "AI 分析原理與 Prompt 技巧",
            content: "### 1. AI 工作原理\n本系統採用適應結構化資料的 **檢索增強生成 (RAG)** 技術。\n1. **畫像生成 (Profiling)**：資料載入時，系統計算“畫像”（元資料、統計量、空值率）。\n2. **上下文注入 (Contextualization)**：當您提問時，我們將您的問題包裹在這些統計畫像中。\n3. **推理 (Reasoning)**：LLM (Gemini 2.5) 分析這些統計量，推斷其現實世界的業務含義。\n\n### 2. 全量分析 vs 自定義分析\n\n#### 全量分析 (Sparkle 圖標)\n- **目標**：對整個資料集進行廣度掃描。\n- **演算法**：自動掃描“異常點”（風險）和“趨勢”（機會）。\n- **局限**：對於超寬資料集（50+ 列），可能會因資訊過載而變得籠統。生成的報告圖表嚴格限制為柱狀圖、折線圖、面積圖，以保持專業性。\n\n#### 自定義分析 (Filter 圖標)\n- **目標**：假設驗證與深度挖掘。\n- **工作流**：您勾選 `Price` 和 `Sales`。Prompt 變為：“僅分析 Price 和 Sales 之間的關係。”\n- **優勢**：AI 不受無關噪音干擾，能生成品質極高、針對性極強的相關性分析報告。\n\n### 3. 提問技巧 (Prompt Engineering)\n- **具體化**：不要只說“分析一下”，試試“按地區劃分的銷售額隨時間變化的趨勢是什麼？”\n- **要求計算**：雖然 AI 不直接計算，但它可以指導您或解釋已有的統計量：“年齡和薪資的相關性可能意味著什麼？”\n- **提出假設**：“日期列是否存在季節性模式？”"
        },
        viz: {
            title: "視覺化與圖表建構器",
            content: "DataStata 提供兩種繪圖方式：AI 自動生成（自然語言）和 用戶自定義（建構器）。\n\n### 1. 圖表類型與最佳實踐\n為了保證報告的專業性，**生成的分析報告**中嚴格限制使用以下三種圖表，但手動建構器支援更多類型：\n\n#### 柱狀圖 (Bar Chart)\n- **適用**：分類比較（如：各城市的銷售額）。\n- **AI 邏輯**：當 X 軸為字串/類別時首選。\n\n#### 折線圖 (Line Chart)\n- **適用**：時間序列趨勢（如：股價走勢）。\n- **AI 邏輯**：當 X 軸為日期或連續數值時首選。\n\n#### 面積圖 (Area Chart)\n- **適用**：隨時間變化的累積量或體量感展示。\n\n*(以下類型僅在手動建構器中可用)*\n#### 散點圖 (Scatter Plot)\n- **適用**：兩個數值指標的相關性（如：身高 vs 體重）。\n\n#### 圓餅圖/環圖 (Pie/Donut)\n- **適用**：占比構成。\n- **警告**：如果分類超過 5 個，建議改用柱狀圖。\n\n### 2. 圖表建構器 GUI\n[UI_PREVIEW: builder_guide]\n\n• **X 軸**：選擇自變數（維度）。\n• **Y 軸**：選擇因變數（度量）。支援添加多個系列（例如同時展示收入和成本）。\n• **篩選器**：繪圖前預過濾資料（例如：僅展示 `Country` == 'China' 的資料）。\n• **配色**：點擊圖例旁的色塊可自定義系列顏色。\n\n### 3. 匯出\n- **單圖匯出**：圖表視窗右上角支援匯出為 JPG。\n- **報告匯出**：分析報告中的圖表會隨 HTML 一同匯出。"
        }
    }
  },
  'ja': {
    title: "DataStata.AI",
    loadData: "データ読込",
    viewData: "グリッド表示",
    hideData: "グリッド非表示",
    variables: "変数",
    frames: "Frames",
    console: "コンソール",
    chartWindow: "チャート",
    exportJpg: "JPG出力",
    close: "閉じる",
    visualize: "可視化",
    generate: "生成",
    processing: "処理中...",
    commandPlaceholder: "コマンドを入力 (例: 'summarize price')",
    quickActions: "クイック操作",
    createChart: "チャートビルダー",
    fullAnalysis: "全体分析",
    customAnalysis: "カスタム分析",
    selectDimensions: "分析対象の選択",
    generatingReport: "レポートを作成中...",
    reportView: "分析レポート",
    printPdf: "PDF出力",
    exportHtml: "HTML出力",
    type: "タイプ",
    xAxis: "X軸",
    yAxis: "Y軸",
    colorBy: "色分け",
    sizeBy: "サイズ",
    select: "選択...",
    ready: "準備完了",
    bar: "棒グラフ",
    line: "折れ線",
    area: "面グラフ",
    scatter: "散布図",
    pie: "円グラフ",
    radar: "レーダー",
    donut: "ドーナツ",
    treemap: "ツリーマップ",
    segmentLabel: "ラベル",
    segmentSize: "サイズ",
    domain: "ドメイン (項目)",
    metric: "メトリック (値)",
    groupBy: "グループ化",
    help: "ヘルプ",
    helpTopics: {
        intro: {
            title: "概要",
            content: "DataStata.AIへようこそ。これは、従来の統計コマンドラインインターフェース（Stataなど）と、最新の大規模言語モデル（LLM）の探索的分析とのギャップを埋める次世代の分析プラットフォームです。\n\n### 1. コア哲学\n従来の統計ソフトウェアは高精度ですが、学習が困難です。現代のBIツールは視覚的ですが、柔軟性に欠けることがあります。DataStata.AIは両方を組み合わせています。\n• **精度**: ローカルJavaScriptエンジンが、決定論的コマンド（数学、フィルタリング、結合）を実行します。\n• **直感**: Gemini駆動のAIレイヤーが、自然言語の質問を統計的クエリと定性的洞察に変換します。\n\n### 2. アーキテクチャ図\n[UI_PREVIEW: interface_anatomy]\n\n### 3. プライバシーとセキュリティ\n• **ローカル実行**: 生データはブラウザ内で処理されます。\n• **AIプライバシー**: メタデータ（列名、統計要約）のみがAIに送信されます。**生データセット全体がクラウドにアップロードされることはありません。**"
        },
        workflow: {
            title: "ワークフローガイド",
            content: "生データからレポートを作成するまでのプロセス。\n\n[UI_PREVIEW: workflow_timeline]\n\n### フェーズ1: データ取り込み\n1. **アップロード**: サイドバーの「データ読込」をクリック。\n2. **解析**: ヘッダー、型、日付形式を自動検出します。\n\n### フェーズ2: データクリーニング\n• **変数生成**: `gen` を使用して新しい指標を作成します。\n• **列の削除**: `drop col_name`。\n\n### フェーズ3: 探索的分析 (EDA)\n1. **統計概要**: `summarize` を実行して外れ値を確認します。\n2. **視覚的検査**: 「グリッド表示」をクリックします。\n\n### フェーズ4: インサイト生成\n• **全体分析**: 全変数の要約を読み取り、完全なレポートを作成します。\n• **カスタム分析**: 特定のディメンションを選択して、その相関関係のみを調査します。\n\n### フェーズ5: エクスポート\n• **チャート**: JPGとしてダウンロード。\n• **レポート**: HTML形式でエクスポート。"
        },
        data: {
            title: "データ管理とFrame",
            content: "### 1. 'Frame' の概念\nStataに触発され、DataStata.AIは複数のデータセットを同時に管理するために 'Frame' を使用します。\n\n### 2. 変数タイプ\n[UI_PREVIEW: variable_types]\n\n### 3. データセットの結合\n標準の **1:1 Merging**（左外部結合）をサポートします。\n\n[UI_PREVIEW: merge_logic]\n\n**構文**: `merge 1:1 [key_variable] using [other_filename]`"
        },
        commands: {
            title: "コマンドリファレンス",
            content: "ローカルエンジンの全コマンドガイド。\n\n### 1. 検査コマンド\n• `summarize [varlist]`: 記述統計を計算。\n• `describe`: メタデータをリスト。\n• `list [varlist] in [range]`: 生データを表示。\n• `count`: 行数を返す。\n\n### 2. 操作コマンド\n• `generate new_var = expression`: JavaScript構文を使用して新しい変数を作成。\n• `drop [varlist]`: 列をメモリから削除。\n\n### 3. システムコマンド\n• `clear all`: すべてのデータを消去。\n• `frame change [name]`: データセットを切り替え。"
        },
        ai: {
            title: "AI分析とプロンプト",
            content: "### 1. 仕組み\nデータロード時に「プロファイル」を計算し、質問時にその統計情報をコンテキストとして注入します。\n\n### 2. 全体分析 vs カスタム分析\n• **全体分析**: データセット全体の広範なスキャン。\n• **カスタム分析**: 仮説検証。特定の変数間の関係に焦点を当てます。\n\n### 3. ヒント\n• 具体的であること。\n• 計算を依頼すること。\n• 仮説を提示すること。"
        },
        viz: {
            title: "可視化",
            content: "### 1. チャートタイプ\nレポートでは、専門性を保つために以下の3つのタイプに制限されます。\n• **棒グラフ**: カテゴリ比較。\n• **折れ線グラフ**: 時系列トレンド。\n• **面グラフ**: 累積量。\n\n(ビルダーでは散布図や円グラフも使用可能)\n\n### 2. チャートビルダーGUI\n[UI_PREVIEW: builder_guide]\n\nX軸、Y軸、フィルタ、色を選択してグラフを作成します。"
        }
    }
  },
  'ko': {
    title: "DataStata.AI",
    loadData: "데이터 로드",
    viewData: "그리드 보기",
    hideData: "그리드 숨기기",
    variables: "변수",
    frames: "Frames",
    console: "콘솔",
    chartWindow: "차트",
    exportJpg: "JPG 내보내기",
    close: "닫기",
    visualize: "시각화",
    generate: "생성",
    processing: "처리 중...",
    commandPlaceholder: "명령 입력 (예: 'summarize price')",
    quickActions: "빠른 작업",
    createChart: "차트 빌더",
    fullAnalysis: "전체 분석",
    customAnalysis: "사용자 정의 분석",
    selectDimensions: "차원 선택",
    generatingReport: "보고서 생성 중...",
    reportView: "분석 보고서",
    printPdf: "PDF 내보내기",
    exportHtml: "HTML 내보내기",
    type: "유형",
    xAxis: "X 축",
    yAxis: "Y 축",
    colorBy: "색상 그룹",
    sizeBy: "크기",
    select: "선택...",
    ready: "준비",
    bar: "막대",
    line: "선",
    area: "영역",
    scatter: "산점도",
    pie: "파이",
    radar: "레이더",
    donut: "도넛",
    treemap: "트리맵",
    segmentLabel: "레이블",
    segmentSize: "크기",
    domain: "도메인 (항목)",
    metric: "메트릭 (값)",
    groupBy: "그룹화",
    help: "도움말",
    helpTopics: {
        intro: {
            title: "시스템 개요",
            content: "DataStata.AI에 오신 것을 환영합니다. 이 플랫폼은 전통적인 통계 명령줄 인터페이스(Stata 등)와 현대적인 대규모 언어 모델(LLM)의 탐색적 분석 간의 격차를 해소하도록 설계되었습니다.\n\n### 1. 핵심 철학\n전통적인 통계 소프트웨어는 정밀하지만 배우기 어렵습니다. 현대적인 BI 도구는 시각적이지만 유연성이 부족할 수 있습니다. DataStata.AI는 두 가지를 결합합니다:\n• **정밀성**: 로컬 JavaScript 엔진이 결정론적 명령(수학, 필터링, 병합)을 실행합니다.\n• **직관성**: Gemini 기반 AI 계층이 자연어 질문을 통계적 쿼리 및 정성적 통찰력으로 변환합니다.\n\n### 2. 아키텍처 다이어그램\n[UI_PREVIEW: interface_anatomy]\n\n### 3. 개인 정보 보호 및 보안\n• **로컬 실행**: 원시 데이터는 브라우저 내에서 처리됩니다.\n• **AI 개인 정보 보호**: 메타데이터(열 이름, 통계 요약)만 AI로 전송됩니다. **전체 원시 데이터 세트는 클라우드에 업로드되지 않습니다.**"
        },
        workflow: {
            title: "워크플로우 가이드",
            content: "원시 데이터에서 보고서까지의 프로세스.\n\n[UI_PREVIEW: workflow_timeline]\n\n### 1단계: 데이터 수집\n1. **업로드**: 사이드바에서 '데이터 로드' 클릭.\n2. **파싱**: 헤더, 유형, 날짜 형식을 자동 감지합니다.\n\n### 2단계: 데이터 정리\n• **변수 생성**: `gen`을 사용하여 새 지표 생성.\n• **열 삭제**: `drop col_name`.\n\n### 3단계: 탐색적 분석 (EDA)\n1. **통계 개요**: `summarize`를 실행하여 이상값을 확인합니다.\n2. **시각적 검사**: '그리드 보기'를 클릭합니다.\n\n### 4단계: 인사이트 생성\n• **전체 분석**: 전체 데이터 세트의 요약을 읽고 전체 보고서를 생성합니다.\n• **사용자 정의 분석**: 특정 차원을 선택하여 해당 상관 관계만 조사합니다.\n\n### 5단계: 내보내기\n• **차트**: JPG로 다운로드.\n• **보고서**: HTML 형식으로 내보내기."
        },
        data: {
            title: "데이터 관리 및 Frame",
            content: "### 1. 'Frame' 개념\nStata에서 영감을 받아 DataStata.AI는 'Frame'을 사용하여 메모리에서 여러 데이터 세트를 동시에 관리합니다.\n\n### 2. 변수 유형\n[UI_PREVIEW: variable_types]\n\n### 3. 데이터 세트 병합\n표준 **1:1 Merging**(왼쪽 조인)을 지원합니다.\n\n[UI_PREVIEW: merge_logic]\n\n**구문**: `merge 1:1 [key_variable] using [other_filename]`"
        },
        commands: {
            title: "명령 참조",
            content: "로컬 엔진의 전체 명령 가이드.\n\n### 1. 검사 명령\n• `summarize [varlist]`: 기술 통계 계산.\n• `describe`: 메타데이터 나열.\n• `list [varlist] in [range]`: 원시 데이터 표시.\n• `count`: 행 수 반환.\n\n### 2. 조작 명령\n• `generate new_var = expression`: JavaScript 구문을 사용하여 새 변수 생성.\n• `drop [varlist]`: 메모리에서 열 삭제.\n\n### 3. 시스템 명령\n• `clear all`: 모든 데이터 지우기.\n• `frame change [name]`: 데이터 세트 전환."
        },
        ai: {
            title: "AI 분석 및 프롬프트",
            content: "### 1. 작동 방식\n데이터 로드 시 '프로필'을 계산하고 질문 시 해당 통계를 컨텍스트로 주입합니다.\n\n### 2. 전체 분석 vs 사용자 정의 분석\n• **전체 분석**: 데이터 세트 전체에 대한 광범위한 스캔.\n• **사용자 정의 분석**: 가설 검증. 특정 변수 간의 관계에 초점을 맞춥니다.\n\n### 3. 팁\n• 구체적으로 질문하십시오.\n• 계산을 요청하십시오.\n• 가설을 제시하십시오."
        },
        viz: {
            title: "시각화",
            content: "### 1. 차트 유형\n보고서에서는 전문성을 유지하기 위해 다음 세 가지 유형으로 제한됩니다.\n• **막대형**: 범주 비교.\n• **선형**: 시계열 추세.\n• **영역형**: 누적 거래량.\n\n(빌더에서는 산점도 및 파이 차트도 사용 가능)\n\n### 2. 차트 빌더 GUI\n[UI_PREVIEW: builder_guide]\n\nX축, Y축, 필터 및 색상을 선택하여 차트를 작성합니다."
        }
    }
  }
};

export const getTranslation = (lang: Language) => {
  return translations[lang] || translations['en'];
};