import React, { useEffect, useState } from 'react';
import { Statistic, Row, Col, Typography } from 'antd';
// import 'antd/dist/antd.css'; // 确保你已经引入了 antd 的样式

const { Title } = Typography;

interface CountdownProps {
  endTime: string;  // 结束时间的 ISO 字符串格式
}

const CountdownTimer: React.FC<CountdownProps> = ({ endTime }) => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const end = new Date(endTime);
      const distance = end.getTime() - now.getTime();

      if (distance < 0) {
        clearInterval(timer);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  return (
    <div className='mx-auto m-10 p-4 bg-gray-200 rounded-2xl text-center'>
      <Title level={4}>Time Left</Title>
      <Row gutter={16}>
        <Col span={6}>
          <Statistic title="Days" value={timeLeft.days} />
        </Col>
        <Col span={6}>
          <Statistic title="Hours" value={timeLeft.hours} />
        </Col>
        <Col span={6}>
          <Statistic title="Minutes" value={timeLeft.minutes} />
        </Col>
        <Col span={6}>
          <Statistic title="Seconds" value={timeLeft.seconds} />
        </Col>
      </Row>
    </div>
  );
};

export default CountdownTimer;
