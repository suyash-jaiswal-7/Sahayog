import { useCallback, useEffect, useState } from "react";
import { Building2, CheckCircle2, Clock3, LogOut, RefreshCw, UserRound, Users, XCircle } from "lucide-react";
import { api } from "../lib/api";
import logo from "../assets/logo.png";

const statusStyles = {
  AVAILABLE: "bg-emerald-50 text-emerald-700 border-emerald-200",
  BUSY: "bg-amber-50 text-amber-700 border-amber-200",
  OFFLINE: "bg-slate-100 text-slate-600 border-slate-200",
  SUSPENDED: "bg-red-50 text-red-700 border-red-200",
};

export default function CooperativeDashboard({ admin, onLogout }) {
  const [dashboard, setDashboard] = useState(null);
  const [workers, setWorkers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [dashboardResponse, workersResponse, requestsResponse] = await Promise.all([
        api("/cooperative-admin/dashboard"),
        api("/cooperative-admin/workers"),
        api("/cooperative-admin/join-requests"),
      ]);
      setDashboard(dashboardResponse.data);
      setWorkers(workersResponse.data?.workers || []);
      setRequests(requestsResponse.data || []);
      setMessage("");
    } catch (error) {
      setMessage(error.message || "Unable to load cooperative dashboard.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const reviewRequest = async (requestId, action) => {
    setProcessingId(requestId);
    try {
      if (action === "accept") {
        await api(`/cooperative-admin/join-requests/${requestId}/accept`, { method: "PATCH" });
      } else {
        const reason = window.prompt("Enter rejection reason:", "Not suitable for current cooperative requirements");
        if (!reason?.trim()) { setProcessingId(null); return; }
        await api(`/cooperative-admin/join-requests/${requestId}/reject`, { method: "PATCH", body: JSON.stringify({ rejectionReason: reason }) });
      }
      setMessage(action === "accept" ? "Worker accepted and added to your cooperative." : "Worker join request rejected.");
      await loadAll();
    } catch (error) {
      setMessage(error.message || "Unable to process join request.");
    } finally {
      setProcessingId(null);
    }
  };

  const changeWorkerStatus = async (workerId, status) => {
    try {
      await api(`/cooperative-admin/workers/${workerId}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
      setMessage("Worker status updated.");
      await loadAll();
    } catch (error) {
      setMessage(error.message || "Unable to update worker status.");
    }
  };

  const stats = dashboard?.stats || {};
  const cooperative = dashboard?.cooperative || {};

  return (
    <main className="min-h-screen bg-[#f6faf8] text-[#173b32]">
      <header className="border-b border-[#dcebe4] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Sahayog Logo" className="h-11 w-11 object-contain" />
            <div><p className="text-lg font-extrabold text-[#12345b]">Sahayog</p><p className="text-xs text-slate-500">Cooperative management</p></div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block"><p className="text-sm font-bold text-[#12345b]">{admin?.fullName || "Cooperative Admin"}</p><p className="text-xs text-slate-500">Cooperative Owner</p></div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eef7f3] text-[#16845f]"><UserRound size={19} /></div>
            <button onClick={onLogout} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:border-[#16845f] hover:text-[#16845f]"><LogOut size={16} /><span className="hidden sm:inline">Logout</span></button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <section className="rounded-[2rem] bg-[#12345b] px-6 py-8 text-white shadow-xl sm:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div><div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-100">Cooperative dashboard</span><span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-bold text-emerald-100">{cooperative.status || "ACTIVE"}</span></div><h1 className="mt-4 text-3xl font-black sm:text-4xl">{cooperative.name || "Your Cooperative"}</h1><p className="mt-2 text-sm text-slate-200">Manage workers, join requests and cooperative activity from one place.</p></div>
            <button onClick={loadAll} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-[#12345b] disabled:opacity-60"><RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh</button>
          </div>
        </section>

        {message && <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-700" role="status">{message}</div>}

        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[['Total workers', stats.totalWorkers, Users], ['Available', stats.availableWorkers, CheckCircle2], ['Busy', stats.busyWorkers, Clock3], ['Pending joins', stats.pendingJoinRequests, Building2]].map(([label, value, Icon]) => <div key={label} className="rounded-2xl border border-[#e0ebe6] bg-white p-5 shadow-sm"><Icon className="text-[#16845f]" size={20} /><p className="mt-3 text-sm font-semibold text-slate-500">{label}</p><p className="mt-1 text-3xl font-black text-[#12345b]">{value ?? 0}</p></div>)}
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <section className="rounded-[2rem] border border-[#e0ebe6] bg-white p-5 shadow-sm sm:p-7">
            <p className="text-sm font-bold text-[#16845f]">Worker onboarding</p><h2 className="mt-1 text-2xl font-black text-[#12345b]">Pending join requests</h2>
            <div className="mt-5 space-y-4">{requests.length ? requests.map((request) => { const worker = request.workerId || {}; return <article key={request._id} className="rounded-2xl border border-slate-200 p-4"><div className="flex items-start justify-between gap-4"><div><p className="font-black text-[#12345b]">{worker.fullName || "Worker"}</p><p className="mt-1 text-sm text-slate-500">{worker.email || ""} {worker.phone ? `• ${worker.phone}` : ""}</p><p className="mt-2 text-sm text-slate-600">{worker.skills?.map((skill) => skill.service).join(", ") || worker.service || "Skills not listed"}</p></div><span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">PENDING</span></div><div className="mt-4 flex gap-2"><button disabled={processingId === request._id} onClick={() => reviewRequest(request._id, "accept")} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#16845f] px-3 py-2.5 text-sm font-bold text-white disabled:opacity-50"><CheckCircle2 size={16}/>Accept</button><button disabled={processingId === request._id} onClick={() => reviewRequest(request._id, "reject")} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-200 px-3 py-2.5 text-sm font-bold text-red-600 disabled:opacity-50"><XCircle size={16}/>Reject</button></div></article>; }) : <div className="rounded-2xl bg-[#f7faf8] p-10 text-center"><Building2 className="mx-auto text-[#16845f]" size={28}/><p className="mt-3 font-extrabold text-[#12345b]">No pending requests</p><p className="mt-1 text-sm text-slate-500">New worker applications will appear here.</p></div>}</div>
          </section>

          <section className="rounded-[2rem] border border-[#e0ebe6] bg-white p-5 shadow-sm sm:p-7">
            <p className="text-sm font-bold text-[#16845f]">Worker management</p><h2 className="mt-1 text-2xl font-black text-[#12345b]">Your cooperative workers</h2>
            <div className="mt-5 space-y-3">{workers.length ? workers.map((worker) => <article key={worker._id} className="rounded-2xl border border-slate-200 p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-black text-[#12345b]">{worker.fullName}</p><p className="mt-1 text-xs text-slate-500">{worker.phone} • {worker.email}</p><p className="mt-2 text-sm text-slate-600">{worker.skills?.map((skill) => skill.service).join(", ") || worker.service || "Service not listed"}</p></div><span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${statusStyles[worker.status] || statusStyles.OFFLINE}`}>{worker.status}</span></div><div className="mt-3 flex flex-wrap gap-2">{["AVAILABLE", "BUSY", "OFFLINE", "SUSPENDED"].map((status) => <button key={status} onClick={() => changeWorkerStatus(worker._id, status)} className={`rounded-lg border px-2.5 py-1.5 text-xs font-bold ${worker.status === status ? "border-[#16845f] bg-[#effaf4] text-[#16845f]" : "border-slate-200 text-slate-500 hover:border-[#cfe4da]"}`}>{status}</button>)}</div></article>) : <div className="rounded-2xl bg-[#f7faf8] p-10 text-center"><Users className="mx-auto text-[#16845f]" size={28}/><p className="mt-3 font-extrabold text-[#12345b]">No workers yet</p><p className="mt-1 text-sm text-slate-500">Accept worker join requests to build your cooperative.</p></div>}</div>
          </section>
        </div>

        <section className="mt-6 rounded-[2rem] border border-[#e0ebe6] bg-white p-6 shadow-sm"><div className="flex items-center gap-2"><Building2 className="text-[#16845f]" size={19}/><h2 className="text-lg font-black text-[#12345b]">Cooperative summary</h2></div><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><div><p className="text-xs font-bold uppercase tracking-wide text-slate-400">Registration</p><p className="mt-1 font-bold text-[#12345b]">{cooperative.registrationNumber || "—"}</p></div><div><p className="text-xs font-bold uppercase tracking-wide text-slate-400">Active requests</p><p className="mt-1 font-bold text-[#12345b]">{stats.activeRequests ?? 0}</p></div><div><p className="text-xs font-bold uppercase tracking-wide text-slate-400">Completed jobs</p><p className="mt-1 font-bold text-[#12345b]">{stats.completedJobs ?? stats.totalJobsCompleted ?? 0}</p></div><div><p className="text-xs font-bold uppercase tracking-wide text-slate-400">Average rating</p><p className="mt-1 font-bold text-[#12345b]">{Number(stats.averageRating || 0).toFixed(1)} / 5</p></div></div></section>
      </div>
    </main>
  );
}
