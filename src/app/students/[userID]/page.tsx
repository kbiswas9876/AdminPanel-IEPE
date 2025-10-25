import { StudentProfile } from '@/components/students/student-profile'

interface StudentProfilePageProps {
  params: {
    userID: string
  }
}

export default async function StudentProfilePage({ params }: StudentProfilePageProps) {
  const { userID } = await params
  return <StudentProfile userId={userID} />
}

