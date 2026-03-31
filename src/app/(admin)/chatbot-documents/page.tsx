import DocumentManagement from '@/components/DocumentManagement';

export const metadata = {
  title: 'Quản lý tài liệu Chatbot | QLCNC',
  description: 'Quản lý tài liệu PDF cho chatbot AI',
};

export default function ChatbotDocumentsPage() {
  return (
    <div>
      <DocumentManagement />
    </div>
  );
}
