// components/CreateAuctionModal.tsx
import React, { useState } from 'react';
import { Modal, Button, Form, Input, DatePicker, message } from 'antd';
import axios from 'axios';
import moment from 'moment';


interface CreateAuctionModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSuccess:() => void;
}



export const CreateAuctionModal = ({isVisible, onClose, onSuccess}: CreateAuctionModalProps) => {
  // const [visible, setVisible] = useState(false);
  const [form] = Form.useForm();
  const sellerAddress = localStorage.getItem('wallet') || '';

  // const showModal = () => {
  //   setVisible(true);
  // };

  // const handleCancel = () => {
  //   setVisible(false);
  // };

  const handleSubmit = async (values: any) => {
    try {
      await axios.post('/api/auctions/create', {
        sellerAddress: values.sellerAddress,
        minBid: values.minBid,
        endTime: values.endTime,
      });
      message.success('Auction created successfully!');
      onSuccess();  // 调用父组件传递的成功处理函数
      form.resetFields();
      onClose();
      // setVisible(false);
    } catch (error) {
      message.error('Failed to create auction.');
      console.error('Failed to create auction:', error);
    }
  };

  return (
    <>
      {/* <Button type="primary" onClick={showModal}>
        Create
      </Button> */}
      <Modal
        title="Create New Auction"
        visible={isVisible}
        onCancel={onClose}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ sellerAddress: sellerAddress }}
        >
          <Form.Item
            name="sellerAddress"
            label="Seller Address"
            rules={[{ required: true, message: 'Please input the seller address!' }]}
          
          >
            <Input  disabled/>
          </Form.Item>
          <Form.Item
            name="minBid"
            label="Minimum Bid"
            rules={[{ required: true, message: 'Please input the minimum bid!' }]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item
            name="endTime"
            label="End Time"
            rules={[{ required: true, message: 'Please select the end time!' }]}
          >
            <DatePicker showTime />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};
