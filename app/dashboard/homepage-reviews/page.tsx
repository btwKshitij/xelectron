import ReviewsPage from "@/app/dashboard/reviews/page";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function HomepageReviewsDashboardPage() {
  return <ReviewsPage searchParams={Promise.resolve({ tab: "homepage" })} />;
}
