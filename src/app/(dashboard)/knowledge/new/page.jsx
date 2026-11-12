import KnowledgeArticleForm from '@/components/knowledge/KnowledgeArticleForm';

export const metadata = {
  title: 'Submit Academic Resource — DoubtBridge',
  description: 'Share a peer study guide, algorithmic explanation, or engineering note with the community.',
};

export default function NewKnowledgeArticlePage() {
  return <KnowledgeArticleForm isEdit={false} />;
}
