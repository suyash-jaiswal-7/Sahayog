import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Droplets,
  LogOut,
  MapPin,
  Paintbrush,
  RefreshCw,
  Scissors,
  Search,
  Sparkles,
  UserRound,
  Wrench,
  XCircle,
  Zap,
} from "lucide-react";
import { api } from "../lib/api";
import logo from "../assets/logo.png";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";
const CANCELLABLE_STATUSES = ["REQUESTED", "ASSIGNED", "IN_PROGRESS"];

const SERVICES = [
  { name: "Plumbing", icon: Droplets, description: "Pipes, taps, leaks & fittings" },
  { name: "Electrical", icon: Zap, description: "Wiring, switches & appliances" },
  { name: "Carpentry", icon: Scissors, description: "Furniture, doors & woodwork" },
  { name: "Painting", icon: Paintbrush, description: "Walls, rooms & finishing" },
  { name: "Cleaning", icon: Sparkles, description: "Home & sanitation services" },
];

const getCurrentLocation = () =>
  new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by this browser."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;

        console.log("GPS POSITION:");
        console.log("Latitude:", latitude);
        console.log("Longitude:", longitude);
        console.log("Accuracy:", accuracy, "meters");

        // Sahayog requires reasonably accurate location
        if (accuracy > 10000) {
          reject(
            new Error(
              `Location is too inaccurate (${Math.round(
                accuracy
              )} meters). Please enable precise location and try again.`
            )
          );
          return;
        }

        resolve({
          latitude,
          longitude,
          accuracy,
        });
      },

      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            reject(
              new Error(
                "Location permission denied. Please allow location access."
              )
            );
            break;

          case error.POSITION_UNAVAILABLE:
            reject(
              new Error(
                "Location unavailable. Please check your device location settings."
              )
            );
            break;

          case error.TIMEOUT:
            reject(
              new Error(
                "Location request timed out. Please try again."
              )
            );
            break;

          default:
            reject(new Error("Unable to detect your location."));
        }
      },

      {
        enableHighAccuracy: true,
        timeout: 30000,
        maximumAge: 0,
      }
    );
  });

const normalizeJob = (job) => {
  if (!job) return null;
  return {
    ...job,
    id: String(job.id || job._id),
    location: job.location || { formatted: "Location unavailable" },
    assignedWorker: job.assignedWorker || null,
  };
};

const statusMeta = {
  REQUESTED: { label: "Finding a professional", icon: Search },
  ASSIGNED: { label: "Request fulfilled — professional assigned", icon: CheckCircle2 },
  IN_PROGRESS: { label: "Service in progress", icon: Wrench },
  COMPLETED: { label: "Service completed", icon: CheckCircle2 },
  CANCELLED: { label: "Request cancelled", icon: XCircle },
};

const statusRank = {
  REQUESTED: 1,
  ASSIGNED: 2,
  IN_PROGRESS: 3,
  COMPLETED: 4,
  CANCELLED: 4,
};

const mergeJobs = (previous, incoming) => {
  // Cancelled requests are intentionally hidden from the customer dashboard.
  const incomingJobs = incoming
    .map(normalizeJob)
    .filter(Boolean)
    .filter((job) => job.status !== "CANCELLED");

  return incomingJobs.map((job) => {
    const old = previous.find((item) => String(item.id) === String(job.id));
    if (!old) return job;

    const oldRank = statusRank[old.status] || 0;
    const newRank = statusRank[job.status] || 0;

    // A stale response must never downgrade an already accepted/advanced job.
    if (oldRank > newRank) {
      return {
        ...job,
        status: old.status,
        assignedWorker: old.assignedWorker || job.assignedWorker || null,
      };
    }

    return {
      ...old,
      ...job,
      assignedWorker: job.assignedWorker || old.assignedWorker || null,
    };
  });
};

