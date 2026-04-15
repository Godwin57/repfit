import { MetricCard } from "@/components/ui/MetricCard";
import { PremiumButton } from "@/components/ui/PremiumButton";
import { ReviewStars } from "@/components/ui/ReviewStars";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ArrowRight, Send, User } from "lucide-react";

export default function DashboardPage() {
  const recentReviews = [
    {
      id: "REV-001",
      customer: "Alex Mercer",
      rating: 5,
      status: "excellent",
      date: "Oct 24, 2026",
      text: "Incredible atmosphere and top-notch equipment. Best gym in the city, hands down.",
    },
    {
      id: "REV-002",
      customer: "Sarah Jenkins",
      rating: 4.5,
      status: "good",
      date: "Oct 22, 2026",
      text: "Really love the classes, but parking can be a hassle during peak times.",
    },
    {
      id: "REV-003",
      customer: "Michael Chen",
      rating: 2,
      status: "needs-attention",
      date: "Oct 19, 2026",
      text: "Machines were broken for over a week. Staff wasn't very helpful when asked.",
    },
    {
      id: "REV-004",
      customer: "Emily Rodriguez",
      rating: 5,
      status: "excellent",
      date: "Oct 18, 2026",
      text: "The new heavy lifting zone is exactly what I've been waiting for!",
    },
  ];

  return (
    <div className="flex flex-col space-y-12 pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="flex flex-col space-y-2">
          <span className="text-[0.6875rem] font-bold tracking-[0.05em] uppercase text-[#adaaaa] font-sans">
            Overview
          </span>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[#ffffff]" style={{ fontFamily: "var(--font-inter), sans-serif" }}>
            Reputation Pulse
          </h1>
        </div>
        
        {/* Call to Action */}
        <PremiumButton variant="primary" className="gap-2">
          <Send size={16} />
          Send Review Request
        </PremiumButton>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Current Google Rating"
          value="4.8"
          trend={{ value: 0.2, label: "from last month", isPositive: true }}
        />
        <MetricCard
          title="Total Reviews"
          value="142"
          trend={{ value: 12, label: "new this week", isPositive: true }}
        />
        <MetricCard
          title="Local SEO Map Rank"
          value="#2"
          trend={{ value: 1, label: "position dropped", isPositive: false }}
        />
      </div>

      {/* Recent Reviews Section - Structural Level 2 */}
      <div className="flex flex-col p-6 sm:p-8 bg-[#131313] rounded-[4px]">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-inter), sans-serif" }}>
            Recent Reviews
          </h2>
          <button className="text-[0.6875rem] font-bold tracking-[0.05em] uppercase text-[#cafd00] flex items-center hover:text-[#beee00] transition-colors">
            View All <ArrowRight size={14} className="ml-1" />
          </button>
        </div>

        {/* List of nested cards without dividers */}
        <div className="flex flex-col space-y-4">
          {recentReviews.map((review) => (
            <div
              key={review.id}
              className="group flex flex-col md:flex-row justify-between items-start md:items-center p-6 bg-[#1a1a1a] rounded-[4px] hover:bg-[#2c2c2c] transition-colors duration-200"
            >
              <div className="flex flex-col space-y-3 w-full md:w-2/3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-[#262626] flex items-center justify-center text-[#adaaaa]">
                    <User size={16} />
                  </div>
                  <span className="font-medium text-white font-sans">{review.customer}</span>
                  <span className="text-sm text-[#adaaaa] font-sans">• {review.date}</span>
                </div>
                <p className="text-[#adaaaa] font-sans text-sm leading-relaxed">
                  "{review.text}"
                </p>
              </div>

              <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto mt-4 md:mt-0 gap-3">
                <ReviewStars rating={review.rating} />
                <StatusBadge status={review.status} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
