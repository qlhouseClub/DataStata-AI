
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
    help: "Help",
    helpTopics: {
        intro: {
            title: "Overview",
            content: "DataStata.AI integrates traditional statistical command processing with an LLM-based analysis engine. It allows users to perform data manipulation locally within the browser while utilizing AI for qualitative interpretation and complex syntax generation.\n\n### Core Architecture\nThe application operates on a hybrid model:\n• **Local Engine**: File parsing, variable generation, filtering, and statistical calculations (mean, median, standard deviation) occur locally using JavaScript. This ensures zero latency for standard operations.\n• **AI Engine**: Statistical summaries (metadata) are sent to the Gemini API to generate insights, explain trends, or create visualization configurations.\n\n[UI_PREVIEW: interface_anatomy]\n\n### System Requirements\n• **Browser**: Chrome, Edge, Safari, or Firefox (Modern versions).\n• **Network**: Active internet connection required for AI features (Chat). Local commands (Summarize, Gen) work offline once loaded."
        },
        workflow: {
            title: "Workflow Simulation",
            content: "This section illustrates a standard analysis session from start to finish.\n\n[UI_PREVIEW: workflow_timeline]\n\n### Step 1: Data Ingestion\nUsers begin by uploading a dataset. The system parses headers and detects data types automatically.\n> **Frame**: A container for a single dataset. Multiple files create multiple Frames.\n\n### Step 2: Inspection\nBefore analysis, it is standard practice to verify data integrity using the `summarize` or `describe` commands to check for missing values or outliers.\n\n### Step 3: Execution\nUsers can choose between:\n• **Imperative Commands**: Precise control (e.g., `gen log_x = Math.log(x)`).\n• **Natural Language**: Exploratory queries (e.g., \"What drives revenue?\")."
        },
        data: {
            title: "Data Structures",
            content: "### Supported Formats\nThe application accepts flat-file databases:\n• **CSV (.csv)**: Comma-Separated Values. First row must contain headers.\n• **Excel (.xlsx)**: Each sheet is loaded as a separate Frame.\n\n### Variable Types\nThe system automatically infers data types upon loading. You can verify types in the Sidebar.\n\n[UI_PREVIEW: variable_types]\n\n### Multi-Dataset Operations (Frames)\nThe application supports working with multiple datasets simultaneously, referred to as **Frames**.\n\n#### Switching Frames\nClick the Frame name in the sidebar to make it active. All commands apply only to the active Frame.\n\n#### Merging Frames\nData from one Frame can be joined to the active Frame using a common identifier (Key Variable).\n• **Command**: `merge 1:1 [key_var] using [filename]`\n• **Requirement**: The key variable must exist in both datasets with the same name."
        },
        commands: {
            title: "Command Reference",
            content: "Commands are case-insensitive and executed locally. Below is the strict syntax reference.\n\n### Inspection\n• **summarize [varlist]**: Calculates Obs, Mean, Std. Dev, Min, Max.\n  `su price mpg`\n• **describe**: Lists variable names and storage types.\n  `d`\n• **list [varlist] in [range]**: Displays raw data rows.\n  `list make price in 1/5`\n• **count**: Returns the number of observations (rows).\n\n### Manipulation\n• **generate [newvar] = [expression]**: Creates a new column based on a JavaScript expression.\n  `gen volume = height * width * depth`\n  `gen log_price = Math.log(price)`\n• **drop [varlist]**: Removes columns from memory.\n  `drop temp_var`\n\n### System\n• **clear all**: Removes all datasets from memory.\n• **frame change [name]**: Switches the active dataset."
        },
        ai: {
            title: "AI & Insights",
            content: "The AI module interprets natural language to perform tasks that would otherwise require complex syntax.\n\n### Logic Flow\n1. **User Query**: \"Why is profit low?\"\n2. **Context Injection**: The system calculates summaries (not raw rows) of all variables and sends them to the model.\n3. **Reasoning**: The model correlates high-variance variables or identifies outliers in the summaries.\n4. **Response**: The model returns text analysis or a JSON configuration to render a chart.\n\n### Capabilities\n• **Trend Analysis**: Interpreting numerical distribution.\n• **Syntax Translation**: Converting English to Stata commands.\n• **Hypothesis Generation**: Suggesting relationships between variables based on names and types.\n\n> **Note**: For privacy, raw data rows are not sent to the AI unless specifically requested (e.g., \"Analyze the first 5 rows\"). By default, only metadata (Mean/Max/Min) is transmitted."
        },
        viz: {
            title: "Visualization",
            content: "Charts are rendered using the Recharts library. Two methods exist for creation.\n\n### Method A: Natural Language\nDescribe the desired chart in the Command Console.\n• \"Scatter plot of A vs B\"\n• \"Line chart of Date and Close\"\n\n### Method B: Chart Builder\nFor precise axis control, use the GUI Builder.\n\n[UI_PREVIEW: builder_guide]\n\n#### Configuration Parameters\n• **X-Axis**: The independent variable (Category, Time).\n• **Y-Axis**: The dependent variable(s) (Values).\n• **Group/Color**: Used for creating multiple series based on a categorical variable.\n• **Filter**: Restrict the data range before plotting."
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
    help: "帮助",
    helpTopics: {
        intro: {
            title: "系统概览",
            content: "DataStata.AI 将传统的统计命令处理与 LLM (大语言模型) 分析引擎相结合。它允许用户在浏览器内本地进行数据清洗和操作，同时利用 AI 进行定性解释和复杂语法的生成。\n\n### 核心架构\n本应用采用混合模式运行：\n• **本地引擎**: 文件解析、变量生成、筛选和统计计算（均值、中位数、标准差）均通过 JavaScript 在本地完成。这确保了标准操作的零延迟。\n• **AI 引擎**: 系统将统计摘要（元数据）发送至 Gemini API，以生成洞察、解释趋势或创建可视化配置。\n\n[UI_PREVIEW: interface_anatomy]\n\n### 系统要求\n• **浏览器**: Chrome, Edge, Safari 或 Firefox (建议使用最新版本)。\n• **网络**: AI 功能（对话）需要有效的互联网连接。本地命令（Summarize, Gen）在加载后可离线使用。"
        },
        workflow: {
            title: "完整工作流模拟",
            content: "本节演示从开始到结束的标准分析会话。\n\n[UI_PREVIEW: workflow_timeline]\n\n### 步骤 1: 数据摄入\n用户上传数据集。系统会自动解析表头并检测每一列的数据类型。\n> **Frame (帧)**: 单个数据集的容器。上传多个文件将创建多个 Frame。\n\n### 步骤 2: 数据检查\n在分析之前，标准做法是使用 `summarize` 或 `describe` 命令验证数据完整性，检查是否存在缺失值或异常值。\n\n### 步骤 3: 执行分析\n用户可以选择：\n• **指令式命令**: 精确控制 (例如: `gen log_x = Math.log(x)`)\n• **自然语言**: 探索性查询 (例如: “分析收入的主要驱动因素”)"
        },
        data: {
            title: "数据结构",
            content: "### 支持的格式\n应用程序接受以下平面文件数据库：\n• **CSV (.csv)**: 逗号分隔值。第一行必须包含表头。\n• **Excel (.xlsx)**: 每个 Sheet（工作表）将作为单独的 Frame 加载。\n\n### 变量类型\n系统在加载时自动推断数据类型。您可以在侧边栏中验证类型。\n\n[UI_PREVIEW: variable_types]\n\n### 多数据集操作 (Frames)\n应用程序支持同时处理多个数据集，这些数据集被称为 **Frames**。\n\n#### 切换 Frame\n在侧边栏点击 Frame 名称即可激活它。所有后续命令仅适用于当前激活的 Frame。\n\n#### 合并 Frames\n可以使用通用标识符（键变量）将一个 Frame 的数据连接到当前激活的 Frame。\n• **命令**: `merge 1:1 [键变量] using [文件名]`\n• **要求**: 键变量必须在两个数据集中存在且名称相同。"
        },
        commands: {
            title: "命令参考",
            content: "命令不区分大小写，并在本地执行。以下是严格的语法参考。\n\n### 检查与统计\n• **summarize [变量列表]**: 计算观测数、均值、标准差、最小值、最大值。\n  `su price mpg`\n• **describe**: 列出变量名称和存储类型。\n  `d`\n• **list [变量列表] in [范围]**: 显示原始数据行。\n  `list make price in 1/5`\n• **count**: 返回观测值（行）的数量。\n\n### 数据操作\n• **generate [新变量] = [表达式]**: 基于 JavaScript 表达式创建新列。\n  `gen volume = height * width * depth`\n  `gen log_price = Math.log(price)`\n• **drop [变量列表]**: 从内存中删除列。\n  `drop temp_var`\n\n### 系统\n• **clear all**: 从内存中清除所有数据集。\n• **frame change [名称]**: 切换当前激活的数据集。"
        },
        ai: {
            title: "AI 与洞察",
            content: "AI 模块解释自然语言，以执行通常需要复杂语法才能完成的任务。\n\n### 逻辑流程\n1. **用户查询**: “为什么利润偏低？”\n2. **上下文注入**: 系统计算所有变量的统计摘要（而非原始行），并将其发送给模型。\n3. **推理**: 模型根据摘要关联高方差变量或识别异常值。\n4. **响应**: 模型返回文本分析结果或用于渲染图表的 JSON 配置。\n\n### 能力\n• **趋势分析**: 解释数值分布。\n• **语法转换**: 将自然语言转换为 Stata 命令。\n• **假设生成**: 根据变量名称和类型建议变量之间的关系。\n\n> **注意**: 为保护隐私，除非特别请求（例如：“分析前5行”），否则不会向 AI 发送原始数据行。默认情况下，仅传输元数据（均值/最大值/最小值）。"
        },
        viz: {
            title: "可视化",
            content: "图表使用 Recharts 库渲染。创建图表有两种方法。\n\n### 方法 A: 自然语言\n在命令控制台中描述所需的图表。\n• “绘制 A 与 B 的散点图”\n• “日期和收盘价的折线图”\n\n### 方法 B: 图表构建器\n如需精确的轴控制，请使用 GUI 构建器。\n\n[UI_PREVIEW: builder_guide]\n\n#### 配置参数\n• **X 轴**: 自变量（类别、时间）。\n• **Y 轴**: 因变量（数值）。\n• **分组/颜色**: 用于基于分类变量创建多个系列。\n• **筛选**: 在绘图前限制数据范围。"
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
    help: "說明",
    helpTopics: {
        intro: {
            title: "系統概覽",
            content: "DataStata.AI 將傳統的統計指令處理與 LLM (大語言模型) 分析引擎相結合。它允許使用者在瀏覽器內本地進行資料清洗和操作，同時利用 AI 進行定性解釋和複雜語法的生成。\n\n### 核心架構\n本應用程式採用混合模式運行：\n• **本地引擎**: 檔案解析、變數生成、篩選和統計計算（均值、中位數、標準差）均透過 JavaScript 在本地完成。這確保了標準操作的零延遲。\n• **AI 引擎**: 系統將統計摘要（元數據）傳送至 Gemini API，以生成洞察、解釋趨勢或建立視覺化配置。\n\n[UI_PREVIEW: interface_anatomy]\n\n### 系統需求\n• **瀏覽器**: Chrome, Edge, Safari 或 Firefox (建議使用最新版本)。\n• **網路**: AI 功能（對話）需要有效的網際網路連線。本地指令（Summarize, Gen）在載入後可離線使用。"
        },
        workflow: {
            title: "完整工作流程模擬",
            content: "本節演示從開始到結束的標準分析工作階段。\n\n[UI_PREVIEW: workflow_timeline]\n\n### 步驟 1: 資料攝入\n使用者上傳資料集。系統會自動解析表頭並檢測每一列的資料類型。\n> **Frame (幀)**: 單個資料集的容器。上傳多個檔案將建立多個 Frame。\n\n### 步驟 2: 資料檢查\n在分析之前，標準做法是使用 `summarize` 或 `describe` 指令驗證資料完整性，檢查是否存在缺失值或異常值。\n\n### 步驟 3: 執行分析\n使用者可以選擇：\n• **指令式操作**: 精確控制 (例如: `gen log_x = Math.log(x)`)\n• **自然語言**: 探索性查詢 (例如: “分析收入的主要驅動因素”)"
        },
        data: {
            title: "資料結構",
            content: "### 支援的格式\n應用程式接受以下平面檔案資料庫：\n• **CSV (.csv)**: 逗號分隔值。第一行必須包含表頭。\n• **Excel (.xlsx)**: 每個 Sheet（工作表）將作為單獨的 Frame 載入。\n\n### 變數類型\n系統在載入時自動推斷資料類型。您可以在側邊欄中驗證類型。\n\n[UI_PREVIEW: variable_types]\n\n### 多資料集操作 (Frames)\n應用程式支援同時處理多個資料集，這些資料集被稱為 **Frames**。\n\n#### 切換 Frame\n在側邊欄點擊 Frame 名稱即可啟用它。所有後續指令僅適用於目前啟用的 Frame。\n\n#### 合併 Frames\n可以使用通用識別符（鍵變數）將一個 Frame 的資料連接到目前啟用的 Frame。\n• **指令**: `merge 1:1 [鍵變數] using [檔名]`\n• **要求**: 鍵變數必須在兩個資料集中存在且名稱相同。"
        },
        commands: {
            title: "指令參考",
            content: "指令不區分大小寫，並在本地執行。以下是嚴格的語法參考。\n\n### 檢查與統計\n• **summarize [變數列表]**: 計算觀測數、均值、標準差、最小值、最大值。\n  `su price mpg`\n• **describe**: 列出變數名稱和儲存類型。\n  `d`\n• **list [變數列表] in [範圍]**: 顯示原始資料行。\n  `list make price in 1/5`\n• **count**: 返回觀測值（行）的數量。\n\n### 資料操作\n• **generate [新變數] = [表達式]**: 基於 JavaScript 表達式建立新列。\n  `gen volume = height * width * depth`\n  `gen log_price = Math.log(price)`\n• **drop [變數列表]**: 從記憶體中刪除列。\n  `drop temp_var`\n\n### 系統\n• **clear all**: 從記憶體中清除所有資料集。\n• **frame change [名稱]**: 切換目前啟用的資料集。"
        },
        ai: {
            title: "AI 與洞察",
            content: "AI 模組解釋自然語言，以執行通常需要複雜語法才能完成的任務。\n\n### 邏輯流程\n1. **使用者查詢**: “為什麼利潤偏低？”\n2. **上下文注入**: 系統計算所有變數的統計摘要（而非原始行），並將其傳送給模型。\n3. **推理**: 模型根據摘要關聯高變異變數或識別異常值。\n4. **回應**: 模型返回文字分析結果或用於渲染圖表的 JSON 配置。\n\n### 能力\n• **趨勢分析**: 解釋數值分佈。\n• **語法轉換**: 將自然語言轉換為 Stata 指令。\n• **假設生成**: 根據變數名稱和類型建議變數之間的關係。\n\n> **注意**: 為保護隱私，除非特別請求（例如：“分析前5行”），否則不會向 AI 傳送原始資料行。預設情況下，僅傳輸元數據（均值/最大值/最小值）。"
        },
        viz: {
            title: "視覺化",
            content: "圖表使用 Recharts 庫渲染。建立圖表有兩種方法。\n\n### 方法 A: 自然語言\n在命令控制台中描述所需的圖表。\n• “繪製 A 與 B 的散點圖”\n• “日期和收盤價的折線圖”\n\n### 方法 B: 圖表建構器\n如需精確的軸控制，請使用 GUI 建構器。\n\n[UI_PREVIEW: builder_guide]\n\n#### 配置參數\n• **X 軸**: 自變數（類別、時間）。\n• **Y 軸**: 因變數（數值）。\n• **分組/顏色**: 用於基於分類變數建立多個系列。\n• **篩選**: 在繪圖前限制資料範圍。"
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
    help: "ヘルプ",
    helpTopics: {
        intro: {
            title: "概要",
            content: "DataStata.AIは、従来の統計コマンド処理とLLM（大規模言語モデル）分析エンジンを統合したものです。ブラウザ内でローカルにデータ操作を実行しながら、AIを利用して定性的な解釈や複雑な構文生成を行うことができます。\n\n### コアアーキテクチャ\n本アプリケーションはハイブリッドモデルで動作します。\n• **ローカルエンジン**: ファイル解析、変数生成、フィルタリング、および統計計算（平均、中央値、標準偏差）は、JavaScriptを使用してローカルで行われます。これにより、標準操作のレイテンシがゼロになります。\n• **AIエンジン**: 統計的要約（メタデータ）がGemini APIに送信され、インサイトの生成、傾向の説明、または可視化構成の作成が行われます。\n\n[UI_PREVIEW: interface_anatomy]\n\n### システム要件\n• **ブラウザ**: Chrome, Edge, Safari, または Firefox（最新バージョン）。\n• **ネットワーク**: AI機能（チャット）にはアクティブなインターネット接続が必要です。ローカルコマンド（Summarize, Gen）は、読み込み後にオフラインで機能します。"
        },
        workflow: {
            title: "ワークフローシミュレーション",
            content: "このセクションでは、開始から終了までの標準的な分析セッションを示します。\n\n[UI_PREVIEW: workflow_timeline]\n\n### ステップ1: データ取り込み\nユーザーはデータセットをアップロードすることから始めます。システムはヘッダーを解析し、データ型を自動的に検出します。\n> **Frame**: 単一のデータセットのコンテナです。複数のファイルは複数のFrameを作成します。\n\n### ステップ2: 検査\n分析の前に、`summarize` または `describe` コマンドを使用してデータの整合性を検証し、欠損値や外れ値がないか確認するのが標準的な慣行です。\n\n### ステップ3: 実行\nユーザーは以下を選択できます。\n• **命令型コマンド**: 正確な制御（例: `gen log_x = Math.log(x)`）。\n• **自然言語**: 探索的クエリ（例: 「収益の要因は何ですか？」）。"
        },
        data: {
            title: "データ構造",
            content: "### サポートされている形式\nアプリケーションは以下のフラットファイルデータベースを受け入れます。\n• **CSV (.csv)**: カンマ区切り値。最初の行にはヘッダーが含まれている必要があります。\n• **Excel (.xlsx)**: 各シートは個別のFrameとして読み込まれます。\n\n### 変数タイプ\nシステムは読み込み時にデータ型を自動的に推測します。サイドバーで型を確認できます。\n\n[UI_PREVIEW: variable_types]\n\n### マルチデータセット操作 (Frames)\nアプリケーションは、**Frames**と呼ばれる複数のデータセットを同時に扱うことをサポートしています。\n\n#### Frameの切り替え\nサイドバーのFrame名をクリックしてアクティブにします。すべてのコマンドはアクティブなFrameにのみ適用されます。\n\n#### Frameの結合\n共通の識別子（キー変数）を使用して、あるFrameのデータをアクティブなFrameに結合できます。\n• **コマンド**: `merge 1:1 [キー変数] using [ファイル名]`\n• **要件**: キー変数は、両方のデータセットに同じ名前で存在する必要があります。"
        },
        commands: {
            title: "コマンドリファレンス",
            content: "コマンドは大文字と小文字を区別せず、ローカルで実行されます。以下は厳密な構文リファレンスです。\n\n### 検査\n• **summarize [変数リスト]**: 観測数、平均、標準偏差、最小値、最大値を計算します。\n  `su price mpg`\n• **describe**: 変数名と保存タイプをリストします。\n  `d`\n• **list [変数リスト] in [範囲]**: 生のデータ行を表示します。\n  `list make price in 1/5`\n• **count**: 観測（行）の数を返します。\n\n### 操作\n• **generate [新変数] = [式]**: JavaScript式に基づいて新しい列を作成します。\n  `gen volume = height * width * depth`\n  `gen log_price = Math.log(price)`\n• **drop [変数リスト]**: メモリから列を削除します。\n  `drop temp_var`\n\n### システム\n• **clear all**: メモリからすべてのデータセットを削除します。\n• **frame change [名前]**: アクティブなデータセットを切り替えます。"
        },
        ai: {
            title: "AI & インサイト",
            content: "AIモジュールは自然言語を解釈し、通常は複雑な構文を必要とするタスクを実行します。\n\n### ロジックフロー\n1. **ユーザークエリ**: 「なぜ利益が低いのですか？」\n2. **コンテキスト注入**: システムはすべての変数の要約（生の行ではない）を計算し、モデルに送信します。\n3. **推論**: モデルは分散の高い変数を相関させるか、要約内の外れ値を特定します。\n4. **応答**: モデルはテキスト分析またはチャートをレンダリングするためのJSON構成を返します。\n\n### 機能\n• **傾向分析**: 数値分布の解釈。\n• **構文変換**: 英語からStataコマンドへの変換。\n• **仮説生成**: 名前とタイプに基づいて変数間の関係を提案します。\n\n> **注意**: プライバシーのため、特に要求されない限り（例: 「最初の5行を分析して」）、生のデータ行はAIに送信されません。デフォルトでは、メタデータ（平均/最大/最小）のみが送信されます。"
        },
        viz: {
            title: "可視化",
            content: "チャートはRechartsライブラリを使用してレンダリングされます。作成には2つの方法があります。\n\n### 方法A: 自然言語\nコマンドコンソールで目的のチャートを記述します。\n• 「A対Bの散布図」\n• 「日付と終値の折れ線グラフ」\n\n### 方法B: チャートビルダー\n正確な軸制御を行うには、GUIビルダーを使用します。\n\n[UI_PREVIEW: builder_guide]\n\n#### 構成パラメータ\n• **X軸**: 独立変数（カテゴリ、時間）。\n• **Y軸**: 従属変数（値）。\n• **グループ/色**: カテゴリ変数に基づいて複数のシリーズを作成するために使用されます。\n• **フィルタ**: プロットする前にデータ範囲を制限します。"
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
    help: "도움말",
    helpTopics: {
        intro: {
            title: "시스템 개요",
            content: "DataStata.AI는 전통적인 통계 명령 처리와 LLM(대규모 언어 모델) 분석 엔진을 통합합니다. 사용자는 브라우저 내에서 로컬로 데이터를 조작하는 동시에 AI를 활용하여 정성적 해석과 복잡한 구문 생성을 수행할 수 있습니다.\n\n### 핵심 아키텍처\n이 애플리케이션은 하이브리드 모델로 작동합니다:\n• **로컬 엔진**: 파일 파싱, 변수 생성, 필터링 및 통계 계산(평균, 중앙값, 표준 편차)은 JavaScript를 사용하여 로컬에서 수행됩니다. 이를 통해 표준 작업의 지연 시간을 없앱니다.\n• **AI 엔진**: 통계 요약(메타데이터)이 Gemini API로 전송되어 인사이트를 생성하고, 추세를 설명하거나 시각화 구성을 생성합니다.\n\n[UI_PREVIEW: interface_anatomy]\n\n### 시스템 요구 사항\n• **브라우저**: Chrome, Edge, Safari 또는 Firefox (최신 버전).\n• **네트워크**: AI 기능(채팅)에는 인터넷 연결이 필요합니다. 로컬 명령(Summarize, Gen)은 로드된 후 오프라인에서 작동합니다."
        },
        workflow: {
            title: "워크플로우 시뮬레이션",
            content: "이 섹션에서는 시작부터 끝까지의 표준 분석 세션을 보여줍니다.\n\n[UI_PREVIEW: workflow_timeline]\n\n### 1단계: 데이터 수집\n사용자는 데이터 세트를 업로드하여 시작합니다. 시스템은 헤더를 파싱하고 데이터 유형을 자동으로 감지합니다.\n> **Frame**: 단일 데이터 세트의 컨테이너입니다. 여러 파일은 여러 Frame을 생성합니다.\n\n### 2단계: 검사\n분석 전에 `summarize` 또는 `describe` 명령을 사용하여 데이터 무결성을 검증하고 결측값이나 이상값을 확인하는 것이 표준 관행입니다.\n\n### 3단계: 실행\n사용자는 다음 중에서 선택할 수 있습니다:\n• **명령형 명령**: 정밀 제어 (예: `gen log_x = Math.log(x)`).\n• **자연어**: 탐색적 쿼리 (예: \"수익의 요인은 무엇입니까?\")."
        },
        data: {
            title: "데이터 구조",
            content: "### 지원되는 형식\n애플리케이션은 다음 플랫 파일 데이터베이스를 허용합니다:\n• **CSV (.csv)**: 쉼표로 구분된 값. 첫 번째 행에는 헤더가 포함되어야 합니다.\n• **Excel (.xlsx)**: 각 시트는 별도의 Frame으로 로드됩니다.\n\n### 변수 유형\n시스템은 로드 시 데이터 유형을 자동으로 추론합니다. 사이드바에서 유형을 확인할 수 있습니다.\n\n[UI_PREVIEW: variable_types]\n\n### 다중 데이터 세트 작업 (Frames)\n애플리케이션은 **Frames**라고 하는 여러 데이터 세트를 동시에 작업하는 것을 지원합니다.\n\n#### Frame 전환\n사이드바에서 Frame 이름을 클릭하여 활성화합니다. 모든 명령은 활성 Frame에만 적용됩니다.\n\n#### Frame 병합\n공통 식별자(키 변수)를 사용하여 한 Frame의 데이터를 활성 Frame에 결합할 수 있습니다.\n• **명령**: `merge 1:1 [키 변수] using [파일명]`\n• **요구 사항**: 키 변수는 두 데이터 세트에 동일한 이름으로 존재해야 합니다."
        },
        commands: {
            title: "명령 참조",
            content: "명령은 대소문자를 구분하지 않으며 로컬에서 실행됩니다. 다음은 엄격한 구문 참조입니다.\n\n### 검사\n• **summarize [변수 목록]**: 관측 수, 평균, 표준 편차, 최소값, 최대값을 계산합니다.\n  `su price mpg`\n• **describe**: 변수 이름과 저장 유형을 나열합니다.\n  `d`\n• **list [변수 목록] in [범위]**: 원시 데이터 행을 표시합니다.\n  `list make price in 1/5`\n• **count**: 관측(행) 수를 반환합니다.\n\n### 조작\n• **generate [새 변수] = [표현식]**: JavaScript 표현식을 기반으로 새 열을 생성합니다.\n  `gen volume = height * width * depth`\n  `gen log_price = Math.log(price)`\n• **drop [변수 목록]**: 메모리에서 열을 삭제합니다.\n  `drop temp_var`\n\n### 시스템\n• **clear all**: 메모리에서 모든 데이터 세트를 삭제합니다.\n• **frame change [이름]**: 활성 데이터 세트를 전환합니다."
        },
        ai: {
            title: "AI 및 인사이트",
            content: "AI 모듈은 자연어를 해석하여 일반적으로 복잡한 구문이 필요한 작업을 수행합니다.\n\n### 논리 흐름\n1. **사용자 쿼리**: \"수익이 낮은 이유는 무엇입니까?\"\n2. **컨텍스트 주입**: 시스템은 모든 변수의 요약(원시 행 아님)을 계산하여 모델로 전송합니다.\n3. **추론**: 모델은 분산이 높은 변수를 상관시키거나 요약 내의 이상값을 식별합니다.\n4. **응답**: 모델은 텍스트 분석 또는 차트를 렌더링하기 위한 JSON 구성을 반환합니다.\n\n### 기능\n• **추세 분석**: 수치 분포 해석.\n• **구문 변환**: 영어를 Stata 명령으로 변환.\n• **가설 생성**: 이름과 유형을 기반으로 변수 간의 관계 제안.\n\n> **참고**: 개인 정보 보호를 위해 특별히 요청되지 않는 한(예: \"처음 5행 분석\"), 원시 데이터 행은 AI로 전송되지 않습니다. 기본적으로 메타데이터(평균/최대/최소)만 전송됩니다."
        },
        viz: {
            title: "시각화",
            content: "차트는 Recharts 라이브러리를 사용하여 렌더링됩니다. 생성에는 두 가지 방법이 있습니다.\n\n### 방법 A: 자연어\n명령 콘솔에서 원하는 차트를 설명합니다.\n• \"A 대 B의 산점도\"\n• \"날짜 및 종가의 선 차트\"\n\n### 방법 B: 차트 빌더\n정밀한 축 제어를 하려면 GUI 빌더를 사용하십시오.\n\n[UI_PREVIEW: builder_guide]\n\n#### 구성 매개변수\n• **X 축**: 독립 변수(범주, 시간).\n• **Y 축**: 종속 변수(값).\n• **그룹/색상**: 범주형 변수를 기반으로 여러 시리즈를 생성하는 데 사용됩니다.\n• **필터**: 플로팅하기 전에 데이터 범위를 제한합니다."
        }
    }
  }
};

export const getTranslation = (lang: Language) => translations[lang];
