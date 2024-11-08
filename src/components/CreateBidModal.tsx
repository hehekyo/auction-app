import React, { useState } from 'react';
import { Modal, Button, Form, Input, message } from 'antd';
import axios from 'axios';

interface CreateBidModalProps {
  auctionId: number;
  isVisible: boolean;
  onClose: () => void;
  onSuccess:() => void;
}

export const CreateBidModal = ({ auctionId, isVisible, onClose,onSuccess }: CreateBidModalProps) => {
  const [form] = Form.useForm();
  const bidderAddress = localStorage.getItem('wallet') || '';

  const handleSubmit = async (values: any) => {
    try {
      await axios.post('/api/bids/create', {
        auctionId,
        bidderAddress: bidderAddress,
        bidAmount: values.bidAmount,
      });
      message.success('Bid created successfully!');
      onSuccess();  // 调用父组件传递的成功处理函数
      form.resetFields();
      onClose();
    } catch (error) {
      message.error('Failed to create bid.');
      console.error('Failed to create bid:', error);
    }
  };

  return (
    <Modal
      title="Create New Bid"
      visible={isVisible}
      onCancel={onClose}
      footer={null}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ bidderAddress }}
      >
        <Form.Item
          name="bidderAddress"
          label="Bidder Address"
          rules={[{ required: true, message: 'Please input your address!'}]}
          
        >
          <Input  disabled/>
        </Form.Item>
        <Form.Item
          name="bidAmount"
          label="Bid Amount"
          rules={[{ required: true, message: 'Please input your bid amount!' }]}
        >
          <Input type="number" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};
