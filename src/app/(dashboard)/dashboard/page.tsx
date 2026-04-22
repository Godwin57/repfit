import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Users, Send, MessageSquareText, TrendingUp } from "lucide-react";

export default async function DashboardPage() {
  // 1. Authenticate the User
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  // 2. Fetch Live Database Metrics concurrently for speed
  const [totalRequests, totalCustomers, totalCampaigns, recentCampaigns] =
    await Promise.all([
      prisma.reviewRequest.count({ where: { gymOwnerId: userId } }),
      prisma.customer.count({ where: { gymOwnerId: userId } }),
      prisma.campaign.count({ where: { gymOwnerId: userId } }),
      prisma.campaign.findMany({
        where: { gymOwnerId: userId },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

  // Premium Metric Card Component
  const MetricCard = ({ title, value, icon: Icon, trend }: any) => (
    <div className="bg-[#131313] p-6 rounded-[4px] border border-white/5 shadow-lg relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#cafd00]/5 blur-[50px] group-hover:bg-[#cafd00]/10 transition-colors pointer-events-none"></div>
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="p-3 bg-[#262626] rounded-[4px]">
          <Icon size={20} className="text-[#cafd00]" />
        </div>
        <span className="text-xs font-bold font-sans text-[#cafd00] flex items-center gap-1 bg-[#cafd00]/10 px-2 py-1 rounded-full">
          <TrendingUp size={12} /> {trend}
        </span>
      </div>
      <div className="relative z-10">
        <h3 className="text-4xl font-black text-white font-sans tracking-tighter">
          {value}
        </h3>
        <p className="text-sm font-bold text-[#adaaaa] uppercase tracking-widest mt-1">
          {title}
        </p>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-12 pb-12 w-full max-w-7xl mx-auto">
      <header>
        <h1 className="text-5xl font-black text-white tracking-tighter font-sans mb-2">
          Command Center
        </h1>
        <p className="text-[#adaaaa] font-sans text-lg">
          Welcome back. Here is your live campaign performance.
        </p>
      </header>

      {/* Live Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Total Customers"
          value={totalCustomers}
          icon={Users}
          trend="+12%"
        />
        <MetricCard
          title="Review Requests Sent"
          value={totalRequests}
          icon={Send}
          trend="+8%"
        />
        <MetricCard
          title="Total Campaigns"
          value={totalCampaigns}
          icon={MessageSquareText}
          trend="Active"
        />
      </div>

      {/* Live Recent Activity Table */}
      <section className="bg-[#131313] rounded-[4px] border border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white font-sans">
            Recent Campaigns
          </h2>
          <span className="text-[10px] uppercase tracking-widest text-[#adaaaa] font-bold">
            Latest 5
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0e0e0e]/50 text-[10px] uppercase tracking-widest text-[#adaaaa] font-bold">
                <th className="p-4 border-b border-white/5 w-1/3">
                  Context / Template
                </th>
                <th className="p-4 border-b border-white/5">Status</th>
                <th className="p-4 border-b border-white/5 text-right">
                  Recipients
                </th>
                <th className="p-4 border-b border-white/5 text-right">
                  Date Launched
                </th>
              </tr>
            </thead>
            <tbody>
              {recentCampaigns.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="p-8 text-center text-[#adaaaa] font-sans text-sm italic"
                  >
                    No campaigns launched yet. Head to the Campaigns tab to
                    start.
                  </td>
                </tr>
              ) : (
                recentCampaigns.map((campaign: any) => (
                  <tr
                    key={campaign.id}
                    className="hover:bg-[#262626]/50 transition-colors border-b border-white/5 last:border-0 group"
                  >
                    <td className="p-4">
                      <p className="text-sm text-white font-medium font-sans truncate max-w-[300px]">
                        {campaign.aiMessageTemplate || "Manual Template"}
                      </p>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold font-sans bg-[#cafd00]/10 text-[#cafd00]">
                        {campaign.status}
                      </span>
                    </td>
                    <td className="p-4 text-right text-sm text-white font-sans font-medium">
                      {campaign.totalRecipients}
                    </td>
                    <td className="p-4 text-right text-sm text-[#adaaaa] font-sans">
                      {new Date(campaign.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
