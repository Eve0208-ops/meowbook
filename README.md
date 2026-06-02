# 🐱 暹罗记账 · 使用说明

## 这是什么
一个**暹罗猫主题**的记账小工具，做成"网页应用 (PWA)"。  
特点：
- 📱 可装到 iPhone 主屏幕，用起来像 App
- 💾 数据全部存在你手机本地，不上传任何服务器
- 📊 支持按 日 / 周 / 月 / 年 + 6 类用途 查看占比
- 🌐 一次加载后可离线使用

---

## 文件清单
```
Book/
├── index.html              ← 主页面
├── styles.css              ← 样式（暹罗猫配色）
├── app.js                  ← 记账逻辑
├── manifest.json           ← PWA 配置
├── sw.js                   ← 离线缓存
├── generate-icons.html     ← 一次性图标生成器
└── icons/
    ├── cat.svg             ← 暹罗猫 logo
    ├── cat-sleep.svg       ← 睡猫插画（空状态）
    └── icon-180/192/512.png← 主屏幕图标（首次需生成）
```

---

## 第一步：生成 iPhone 主屏图标（一次性，1分钟）

> 这是为了让装到主屏幕后图标是暹罗猫脸，而不是网页截图。

1. 双击 `generate-icons.html` 用浏览器打开
2. 点击 **"生成并下载图标"** 按钮
3. 浏览器会自动下载 3 个 PNG 文件：`icon-180.png`、`icon-192.png`、`icon-512.png`
4. 把它们**从"下载"文件夹移动到本项目的 `icons/` 文件夹里**

---

## 第二步：在电脑上启动本地服务（让 iPhone 能访问）

> PWA 必须通过 http(s) 协议访问，不能直接用 file:// 打开。

打开 PowerShell，**先 cd 到 Book 文件夹**，然后任选其一：

### 方案 A · 用 Python（如果你电脑装了 Python）
```powershell
cd "C:\Users\zhao.y.57\OneDrive - Procter and Gamble\Eve\personal\Book"
python -m http.server 8000
```

### 方案 B · 用 Node.js（如果装了 Node）
```powershell
cd "C:\Users\zhao.y.57\OneDrive - Procter and Gamble\Eve\personal\Book"
npx serve -l 8000
```

### 方案 C · 没有上面两个？装一个就行
推荐 Python：去 https://www.python.org/downloads/ 下载安装即可（安装时勾选 "Add Python to PATH"）。

启动后会显示类似 `Serving HTTP on 0.0.0.0 port 8000` 的字样，**保持这个窗口开着**。

---

## 第三步：iPhone 上访问 + 添加到主屏幕

1. **确保 iPhone 和电脑连同一个 Wi-Fi**
2. 在电脑 PowerShell 里运行 `ipconfig`，找到 **IPv4 地址**（例如 `192.168.1.100`）
3. iPhone 打开 **Safari**（必须 Safari，Chrome 不行），访问：
   ```
   http://192.168.1.100:8000
   ```
4. 看到记账界面后，点底部 **分享按钮 ⬆️** → 选择 **"添加到主屏幕"**
5. 完成！主屏幕上会出现一个暹罗猫图标，点开就能用，**关掉电脑也能用**（已缓存到本地）。

---

## 第四步（可选）· 让记账更快捷

iOS 的小组件 + 快捷指令可以做到"1 秒进入记账"：

1. 长按主屏幕空白处 → 左上角 **+** → 搜索 **"Safari"** → 选 **"Safari 阅读列表"** 大组件 ❌（这个不太好用）  

**更推荐做法：**
1. 长按 App 图标 → "编辑主屏幕" → 把它放到 **Dock 栏**（屏幕最底部一排）
2. 这样无论在哪个页面，从下往上滑回主屏，**一眼就能看到、一点就能记**

---

## 常见问题

**Q：图标在 iPhone 上显示成网页截图？**  
→ 说明 PNG 图标没放到 `icons/` 文件夹。重做"第一步"。

**Q：iPhone 上打不开网址？**  
→ 1) 检查是否同一 Wi-Fi；2) 检查电脑防火墙是否拦截了 8000 端口；3) 试用 `ipconfig` 看到的其他 IPv4。

**Q：换手机/重装 Safari 数据会丢吗？**  
→ 会。数据存在 Safari 的 localStorage 里。**重要数据请定期截图保存**，后续我可以加"导出 Excel"功能。

**Q：能在线上让别人也访问吗？**  
→ 可以免费部署到 GitHub Pages / Vercel / Netlify。需要时告诉我，我帮你部署。

---

## 下一步可以加的功能（按你的需求清单）
- ✅ 已实现：手动记账、6 类用途、日/周/月/年统计与占比、饼图柱状图
- ⏳ 待加：月度预算 + 超支提醒、Excel 导出、深色模式、更多暹罗猫小动画
- ❌ 无法实现：iOS 系统不允许 App 监听其他 App 的支付（隐私限制）。  
  替代方案推荐用 Dock 快捷入口（见第四步）。

有任何问题随时告诉我，喵～ 🐾
