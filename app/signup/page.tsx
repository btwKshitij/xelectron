import { redirect } from "next/navigation";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await searchParams;
  const query = new URLSearchParams();
  query.set("mode", "signup");
  if (params.redirectTo) query.set("redirectTo", params.redirectTo);
  redirect(`/login?${query.toString()}`);
}
