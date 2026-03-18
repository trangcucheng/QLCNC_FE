import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đăng nhập - Hệ thống QLCNC",
  description: "Đăng nhập vào hệ thống Quản lý Công nghệ cao",
};

export default function Login() {
  return <SignInForm />;
}
