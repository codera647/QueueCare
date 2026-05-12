import { AuthScreen } from "@/features/webapp/components/auth-screen";

export default async function RegisterPage({
  params,
}: {
  params: Promise<{ audience: string }>;
}) {
  const { audience } = await params;
  return (
    <AuthScreen
      audience={audience === "clinic" ? "clinic" : "patient"}
      mode="register"
    />
  );
}
