import { useCallback, useEffect, useState } from "react";
import {
  Bell,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  LogOut,
  MapPin,
  RefreshCw,
  UserRound,
  XCircle,
  Users,
} from "lucide-react";
import { api } from "../lib/api";
import logo from '../assets/logo.png'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

const statusStyles = {
  AVAILABLE: "bg-emerald-50 text-emerald-700 border-emerald-200",
  BUSY: "bg-amber-50 text-amber-700 border-amber-200",
  OFFLINE: "bg-slate-100 text-slate-600 border-slate-200",
};

const normalizeJob = (job) => ({
  ...job,
  id: job.id || job._id,
  location: job.location || { formatted: "Location unavailable" },
});

export default function WorkerDashboard({ worker, onLogout }) {
  const [requests, setRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState(worker?.status || "OFFLINE");
  const [processingId, setProcessingId] = useState(null);
  const [acceptedRequest, setAcceptedRequest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [cooperatives, setCooperatives] = useState([]);
  const [cooperativeMessage, setCooperativeMessage] = useState("");
  const [joiningCooperativeId, setJoiningCooperativeId] = useState(null);
  const [pendingCooperativeIds, setPendingCooperativeIds] = useState(new Set());

  const loadRequests = useCallback(async () => {
    try {
      const response = await api("/worker-jobs/requests");
      setRequests((response.jobs || []).map(normalizeJob));
    } catch (error) {
      setMessage(error.message || "Unable to load service requests.");
    }
  }, []);

  const loadActiveAssignment = useCallback(async () => {
    try {
      const response = await api("/worker-jobs/active");
      setAcceptedRequest(response.jobs?.[0] ? normalizeJob(response.jobs[0]) : null);
    } catch {
      // Keep the dashboard usable if assignment history is temporarily unavailable.
    }
  }, []);

  const loadNotifications = useCallback(async () => {
    try {
      const response = await api("/notifications/mine");
      setNotifications(response.notifications || []);
    } catch {
      // Notification history is supplementary to live requests.
    }
  }, []);

  const loadCooperatives = useCallback(async () => {
    try {
      const response = await api("/workers/cooperatives");
      setCooperatives(response.data?.cooperatives || []);
    } catch {
      // Cooperative onboarding is optional and should not block the worker dashboard.
    }
  }, []);


  const loadPendingCooperativeRequests = useCallback(async () => {
    try {
      const response = await api("/workers/cooperative-requests");
      const pendingRequests = response.data?.requests || [];
      setPendingCooperativeIds(
        new Set(
          pendingRequests
            .filter((request) => request.status === "PENDING")
            .map((request) => String(request.cooperativeId?._id || request.cooperativeId))
        )
      );
    } catch {
      // Keep the cooperative directory usable if request history is unavailable.
    }
  }, []);

  const joinCooperative = async (cooperativeId) => {
    setJoiningCooperativeId(cooperativeId);
    try {
      await api(`/workers/cooperatives/${cooperativeId}/request`, {
        method: "POST",
        body: JSON.stringify({ message: "I would like to join this cooperative and provide my listed services." }),
      });
      setCooperativeMessage("Join request sent successfully. The cooperative admin will review it.");
      setPendingCooperativeIds((current) =>
        new Set([...current, String(cooperativeId)])
      );
      await loadCooperatives();
    } catch (error) {
      setCooperativeMessage(error.message || "Unable to send join request.");
    } finally {
      setJoiningCooperativeId(null);
    }
  };

  const refreshAll = async () => {
    setLoading(true);
    await Promise.all([loadRequests(), loadActiveAssignment(), loadNotifications()]);
    setLoading(false);
  };

  useEffect(() => {
    loadRequests();
    loadActiveAssignment();
    loadNotifications();
    loadCooperatives();
    loadPendingCooperativeRequests();

    if (!window.io) return undefined;

    const socket = window.io(SOCKET_URL, {
      withCredentials: true,
      transports: ["websocket", "polling"],
      auth: { role: "WORKER" },
    });

    socket.on("connect", () => setSocketConnected(true));
    socket.on("disconnect", () => setSocketConnected(false));

    socket.on("new-service-request", (request) => {
      if (!request?.requestId) return;
      const incoming = normalizeJob({
        id: request.requestId,
        service: request.service,
        description: request.description,
        status: "REQUESTED",
        location: request.location || { formatted: "Location unavailable" },
        distanceKm: request.distanceKm,
      });
      setRequests((current) => current.some((job) => String(job.id) === String(incoming.id)) ? current : [incoming, ...current]);
      setNotifications((current) => [request, ...current].slice(0, 50));
      setMessage(`New ${request.service || "service"} request received.`);
    });

    socket.on("request-taken", ({ requestId, message: text }) => {
      setRequests((current) => current.filter((job) => String(job.id) !== String(requestId)));
      setMessage(text || "This request has already been accepted by another professional.");
    });

    socket.on("request-cancelled", ({ requestId, message: text }) => {
      setRequests((current) =>
        current.filter((job) => String(job.id) !== String(requestId))
      );

      setAcceptedRequest((current) => {
        if (!current || String(current.id) !== String(requestId)) {
          return current;
        }

        setStatus("AVAILABLE");
        return null;
      });

      setMessage(text || "The customer cancelled this request.");
      loadActiveAssignment();
      loadRequests();
    });

    return () => socket.disconnect();
  }, [loadRequests, loadActiveAssignment, loadNotifications, loadCooperatives, loadPendingCooperativeRequests]);

  const updateStatus = async (nextStatus) => {
    try {
      await api("/workers/status", { method: "PATCH", body: JSON.stringify({ status: nextStatus }) });
      setStatus(nextStatus);
      setMessage(`Status changed to ${nextStatus.toLowerCase()}.`);
      if (nextStatus === "AVAILABLE") await loadRequests();
    } catch (error) {
      setMessage(error.message || "Unable to update your status.");
    }
  };

  const acceptRequest = async (requestId) => {
    setProcessingId(requestId);
    try {
      const response = await api(`/worker-jobs/${requestId}/accept`, { method: "POST" });
      setAcceptedRequest(response.job ? normalizeJob(response.job) : null);
      setRequests((current) => current.filter((job) => String(job.id) !== String(requestId)));
      setStatus("BUSY");
      setMessage("Request accepted. You are now assigned to this customer.");
    } catch (error) {
      setRequests((current) => current.filter((job) => String(job.id) !== String(requestId)));
      setMessage(error.message || "This request is no longer available.");
      await loadRequests();
    } finally {
      setProcessingId(null);
    }
  };

  const rejectRequest = async (requestId) => {
    setProcessingId(requestId);
    try {
      await api(`/worker-jobs/${requestId}/reject`, { method: "POST" });
      setRequests((current) => current.filter((job) => String(job.id) !== String(requestId)));
      setMessage("Request rejected.");
    } catch (error) {
      setMessage(error.message || "This request is no longer available.");
    } finally {
      setProcessingId(null);
    }
  };

  const workerName = worker?.fullName || "Professional";
  const statusClass = statusStyles[status] || statusStyles.OFFLINE;

  return (
    <main className="min-h-screen bg-[#f6faf8] text-[#173b32]">
      <div className="border-b border-[#dcebe4] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#16845f] text-white shadow-sm"><span className="text-lg font-black">
              <img
              src={logo}
              alt="Sahayog Logo"
              className="w-12 h-12 object-contain"
              />
              </span>
              </div>
            <div><p className="text-lg font-extrabold tracking-tight text-[#12345b]">Sahayog</p><p className="hidden text-xs text-slate-500 sm:block">Cooperative service network</p></div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block"><p className="text-sm font-bold text-[#12345b]">{workerName}</p><p className="text-xs text-slate-500">Professional</p></div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eef7f3] text-[#16845f]"><UserRound size={19} /></div>
            <button onClick={onLogout} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:border-[#16845f] hover:text-[#16845f]"><LogOut size={16} /><span className="hidden sm:inline">Logout</span></button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <section className="rounded-[2rem] bg-[#12345b] px-6 py-8 text-white shadow-xl sm:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-100">Worker dashboard</span>
                <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-bold text-emerald-100">Ready for service</span>
              </div>
              <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">Welcome, {workerName}</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-200">Here are genuine nearby service requests that match your skills.</p>
            </div>
            <div className={`inline-flex w-fit items-center gap-2 rounded-full border px-4 py-2 text-sm font-extrabold ${statusClass}`}><span className="h-2 w-2 rounded-full bg-current" /> {status}</div>
          </div>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <section className="rounded-[2rem] border border-[#e0ebe6] bg-white p-5 shadow-sm sm:p-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div><p className="text-sm font-bold text-[#16845f]">Requests for you</p><h2 className="mt-1 text-2xl font-black text-[#12345b]">New Service Requests</h2><p className="mt-1 text-sm text-slate-500">Only available requests matched to your service and the 10 km network are shown.</p></div>
              <button onClick={refreshAll} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:border-[#16845f] hover:text-[#16845f] disabled:opacity-60"><RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh</button>
            </div>

            {message && <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-medium text-slate-700" role="status">{message}</div>}

            <div className="mt-5 space-y-4">
              {requests.length ? requests.map((request) => (
                <article key={request.id} className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-[#cfe4da] hover:shadow-sm">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <span className="inline-flex rounded-full bg-[#effaf4] px-3 py-1 text-xs font-extrabold text-[#16845f]">{request.service}</span>
                      <h3 className="mt-3 text-lg font-black text-[#12345b]">Service request</h3>
                      <p className="mt-1 text-sm leading-6 text-slate-600">{request.description}</p>
                      {request.customer?.name && <p className="mt-3 text-sm font-bold text-[#12345b]">Customer: {request.customer.name}</p>}
                    </div>
                    <div className="shrink-0 rounded-xl bg-[#f7faf8] px-4 py-3 text-sm">
                      <div className="flex items-start gap-2"><MapPin className="mt-0.5 text-[#16845f]" size={16} /><div><p className="max-w-[240px] font-bold text-[#12345b]">{request.location?.formatted || "Location unavailable"}</p>{request.distanceKm != null && <p className="mt-1 text-xs font-semibold text-slate-500">{Number(request.distanceKm).toFixed(1)} km away</p>}</div></div>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                    <button type="button" disabled={processingId === request.id || status !== "AVAILABLE"} onClick={() => acceptRequest(request.id)} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#16845f] px-4 py-3 font-extrabold text-white hover:bg-[#11704f] disabled:cursor-not-allowed disabled:opacity-50"><CheckCircle2 size={17} /> {processingId === request.id ? "Processing..." : "Accept"}</button>
                    <button type="button" disabled={processingId === request.id} onClick={() => rejectRequest(request.id)} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-3 font-extrabold text-red-600 hover:bg-red-50 disabled:opacity-50"><XCircle size={17} /> Reject</button>
                  </div>
                </article>
              )) : (
                <div className="rounded-2xl bg-[#f7faf8] p-10 text-center"><BriefcaseBusiness className="mx-auto text-[#16845f]" size={30} /><p className="mt-3 font-extrabold text-[#12345b]">No new requests</p><p className="mt-1 text-sm text-slate-500">Stay available to receive nearby service requests.</p></div>
              )}
            </div>
          </section>

          <aside className="space-y-6">
            <section className="rounded-[2rem] border border-[#e0ebe6] bg-white p-6 shadow-sm">
              <p className="text-sm font-bold text-[#16845f]">Availability</p>
              <h2 className="mt-1 text-xl font-black text-[#12345b]">Set your work status</h2>
              <div className="mt-4 grid gap-2">
                {["AVAILABLE", "BUSY", "OFFLINE"].map((value) => (
                  <button key={value} onClick={() => updateStatus(value)} className={`rounded-xl border px-4 py-3 text-left text-sm font-extrabold transition disabled:cursor-not-allowed disabled:opacity-40 ${status === value ? "border-[#16845f] bg-[#effaf4] text-[#16845f]" : "border-slate-200 text-slate-600 hover:border-[#cfe4da]"}`}>{value}</button>
                ))}
              </div>
              <p className="mt-3 text-xs leading-5 text-slate-500">Choose AVAILABLE to receive matching service requests from customers within 10 km.</p>
            </section>

            {acceptedRequest && (
              <section className="rounded-[2rem] border border-[#cfe7da] bg-[#f1faf5] p-6 shadow-sm">
                <p className="text-sm font-bold text-[#16845f]">Current assignment</p>
                <h2 className="mt-1 text-xl font-black text-[#12345b]">{acceptedRequest.service}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{acceptedRequest.description}</p>
                <div className="mt-4 rounded-2xl bg-white p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Customer</p>
                  <p className="mt-1 font-extrabold text-[#12345b]">{acceptedRequest.customer?.name || "Customer"}</p>
                  {acceptedRequest.customer?.phone && <p className="mt-2 text-sm font-semibold text-slate-600">Contact: {acceptedRequest.customer.phone}</p>}
                  <div className="mt-3 flex items-start gap-2"><MapPin className="mt-0.5 text-[#16845f]" size={16} /><p className="text-sm font-semibold text-[#12345b]">{acceptedRequest.location?.formatted || "Location unavailable"}</p></div>
                </div>
              </section>
            )}


            <section className="rounded-[2rem] border border-[#e0ebe6] bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2"><Users className="text-[#16845f]" size={18} /><h2 className="text-lg font-black text-[#12345b]">Cooperative</h2></div>
              {worker?.cooperativeId ? (
                <div className="mt-4 rounded-xl bg-[#effaf4] p-4"><p className="text-sm font-bold text-[#16845f]">Associated with a cooperative</p><p className="mt-1 text-xs text-slate-500">Your cooperative can manage your work status and assignments.</p></div>
              ) : (
                <>
                  <p className="mt-2 text-sm leading-6 text-slate-500">Join an active cooperative to participate in the cooperative worker network.</p>
                  {cooperativeMessage && <div className="mt-3 rounded-xl bg-slate-50 p-3 text-xs font-semibold text-slate-600">{cooperativeMessage}</div>}
                  <div className="mt-4 space-y-3">
                    {cooperatives.length ? cooperatives.map((cooperative) => <div key={cooperative._id} className="rounded-xl border border-slate-200 p-3"><div className="flex items-start justify-between gap-2"><div><p className="font-bold text-[#12345b]">{cooperative.name}</p><p className="mt-1 text-xs text-slate-500">{cooperative.type || "Labour Cooperative"}</p></div><span className="text-xs font-bold text-[#16845f]">{cooperative.availableSlots} slots</span></div>{pendingCooperativeIds.has(String(cooperative._id)) ? (
                        <button
                          type="button"
                          disabled
                          className="mt-3 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-[#16845f] cursor-not-allowed"
                        >
                          Requested
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={joiningCooperativeId === cooperative._id}
                          onClick={() => joinCooperative(cooperative._id)}
                          className="mt-3 w-full rounded-lg bg-[#16845f] px-3 py-2 text-xs font-bold text-white hover:bg-[#11704f] disabled:opacity-50"
                        >
                          {joiningCooperativeId === cooperative._id ? "Sending..." : "Request to Join"}
                        </button>
                      )}</div>) : <p className="text-sm text-slate-500">No active cooperatives available right now.</p>}
                  </div>
                </>
              )}
            </section>
            <section className="rounded-[2rem] border border-[#e0ebe6] bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2"><Bell className="text-[#16845f]" size={18} /><h2 className="text-lg font-black text-[#12345b]">Notification history</h2></div>
              <div className="mt-4 space-y-3">
                {notifications.length ? notifications.slice(0, 8).map((notification, index) => <div key={notification._id || `${notification.requestId}-${index}`} className="rounded-xl border border-slate-100 bg-slate-50 p-3"><p className="text-sm font-bold text-[#12345b]">{notification.title || `New ${notification.service || "service"} request`}</p><p className="mt-1 text-xs leading-5 text-slate-500">{notification.body || notification.description || "A customer needs your service nearby."}</p></div>) : <p className="text-sm text-slate-500">No notifications yet.</p>}
              </div>
            </section>
          </aside>
        </div>

        <div className="mt-6 flex justify-end items-center gap-2 text-xs text-slate-400"><span className={`h-2 w-2 rounded-full ${socketConnected ? "bg-[#16845f]" : "bg-slate-300"}`} />{socketConnected ? "Live updates connected" : "Live updates reconnecting"}</div>
      </div>
    </main>
  );
}
