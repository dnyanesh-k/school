import { StudentLayout } from "@/components/layout/StudentLayout";

export default function StudentRootLayout({ children }: { children: React.ReactNode }) {
  return <StudentLayout>{children}</StudentLayout>;
}
