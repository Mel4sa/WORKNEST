import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import FloatingChat from '../components/FloatingChat';

function Messages() {
  const { partnerId } = useParams();
  const navigate = useNavigate();

  return (
    <FloatingChat
      partnerId={partnerId}
      onClose={() => navigate(-1)}
      initialMinimized={false}
    />
  );
}

export default Messages;
