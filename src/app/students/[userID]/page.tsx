import { StudentProfile } from '@/components/students/student-profile'

interface StudentProfilePageProps {
  params: {
    userID: string
  }
}

export default function StudentProfilePage({ params }: StudentProfilePageProps) {
  return <StudentProfile userId={params.userID} />
}

