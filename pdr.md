英文單字練習平台 – 程式開發 PRD (PDR)

1. 產品簡介
- 產品名稱：VocaLab（暫定）
- 目標使用者：國高中、大學生、自學者
- 產品定位：讓學生可自行上傳單字、並透過 Gemini 3.0 自動生成題目，提供完整的英文單字練習平台。

2. 產品目標與 KPI (MVP)
- 產品目標：
  1) 建立個人化單字庫
  2) 由 Gemini 3.0 自動生成測驗題目
  3) 提供練習流程與學習結果追蹤
- KPI：
  - 能完成註冊登入
  - 能建立單字清單並上傳至少 20 筆單字
  - 能成功呼叫 Gemini 生成題目
  - 能完成至少一輪練習並查看成績

3. 使用者角色與使用情境
- 學生：自訂考試範圍、課堂範圍或自學單字清單
- 老師（選配）：建立單字清單供班級使用（非 MVP 必須）

使用情境示例：
- 學生上傳包含英文、中文、詞性的 CSV → 建立單字清單 → 生成題目 → 練習。

4. 功能需求（MVP）
4.1 帳號管理
- 註冊、登入、登出
- 使用者僅能存取自己的資料
- 密碼需 hash

4.2 單字清單管理
- 建立單字清單（標題、描述、標籤）
- 新增單字：單筆輸入或批次上傳（CSV/TSV）
- 可編輯與刪除單字
- 上傳後需預覽並確認匯入

4.3 題目生成（Gemini 3.0）
- 使用者點擊「生成題目」
- 系統將單字清單送至後端，呼叫 Gemini 3.0 生成題目
- 要求題目包含：
  - 題型（選擇題、填空等）
  - 題幹、正確答案、選項、解析
- 後端解析 Gemini JSON 結構並寫入資料庫
- 錯誤處理（超時、格式錯誤）

4.4 練習模式
- 練習來源：
  a) 已生成的題庫
  b) 即時產生的基本題型（中翻英、英翻中）
- 題目展示：選擇題、輸入題
- 作答流程：題目 → 回答 → 顯示正確與解析 → 下一題
- 練習結束顯示成績摘要（正確率、錯誤單字）

4.5 進度追蹤
- 每次練習需記錄時間、題數、正確率
- Dashboard 顯示最近練習紀錄與單字清單表現

5. 系統架構與技術規格
- 前端/後端框架：Next.js (App Router)
- DB ORM：Prisma
- 資料庫：PostgreSQL / MySQL / SQLite 均可
- API 採用 Next.js Route Handlers

6. 主要資料模型（Prisma 初稿）
User：email、passwordHash、wordLists、sessions  
WordList：title、description、tags、words、questions  
Word：word、meaning、partOfSpeech、example、difficulty  
Question：type、prompt、optionsJson、explanation、createdByGemini  
PracticeSession：start/end、correctCount、wordListId  
Answer：questionId、userAnswer、isCorrect、timeSpent

7. API 端點（概述）
POST /api/word-lists → 建立清單  
GET /api/word-lists → 取得清單列表  
POST /api/word-lists/:id/words → 新增或上傳單字  
POST /api/word-lists/:id/generate-questions → Gemini 出題  
POST /api/practice/start → 開始練習  
POST /api/practice/:sessionId/answer → 送出答案  
GET /api/practice/:sessionId/summary → 練習結果

8. UI / UX 流程
- 登入 → Dashboard（建立清單 + 顯示紀錄）  
- 單字清單頁：管理單字、上傳、生成題目、開始練習  
- 練習頁：題目呈現 → 作答 → 結束 → 成績頁  

9. 非功能性需求
- 安全性：Session 驗證、密碼 hash  
- 穩定性：Gemini API 錯誤處理  
- 效能：單次上傳限制，如 1000 筆  
- 日誌：記錄 Gemini 錯誤 / API 失敗點（MVP 可簡化）

10. 開發時程（示例）
第 1 週：專案初始化 + 帳號系統  
第 2 週：單字清單 CRUD  
第 3 週：上傳匯入單字 + 練習基本流程  
第 4 週：整合 Gemini 自動出題  
第 5 週：修正、強化 UX、部署 MVP
