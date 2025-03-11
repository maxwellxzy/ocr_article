# 部署指南

## 1. Google Gemini API 密钥配置

1. 访问 [Google AI Studio](https://makersuite.google.com/app/apikey)
2. 登录您的Google账户
3. 点击「Create API Key」创建新的API密钥
4. 复制生成的API密钥，稍后将用于环境变量配置

## 2. 腾讯云OCR API配置

### 2.1 注册和实名认证
1. 访问[腾讯云官网](https://cloud.tencent.com/)注册账号
2. 完成实名认证（个人或企业）

### 2.2 开通OCR服务
1. 访问[文字识别控制台](https://console.cloud.tencent.com/ocr/overview)
2. 点击「立即开通」
3. 选择「通用文字识别」产品
4. 阅读并同意服务条款

### 2.3 创建API密钥
1. 访问[访问密钥](https://console.cloud.tencent.com/cam/capi)页面
2. 点击「新建密钥」
3. 保存生成的SecretId和SecretKey，稍后将用于环境变量配置

### 2.4 设置OCR服务访问权限
1. 访问[访问管理控制台](https://console.cloud.tencent.com/cam)
2. 确保API密钥关联的用户具有OCR服务的访问权限
3. 如需要，可以创建自定义策略来限制访问范围

## 3. Cloudflare Pages 部署

### 3.1 仓库连接
1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 进入「Workers & Pages」页面
3. 点击「Create application」
4. 选择「Pages」标签
5. 点击「Connect to Git」
6. 选择包含项目的Git仓库并授权
7. 选择要部署的分支

### 3.2 构建配置
设置以下构建配置：
- Framework preset: Vite
- Build command: `cd frontend && npm install && npm run build`
- Build output directory: `frontend/dist`

### 3.3 环境变量配置
在Pages的环境变量设置中添加：
```
VITE_WORKER_URL=https://your-worker-subdomain.workers.dev
```

## 4. Cloudflare Workers 部署

### 4.1 安装Wrangler
```bash
npm install -g wrangler
```

### 4.2 登录Cloudflare账户
```bash
wrangler login
```

### 4.3 配置环境变量
在Workers的环境变量设置中添加以下变量：
```
GEMINI_API_KEY=<您的Google Gemini API密钥>
TENCENT_SECRET_ID=<您的腾讯云SecretId>
TENCENT_SECRET_KEY=<您的腾讯云SecretKey>
R2_BUCKET=ocr-pic
R2_ENDPOINT=<your-key>.r2.cloudflarestorage.com
R2_ACCESS_KEY=<您的R2访问密钥>
R2_SECRET_KEY=<您的R2密钥>
R2_API_KEY=<您的R2 API密钥>
R2_CUSTOM_DOMAIN=<您的自定义域名>
```

### 4.4 部署Worker
在项目根目录执行：
```bash
cd worker
wrangler deploy
```

## 5. 验证部署
1. 访问您的Pages域名（例如：https://your-project.pages.dev）
2. 上传一篇作文图片进行测试
3. 确认OCR识别和AI批改功能正常工作

## 注意事项
- 确保所有环境变量都已正确配置
- Worker和Pages的域名需要正确配置，并确保它们之间可以正常通信
- 如遇到CORS问题，检查Worker的配置是否正确允许了Pages域名的请求
- 请妥善保管所有API密钥，不要泄露给他人
- 定期检查腾讯云OCR服务的使用量和计费情况