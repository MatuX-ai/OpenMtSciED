import axios, { type AxiosResponse } from 'axios';
import React, { useState } from 'react';

interface AIResponse {
  answer: string;
}

const AITutor: React.FC = () => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');

  const handleAsk = async (): Promise<void> => {
    try {
      const res: AxiosResponse<AIResponse> = await axios.post('/api/v1/ai/tutor', { question });
      setAnswer(res.data.answer);
    } catch (error) {
      setAnswer('AI Tutor is currently unavailable.');
    }
  };

  return (
    <div className="ai-tutor">
      <h3>AI Virtual Tutor</h3>
      <input
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Ask about a concept..."
      />
      <button
        onClick={() => {
          void handleAsk();
        }}
      >
        Ask
      </button>
      <p>{answer}</p>
    </div>
  );
};

export default AITutor;
