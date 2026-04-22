import SignUpForm from "@/components/auth/SignUpForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Next.js SignUp Page | QLCNC - Hệ thống Quản lý Công nghệ cạnh tranh",
  description: "This is Next.js SignUp Page QLCNC Dashboard",
  // other metadata
};

export default function SignUp() {
  return <SignUpForm />;
}
