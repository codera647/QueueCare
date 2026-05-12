import { ForgotPasswordScreen } from "@/features/webapp/components/forgot-password-screen";

export default async function ForgotPasswordPage({
  params,
}: {
  params: Promise<{ audience: string }>;
}) {
  const { audience } = await params;
  return (
    <ForgotPasswordScreen
      audience={audience === "clinic" ? "clinic" : "patient"}
    />
  );
}
