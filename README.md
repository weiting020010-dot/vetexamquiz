# 獸醫病理題庫 v15 — 部署說明

## 架構
```
quiz_deploy/
├── index.html     主題庫（PWA + Firebase）
├── sw.js          Service Worker（離線快取）
├── manifest.json  PWA 設定（安裝到手機桌面）
├── icon-192.png   App 圖示
└── icon-512.png   App 圖示（大）
```

---

## 步驟一：建立 Firebase 專案（約 10 分鐘）

1. 開啟 https://console.firebase.google.com/
2. 點「新增專案」→ 輸入名稱（例如 `vetexam`）→ 建立
3. 左側選單 → **Firestore Database** → 建立資料庫
   - 選「**以正式模式啟動**」（之後會設定安全規則）
4. 左側選單 → **Authentication** → 開始使用
   - 「登入方式」→「Google」→ 啟用 → 儲存
5. 左側選單 → 齒輪「專案設定」→「一般」→ 下拉到「你的應用程式」
   - 點「**</>**（Web）」→ 輸入暱稱（例如 `quiz`）→ 「**注意：先不要**勾 Firebase Hosting」
   - 點「繼續註冊應用程式」
   - 複製「**firebaseConfig**」整個物件（apiKey、authDomain...）

6. 設定安全規則（左側 Firestore → 規則）：

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null
                         && request.auth.uid == userId;
    }
  }
}
```
→ 發布

---

## 步驟二：填入 Firebase 設定

用文字編輯器（記事本 / VS Code）開啟 `index.html`，
找到（大約在檔案末尾附近）：

```javascript
const FIREBASE_CONFIG = {
  apiKey:            "YOUR_API_KEY",
  authDomain:        "YOUR_PROJECT_ID.firebaseapp.com",
  ...
```

把每一行的 `"YOUR_..."` 替換成你從步驟一複製的值。儲存。

---

## 步驟三：上傳到 GitHub Pages（約 5 分鐘）

1. 開啟 https://github.com/，登入（沒有帳號就免費註冊）
2. 右上角「+」→「New repository」
   - Repository name：`vetexam`（或你喜歡的名字）
   - 設定為 **Public**（Pages 需要 Public）
   - 點「Create repository」
3. 在剛建好的空 repo 頁面，點「**uploading an existing file**」
4. 把 `quiz_deploy/` 資料夾裡的 **5 個檔案**全部拖進去
5. 點「Commit changes」

6. 進入 Settings → Pages（左側選單）
   - Source：**Deploy from a branch**
   - Branch：**main** → `/ (root)` → Save

7. 等 1-2 分鐘，頁面上會出現你的網址：
   ```
   https://你的帳號.github.io/vetexam/
   ```

---

## 步驟四：手機安裝

### Android（Chrome）
1. 手機開啟上方網址
2. 瀏覽器右上角 ⋮ → 「安裝應用程式」或「新增至主畫面」
3. 安裝後可離線使用

### iPhone（Safari）
1. Safari 開啟網址
2. 下方分享按鈕 □↑ → 「加入主畫面」
3. 點擊圖示即可離線使用

---

## 使用說明

| 功能 | 說明 |
|------|------|
| 登入同步 | 右上角按鈕 → Google 登入 → 手機電腦自動同步進度 |
| 離線作答 | 沒網路時正常答題，重新連線後自動同步 |
| 同步指示燈 | 標題旁小圓點：灰=未登入、綠=已同步、黃=儲存中 |
| 清除進度 | 篩選列旁「↺ 清除進度」按鈕 |

---

## 注意事項

- Firebase 免費方案（Spark）：每天 50,000 讀取、20,000 寫入，個人使用完全足夠
- 進度每答一題延遲 2 秒寫入 Firestore（節省寫入次數）
- 沒有網路時：進度存 localStorage，恢復網路後自動上傳
- 如果 Firebase 設定填錯，app 仍可用，只是無法跨裝置同步
