import React, { useState } from 'react';
import { Layout, Upload, Button, Card, Input, message, Typography } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';

const { Header, Content } = Layout;
const { TextArea } = Input;
const { Title } = Typography;

const App: React.FC = () => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [essay, setEssay] = useState<string>('');
  const [correctedEssay, setCorrectedEssay] = useState<string>('');
  const [scoringStandard, setScoringStandard] = useState<string>('');
  const [essayRequirement, setEssayRequirement] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleUpload = async () => {
    if (fileList.length === 0) {
      message.error('请先选择作文图片');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      fileList.forEach(file => {
        formData.append('images', file.originFileObj as File);
      });

      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'X-API-Key': '12345abcde'
        },
        body: formData
      });

      const data = await response.json();
      if (data.success) {
        setEssay(data.text);
        message.success('OCR识别成功');
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      message.error('OCR识别失败：' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleCorrect = async () => {
    if (!essay) {
      message.error('请先上传并识别作文');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/correct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': '12345abcde'
        },
        body: JSON.stringify({
          essay,
          scoringStandard,
          essayRequirement
        })
      });

      const data = await response.json();
      if (data.success) {
        setCorrectedEssay(data.correctedEssay);
        message.success('批改完成');
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      message.error('批改失败：' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ background: '#fff', padding: '0 20px' }}>
        <Title level={3} style={{ margin: '16px 0' }}>AI作文批改</Title>
      </Header>
      <Content style={{ padding: '20px' }}>
        <Card title="上传作文" style={{ marginBottom: '20px' }}>
          <Upload
            fileList={fileList}
            onChange={({ fileList }) => setFileList(fileList)}
            beforeUpload={() => false}
            multiple
          >
            <Button icon={<UploadOutlined />}>选择图片</Button>
          </Upload>
          <Button 
            type="primary" 
            onClick={handleUpload} 
            style={{ marginTop: '16px' }} 
            loading={loading}
          >
            开始识别
          </Button>
        </Card>

        <Card title="作文内容" style={{ marginBottom: '20px' }}>
          <TextArea
            value={essay}
            onChange={e => setEssay(e.target.value)}
            rows={10}
            placeholder="OCR识别的作文内容将显示在这里"
          />
        </Card>

        <Card title="作文要求设置" style={{ marginBottom: '20px' }}>
          <TextArea
            value={essayRequirement}
            onChange={e => setEssayRequirement(e.target.value)}
            rows={4}
            placeholder="请输入作文要求（如字数限制、文体要求、主题要求等）"
          />
        </Card>

        <Card title="评分标准设置" style={{ marginBottom: '20px' }}>
          <TextArea
            value={scoringStandard}
            onChange={e => setScoringStandard(e.target.value)}
            rows={4}
            placeholder="请输入评分标准（可选）"
          />
        </Card>

        <Button 
          type="primary" 
          onClick={handleCorrect} 
          loading={loading}
          style={{ marginBottom: '20px' }}
        >
          批改作文
        </Button>

        <Card title="批改结果">
          <TextArea
            value={correctedEssay}
            rows={10}
            readOnly
            placeholder="批改结果将显示在这里"
          />
        </Card>
      </Content>
    </Layout>
  );
};

export default App;