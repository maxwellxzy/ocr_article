# AI作文批改

## 功能
1. 拍照上传作文；
2. AI自动批改作文；
3. 设置作文评分标准；
4. 使用cloudflare 部署：
    - cloudflare pages部署前端；
    - cloudflare worker部署后端；
5. 使用google gemini作为AI模型；
6. 使用tencent ocr识别图片中的文字。

## 使用流程：
1. 在H5页面，点击“上传”按钮，选择作文图片，或拍摄作文；使用cloudflare R2作为图片存储；
2. OCR自动识别，多张图片自动组合成一篇作文；并纠正OCR识别的错误；
3. 显示在H5页面；
4. 点击“批改”按钮，AI自动批改作文；
5. 把批改结果显示在H5页面；
6. 可在H5页面内设置作文评分标准。如果不设置，则使用默认的评分标准。

## 配置文件设置：
1. 配置文件 `.env`，需配置：
```conf
# rename to .env and fill in the values
TENCENT_SECRET_ID=YOUR_ID
TENCENT_SECRET_KEY=YOUR_SECRET
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
API_KEY=YOUR_API_KEY
R2_BUCKET=ocr-pic
R2_ENDPOINT=<your-key>.r2.cloudflarestorage.com
R2_ACCESS_KEY=YOUR-KEY
R2_SECRET_KEY=YOUR-SEC
R2_API_KEY=YOUR-APIKEY
R2_CUSTOM_DOMAIN=YOUR.DOMAIN.COM
```