export default function CustomerDashboard({ customer, onLogout }) {
  const [selectedService, setSelectedService] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState("Detecting your location...");
  const [locationLoading, setLocationLoading] = useState(false);
  const [requestStatus, setRequestStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [requests, setRequests] = useState([]);
  const [socketConnected, setSocketConnected] = useState(false);

  const selectedServiceDetails = useMemo(
    () => SERVICES.find((service) => service.name === selectedService),
    [selectedService]
  );

  const fetchLocation = useCallback(async () => {
    setLocationLoading(true);
    setLocationStatus("Detecting your location...");

    try {
      const coordinates = await getCurrentLocation();

      let address;
      try {
        const response = await api("/location/reverse-geocode", {
          method: "POST",
          body: JSON.stringify(coordinates),
        });

        address =
          response.data?.address ||
          response.address ||
          { formatted: "Location detected" };

        if (!address?.formatted) {
          throw new Error("Reverse geocoding returned no address.");
        }
      } catch (error) {
        const message =
          error?.message ||
          "Unable to convert your current location into an address.";
        setLocation(null);
        setLocationStatus("Unable to determine your service address.");
        throw new Error(
          message.includes("Customer access required") || message.includes("Unauthorized")
            ? "Customer authentication expired. Please log in again."
            : "Unable to determine your service address. Please refresh your location and try again."
        );
      }

      const current = {
        ...coordinates,
        address,
      };

      setLocation(current);
      setLocationStatus(address.formatted);
      return current;
    } catch (error) {
      if (!String(error?.message || "").toLowerCase().includes("authentication")) {
        setLocation(null);
      }
      setLocationStatus(error.message || "Unable to detect your location. Please try again.");
      throw error;
    } finally {
      setLocationLoading(false);
    }
  }, []);

  const loadRequests = useCallback(async () => {
    try {
      const response = await api("/jobs/mine");
      const incoming = (response.jobs || []).map(normalizeJob).filter(Boolean);

      setRequests((previous) => mergeJobs(previous, incoming));
      return incoming;
    } catch (error) {
      // Do not touch location, form state, or authentication/session state here.
      if (
        error?.message === "Customer access required" ||
        /unauthorized|expired/i.test(error?.message || "")
      ) {
        setRequestStatus("Customer authentication expired. Please log in again.");
      }
      return null;
    }
  }, []);

  useEffect(() => {
    fetchLocation().catch(() => {});
    loadRequests();

    const polling = window.setInterval(() => {
      loadRequests();
    }, 5000);

    if (!window.io) {
      return () => window.clearInterval(polling);
    }

    const socket = window.io(SOCKET_URL, {
      withCredentials: true,
      transports: ["websocket", "polling"],
      auth: { role: "CUSTOMER" },
    });

    socket.on("connect", () => {
      setSocketConnected(true);
      loadRequests();
    });

    socket.on("disconnect", () => setSocketConnected(false));

    socket.on("worker-accepted", (payload) => {
      const requestId = payload?.requestId;
      if (!requestId) return;

      const worker = payload.worker || null;

      setRequests((current) => {
        const exists = current.some(
          (request) => String(request.id) === String(requestId)
        );

        if (!exists) {
          return [
            {
              id: String(requestId),
              service: payload.service || "Service",
              description: payload.description || "",
              status: "ASSIGNED",
              location: payload.location || { formatted: "Location unavailable" },
              assignedWorker: worker,
            },
            ...current,
          ];
        }

        return current.map((request) =>
          String(request.id) === String(requestId)
            ? {
                ...request,
                status: "ASSIGNED",
                assignedWorker: worker || request.assignedWorker || null,
                location: payload.location || request.location,
              }
            : request
        );
      });

      setRequestStatus("Request fulfilled — professional assigned.");
    });

    socket.on("request-cancelled", (payload) => {
      const requestId = payload?.requestId;
      if (!requestId) return;

      setRequests((current) =>
        current.map((request) =>
          String(request.id) === String(requestId)
            ? { ...request, status: "CANCELLED", assignedWorker: null }
            : request
        )
      );
    });

    socket.on("job-status-updated", (payload) => {
      const requestId = payload?.requestId;
      if (!requestId) return;

      setRequests((current) =>
        current.map((request) =>
          String(request.id) === String(requestId)
            ? {
                ...request,
                status: payload.status || request.status,
                assignedWorker:
                  payload.worker || request.assignedWorker || null,
              }
            : request
        )
      );
    });

    return () => {
      window.clearInterval(polling);
      socket.disconnect();
    };
  }, [fetchLocation, loadRequests]);

  const submit = async (event) => {
    event.preventDefault();

    if (!customer) {
      setRequestStatus("Customer access required. Please log in again.");
      return;
    }

    if (!selectedService) {
      setRequestStatus("Please select a service.");
      return;
    }

    const cleanDescription = description.trim();
    if (cleanDescription.length < 3) {
      setRequestStatus("Please describe the problem.");
      return;
    }

    setSubmitting(true);
    setRequestStatus("Detecting your current location...");

    try {
      // Always request fresh GPS for every new service request.
      const currentLocation = await fetchLocation();

      setRequestStatus("Finding professionals nearby...");

      const response = await api("/jobs/create", {
        method: "POST",
        body: JSON.stringify({
          service: selectedService,
          description: cleanDescription,
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          locationAddress: currentLocation.address,
        }),
      });

      const created = normalizeJob(response.job);

      setRequests((current) => {
        const withoutDuplicate = current.filter(
          (request) => String(request.id) !== String(created.id)
        );
        return [created, ...withoutDuplicate];
      });

      setRequestStatus(
        response.workerCount
          ? "Request sent to nearby professionals. Waiting for the first professional to accept."
          : "No available professionals are within 10 km right now."
      );

      setSelectedService("");
      setDescription("");

      // Reconcile only request data; never reset auth/location/form session.
      await loadRequests();
    } catch (error) {
      const message = error?.message || "";

      if (/customer access|required|unauthorized|invalid or expired access token/i.test(message)) {
        setRequestStatus("Customer authentication expired. Please log in again.");
      } else if (/location|address|geocod|permission|detect/i.test(message)) {
        setRequestStatus(message);
      } else {
        setRequestStatus(message || "Unable to send your request. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const cancelRequest = async (requestId) => {
    if (!requestId) return;

    try {
      await api(`/jobs/${requestId}/cancel`, { method: "PATCH" });

      // Remove the cancelled request from the dashboard immediately.
      setRequests((current) =>
        current.filter(
          (request) => String(request.id) !== String(requestId)
        )
      );

      setRequestStatus("Service request cancelled.");
    } catch (error) {
      setRequestStatus(error.message || "Unable to cancel this request.");
    }
  };

  const customerName =
    customer?.fullname || customer?.fullName || "Customer";

  return (
    <main className="min-h-screen bg-[#f6faf8] text-[#173b32]">
      <div className="border-b border-[#dcebe4] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#16845f] text-white shadow-sm">
              <span className="text-lg font-black">
                <img src={logo}
            alt="Sahayog Logo"
            className="w-12 h-12 object-contain"
                 />
              </span>
            </div>
            <div>
              <p className="text-lg font-extrabold tracking-tight text-[#12345b]">
                Sahayog
              </p>
              <p className="hidden text-xs text-slate-500 sm:block">
                People • Skills • Stronger Communities
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-bold text-[#12345b]">{customerName}</p>
              <p className="text-xs text-slate-500">Customer</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eaf7f1] text-[#16845f]">
              <UserRound size={19} />
            </div>
            <button
              onClick={onLogout}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-[#16845f] hover:text-[#16845f]"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <section className="mb-8 rounded-[2rem] bg-[#12345b] px-6 py-8 text-white shadow-xl sm:px-8 lg:px-10">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-100">
              <Sparkles size={14} /> Trusted cooperative services
            </span>
            <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
              How can we help you today?
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-200 sm:text-base">
              Choose a service and we&apos;ll connect you with a professional nearby.
            </p>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section className="rounded-[2rem] border border-[#e0ebe6] bg-white p-5 shadow-sm sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-[#16845f]">New request</p>
                <h2 className="mt-1 text-2xl font-black text-[#12345b]">
                  Request a professional
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Create a new request independently, even if another request is already active.
                </p>
              </div>
              <div className="rounded-2xl bg-[#effaf4] px-4 py-3 text-center">
                <p className="text-xs font-bold text-[#16845f]">ACTIVE</p>
                <p className="text-2xl font-black text-[#16845f]">
                  {requests.filter((request) =>
                    ["REQUESTED", "ASSIGNED", "IN_PROGRESS"].includes(request.status)
                  ).length}
                </p>
              </div>
            </div>

            <form onSubmit={submit} className="mt-6">
              <p className="text-sm font-bold text-[#12345b]">Select a service</p>

              <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                {SERVICES.map((service) => {
                  const Icon = service.icon;
                  const selected = selectedService === service.name;

                  return (
                    <button
                      key={service.name}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setSelectedService(service.name)}
                      className={`rounded-2xl border p-4 text-left transition focus:outline-none focus:ring-4 focus:ring-[#16845f]/10 ${
                        selected
                          ? "border-[#16845f] bg-[#effaf4] shadow-sm"
                          : "border-slate-200 bg-white hover:border-[#b9dcca] hover:bg-[#fbfefd]"
                      }`}
                    >
                      <div
                        className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                          selected
                            ? "bg-[#16845f] text-white"
                            : "bg-[#eef7f3] text-[#16845f]"
                        }`}
                      >
                        <Icon size={21} />
                      </div>
                      <p className="mt-3 font-extrabold text-[#12345b]">
                        {service.name}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        {service.description}
                      </p>
                    </button>
                  );
                })}
              </div>

              {selectedServiceDetails && (
                <div className="mt-7 space-y-5">
                  <div>
                    <label
                      htmlFor="service-description"
                      className="text-sm font-bold text-[#12345b]"
                    >
                      Describe the problem
                    </label>
                    <textarea
                      id="service-description"
                      value={description}
                      onChange={(event) => setDescription(event.target.value)}
                      required
                      minLength={3}
                      maxLength={2000}
                      rows={5}
                      placeholder="Tell us what you need help with..."
                      className="mt-2 w-full resize-y rounded-2xl border border-slate-200 bg-white p-4 text-sm text-[#12345b] outline-none transition focus:border-[#16845f] focus:ring-4 focus:ring-[#16845f]/10"
                    />
                    <p className="mt-1 text-right text-xs text-slate-400">
                      {description.length}/2000
                    </p>
                  </div>

                  <div className="rounded-2xl border border-[#cfe7da] bg-[#f1faf5] p-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex min-w-0 items-start gap-3">
                        <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#16845f] shadow-sm">
                          <MapPin size={19} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-extrabold text-[#16845f]">
                            Service location
                          </p>
                          <p className="mt-1 break-words text-sm font-semibold text-[#12345b]">
                            {location?.address?.formatted || locationStatus}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            Your current location is used to find professionals within 10 km.
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => fetchLocation().catch(() => {})}
                        disabled={locationLoading}
                        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-[#b9dcca] bg-white px-4 py-2.5 text-sm font-bold text-[#16845f] transition hover:bg-[#e9f7f0] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <RefreshCw
                          size={16}
                          className={locationLoading ? "animate-spin" : ""}
                        />
                        {locationLoading ? "Detecting..." : "Refresh location"}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting || locationLoading || !customer}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#16845f] px-5 py-3.5 font-extrabold text-white shadow-lg shadow-[#16845f]/15 transition hover:bg-[#11704f] focus:outline-none focus:ring-4 focus:ring-[#16845f]/20 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {submitting ? "Finding professionals..." : "Find & Notify Workers"}
                    {!submitting && <ArrowRight size={18} />}
                  </button>
                </div>
              )}

              {requestStatus && (
                <div
                  className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-medium text-slate-700"
                  role="status"
                >
                  {requestStatus}
                </div>
              )}
            </form>
          </section>

          <aside className="space-y-6">
            <section className="rounded-[2rem] border border-[#e0ebe6] bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#effaf4] text-[#16845f]">
                  <MapPin size={19} />
                </div>
                <div>
                  <p className="text-sm font-extrabold text-[#12345b]">Your service location</p>
                  <p className="text-xs text-slate-500">Private matching location</p>
                </div>
              </div>

              <p className="mt-4 break-words text-sm font-bold text-[#12345b]">
                {location?.address?.formatted || locationStatus}
              </p>

              <div className="mt-4 rounded-xl bg-[#f7faf8] p-3 text-xs leading-5 text-slate-500">
                Sahayog uses your current location only to find nearby professionals. Technical GPS details are kept out of the customer interface.
              </div>
            </section>

            <section className="rounded-[2rem] border border-[#e0ebe6] bg-white p-6 shadow-sm">
              <p className="text-sm font-bold text-[#16845f]">How it works</p>
              <div className="mt-4 space-y-4">
                {[
                  ["01", "Choose a service", "Tell us what kind of help you need."],
                  ["02", "We find professionals", "Available professionals within 10 km are notified."],
                  ["03", "First acceptance wins", "The first professional to accept is assigned to you."],
                ].map(([number, title, text]) => (
                  <div key={number} className="flex gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#12345b] text-xs font-black text-white">
                      {number}
                    </span>
                    <div>
                      <p className="text-sm font-extrabold text-[#12345b]">{title}</p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">{text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </div>

        <section className="mt-6 rounded-[2rem] border border-[#e0ebe6] bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-bold text-[#16845f]">Request activity</p>
              <h2 className="mt-1 text-2xl font-black text-[#12345b]">
                Your service requests
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Every request is independent. You can create another request without waiting for previous requests to finish.
              </p>
            </div>

            <button
              type="button"
              onClick={loadRequests}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:border-[#16845f] hover:text-[#16845f]"
            >
              <RefreshCw size={16} /> Refresh
            </button>
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            {requests.length ? (
              requests.map((request) => {
                const meta = statusMeta[request.status] || statusMeta.REQUESTED;
                const StatusIcon = meta.icon;
                const worker = request.assignedWorker;
                const canCancel = CANCELLABLE_STATUSES.includes(request.status);

                return (
                  <article
                    key={request.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-[#cfe4da] hover:shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="inline-flex rounded-full bg-[#effaf4] px-3 py-1 text-xs font-extrabold text-[#16845f]">
                        {request.service}
                      </span>

                      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1.5 text-xs font-extrabold text-[#12345b]">
                        <StatusIcon size={14} />
                        {meta.label}
                      </span>
                    </div>

                    <h3 className="mt-4 text-lg font-black text-[#12345b]">
                      Service request
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {request.description}
                    </p>

                    <div className="mt-4 rounded-2xl bg-[#f7faf8] p-4">
                      <div className="flex items-start gap-3">
                        <MapPin className="mt-0.5 shrink-0 text-[#16845f]" size={17} />
                        <div className="min-w-0">
                          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                            Service location
                          </p>
                          <p className="mt-1 break-words text-sm font-bold text-[#12345b]">
                            {request.location?.formatted || "Location unavailable"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {request.status === "ASSIGNED" && worker && (
                      <div className="mt-4 rounded-2xl border border-[#cfe7da] bg-[#f1faf5] p-4">
                        <div className="flex items-center gap-3">
                          {worker.profilePhoto ? (
                            <img
                              src={worker.profilePhoto}
                              alt=""
                              className="h-14 w-14 rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white text-[#16845f]">
                              <UserRound size={23} />
                            </div>
                          )}

                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold uppercase tracking-wide text-[#16845f]">
                              Professional found
                            </p>
                            <p className="mt-1 font-black text-[#12345b]">
                              {worker.name || "Professional"}
                            </p>
                            <p className="mt-1 text-xs text-slate-600">
                              ★ {Number(worker.rating || 0).toFixed(1)} · {worker.experienceYears || 0} years experience
                            </p>
                          </div>

                          <CheckCircle2 className="shrink-0 text-[#16845f]" size={25} />
                        </div>

                        {worker.phone && (
                          <p className="mt-3 text-sm font-bold text-[#12345b]">
                            Contact professional: {worker.phone}
                          </p>
                        )}
                      </div>
                    )}

                    {request.status === "REQUESTED" && (
                      <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                        <p className="font-extrabold text-[#12345b]">
                          Waiting for a professional to accept
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Available professionals nearby have been notified.
                        </p>
                      </div>
                    )}

                    {request.status === "IN_PROGRESS" && worker && (
                      <div className="mt-4 rounded-2xl border border-amber-100 bg-amber-50 p-4">
                        <p className="font-extrabold text-[#12345b]">Service in progress</p>
                        <p className="mt-1 text-sm text-slate-600">
                          Professional: {worker.name || "Professional"}
                        </p>
                      </div>
                    )}

                    {request.status === "COMPLETED" && (
                      <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                        <p className="font-extrabold text-[#12345b]">Service completed</p>
                      </div>
                    )}

                    <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                      <p className="text-xs text-slate-400">
                        {request.createdAt
                          ? new Date(request.createdAt).toLocaleString()
                          : ""}
                      </p>

                      {canCancel && (
                        <button
                          type="button"
                          onClick={() => cancelRequest(request.id)}
                          className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50"
                        >
                          <XCircle size={16} />
                          Cancel request
                        </button>
                      )}
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="rounded-2xl bg-[#f7faf8] p-10 text-center lg:col-span-2">
                <BriefcaseIconFallback />
                <p className="mt-3 font-extrabold text-[#12345b]">No service requests yet</p>
                <p className="mt-1 text-sm text-slate-500">
                  Choose a service above to create your first request.
                </p>
              </div>
            )}
          </div>
        </section>

        <div className="mt-6 flex items-center justify-end gap-2 text-xs text-slate-400">
          <span
            className={`h-2 w-2 rounded-full ${
              socketConnected ? "bg-[#16845f]" : "bg-slate-300"
            }`}
          />
          {socketConnected ? "Live updates connected" : "Live updates reconnecting"}
        </div>
      </div>
    </main>
  );
}

function BriefcaseIconFallback() {
  return (
    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#16845f] shadow-sm">
      <Wrench size={25} />
    </div>
  );
}
