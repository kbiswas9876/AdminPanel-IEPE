import { Metadata } from 'next'
import NewBulkUpload from '@/components/content/new-bulk-upload'

export const metadata: Metadata = {
  title: 'Bulk Upload Questions - New System',
  description: 'Upload questions in bulk using JSONL, Parquet, or CSV format with advanced validation and progress tracking.',
}

export default function BulkUploadNewPage() {
  return (
    <div className="container mx-auto py-6">
      <NewBulkUpload />
    </div>
  )
}
