import { useState } from "react";
import { api } from "../lib/api";
import logo from "../assets/logo.png";
import {
  UserRound,
  Wrench,
  Building2,
  ArrowLeft,
  ArrowRight,
  LogIn,
  UserPlus,
  MapPin,
} from "lucide-react";

function AuthPage({ onBackHome, onAuthenticated, initialRole = null, initialAuthMode = null, onRouteChange }) {
  // ------------------------------------------------------------
  // AUTHENTICATION UI STATE
  // ------------------------------------------------------------
  // selectedRole = Customer / Worker / Cooperative Owner
  // authMode     = Login / Register
  //
  // Backend integration will be added later. For now these
  // states only control the frontend screens.
  // ------------------------------------------------------------
  const [selectedRole, setSelectedRole] = useState(initialRole);
  const [authMode, setAuthMode] = useState(initialAuthMode);

  // ------------------------------------------------------------
  // CUSTOMER REGISTRATION FORM STATE
  // ------------------------------------------------------------
  // These fields follow the structure provided by the backend team.
  // Required fields are marked with * in the UI.
  // ------------------------------------------------------------
  const [customerForm, setCustomerForm] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    houseFlat: "",
    area: "",
    city: "",
    state: "",
    pincode: "",
  });

  // Profile image is kept as a File object for future backend upload.
  // Backend team can later send this file as multipart/form-data
  // according to the final registration API contract.
  const [profileImage, setProfileImage] = useState(null);

  // ------------------------------------------------------------
  // CUSTOMER LOGIN FORM STATE
  // ------------------------------------------------------------
  // Frontend-only state for the customer login screen.
  //
  // BACKEND INTEGRATION NOTE:
  // The backend team can connect these values to the final
  // customer login endpoint once the API contract is finalized.
  // ------------------------------------------------------------
  const [customerLogin, setCustomerLogin] = useState({
    email: "",
    password: "",
  });

  // Stores browser location information when the user chooses
  // "Use My Location".
  //
  // BACKEND INTEGRATION NOTE:
  // The backend team can later decide how these coordinates
  // should be stored or used for location-based matching.
  const [location, setLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState("");

  // Frontend-only information for each supported Sahayog role.
  const roles = {
    customer: {
      title: "Customer",
      icon: UserRound,
      color: "#16845f",
      softColor: "bg-[#16845f]/10",
      description:
        "Find trusted skilled workers and book services for your household or community.",
    },
    worker: {
      title: "Worker",
      icon: Wrench,
      color: "#e67e22",
      softColor: "bg-[#e67e22]/10",
      description:
        "Showcase your skills, connect with opportunities, and serve customers through your cooperative.",
    },
    cooperative: {
      title: "Cooperative Owner",
      icon: Building2,
      color: "#12345b",
      softColor: "bg-[#12345b]/10",
      description:
        "Manage your cooperative and coordinate skilled workers through Sahayog.",
    },
  };

  // ------------------------------------------------------------
  // ROLE SELECTION
  // ------------------------------------------------------------
  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setAuthMode(null);

    if (onRouteChange) {
      onRouteChange("/auth");
    }
  };

  const handleBackToRoles = () => {
    setSelectedRole(null);
    setAuthMode(null);
    if (onRouteChange) onRouteChange("/auth");
  };

  const handleAuthModeSelect = (mode) => {
    setAuthMode(mode);

    if (!onRouteChange) return;

    if (selectedRole === "customer") {
      onRouteChange(mode === "login" ? "/customer/login" : "/customer/register");
    } else if (selectedRole === "worker") {
      onRouteChange(mode === "login" ? "/worker/login" : "/worker/register");
    } else {
      onRouteChange(mode === "login" ? "/cooperative/login" : "/cooperative/register");
    }
  };

  // Return completely to the three role cards.

  // ============================================================
  // WORKER REGISTRATION + LOGIN
  // Frontend-only for now.
  // TODO BACKEND: Connect these handlers to worker auth APIs.
  // ============================================================

  const [workerForm, setWorkerForm] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    profileImage: null,
    houseFlat: "",
    area: "",
    city: "",
    state: "",
    pincode: "",
    latitude: null,
    longitude: null,
  });

  const [workerLocationStatus, setWorkerLocationStatus] = useState("");
  const [workerServices, setWorkerServices] = useState({});

  const [workerLogin, setWorkerLogin] = useState({
    email: "",
    password: "",
  });

  const [cooperativeLogin, setCooperativeLogin] = useState({
    email: "",
    password: "",
  });

  const [cooperativeForm, setCooperativeForm] = useState({
    cooperativeName: "",
    registrationNumber: "",
    description: "",
    cooperativeEmail: "",
    cooperativePhone: "",
    adminFullName: "",
    adminEmail: "",
    adminPhone: "",
    password: "",
    confirmPassword: "",
    house: "",
    area: "",
    city: "",
    state: "",
    pincode: "",
    latitude: null,
    longitude: null,
  });
  const [cooperativeLocationStatus, setCooperativeLocationStatus] = useState("");


  const handleWorkerChange = (event) => {
    const { name, value } = event.target;

    setWorkerForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleWorkerLoginChange = (event) => {
    const { name, value } = event.target;

    setWorkerLogin((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCooperativeChange = (event) => {
    const { name, value } = event.target;
    setCooperativeForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCooperativeLoginChange = (event) => {
    const { name, value } = event.target;
    setCooperativeLogin((prev) => ({ ...prev, [name]: value }));
  };

  const handleCooperativeLocation = () => {
    if (!navigator.geolocation) {
      setCooperativeLocationStatus("Location is not supported by this browser.");
      return;
    }
    setCooperativeLocationStatus("Detecting your location...");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setCooperativeForm((prev) => ({ ...prev, latitude: coords.latitude, longitude: coords.longitude }));
        setCooperativeLocationStatus("Location detected successfully.");
      },
      () => setCooperativeLocationStatus("Unable to detect location. Please allow location access and try again."),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const handleCooperativeLoginSubmit = async (event) => {
    event.preventDefault();
    if (!cooperativeLogin.email || !cooperativeLogin.password) return alert("Please enter your email and password.");
    try {
      const data = await api("/cooperative-admin/login", { method: "POST", body: JSON.stringify(cooperativeLogin) });
      onAuthenticated("cooperative", data.data.cooperativeAdmin);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleCooperativeRegister = async (event) => {
    event.preventDefault();
    const required = [cooperativeForm.cooperativeName, cooperativeForm.registrationNumber, cooperativeForm.cooperativeEmail, cooperativeForm.cooperativePhone, cooperativeForm.adminFullName, cooperativeForm.adminEmail, cooperativeForm.adminPhone, cooperativeForm.password, cooperativeForm.confirmPassword, cooperativeForm.area, cooperativeForm.city, cooperativeForm.state, cooperativeForm.pincode];
    if (required.some((value) => !String(value || "").trim())) return alert("Please fill all required fields.");
    if (cooperativeForm.password !== cooperativeForm.confirmPassword) return alert("Passwords do not match.");
    if (cooperativeForm.latitude === null || cooperativeForm.longitude === null) return alert("Please use Current Location. Cooperative location is required.");
    try {
      const payload = {
        cooperative: {
          name: cooperativeForm.cooperativeName,
          registrationNumber: cooperativeForm.registrationNumber,
          type: "LABOUR_COOPERATIVE",
          description: cooperativeForm.description,
          email: cooperativeForm.cooperativeEmail,
          phone: cooperativeForm.cooperativePhone,
          address: { house: cooperativeForm.house, area: cooperativeForm.area, city: cooperativeForm.city, state: cooperativeForm.state, pincode: cooperativeForm.pincode },
          location: { type: "Point", coordinates: [Number(cooperativeForm.longitude), Number(cooperativeForm.latitude)] },
        },
        admin: { fullName: cooperativeForm.adminFullName, email: cooperativeForm.adminEmail, phone: cooperativeForm.adminPhone, password: cooperativeForm.password },
      };
      const data = await api("/cooperative-admin/register-owner", { method: "POST", body: JSON.stringify(payload) });
      alert(data.message || "Cooperative registration submitted. It will be available after System Admin verification.");
      setAuthMode("login");
      if (onRouteChange) onRouteChange("/cooperative/login");
    } catch (error) {
      alert(error.message);
    }
  };

  const handleWorkerProfileImage = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    // Frontend only: store the selected image file.
    // TODO BACKEND: Upload this file and save the returned image URL.
    setWorkerForm((prev) => ({
      ...prev,
      profileImage: file,
    }));
  };

  const handleWorkerLocation = () => {
    if (!navigator.geolocation) {
      setWorkerLocationStatus(
        "Location is not supported by this browser."
      );
      return;
    }

    setWorkerLocationStatus("Detecting your location...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        setWorkerForm((prev) => ({
          ...prev,
          latitude,
          longitude,
        }));

        setWorkerLocationStatus("Location detected successfully.");

        // TODO BACKEND:
        // Use these coordinates for reverse geocoding/location storage later.
        console.log("Worker location:", { latitude, longitude });
      },
      () => {
        setWorkerLocationStatus(
          "Unable to detect location. Please allow location access."
        );
      }
    );
  };

  const toggleWorkerService = (service) => {
    setWorkerServices((prev) => {
      if (prev[service]) {
        const updated = { ...prev };
        delete updated[service];
        return updated;
      }

      return {
        ...prev,
        [service]: {
          experience: "",
          skillLevel: "BEGINNER",
        },
      };
    });
  };

  const updateWorkerService = (service, field, value) => {
    setWorkerServices((prev) => ({
      ...prev,
      [service]: {
        ...prev[service],
        [field]: value,
      },
    }));
  };

  const handleWorkerRegister = async (event) => {
    event.preventDefault();
    const requiredFields = [workerForm.fullName, workerForm.email, workerForm.phoneNumber, workerForm.password, workerForm.confirmPassword, workerForm.area, workerForm.city, workerForm.state, workerForm.pincode];
    if (requiredFields.some((field) => !String(field || "").trim())) return alert("Please fill all required fields.");
    if (workerForm.password !== workerForm.confirmPassword) return alert("Passwords do not match.");
    if (!Object.keys(workerServices).length) return alert("Please select at least one service.");
    if (Object.values(workerServices).some((d) => d.experience === "")) return alert("Please enter experience for every selected service.");
    if (workerForm.latitude === null || workerForm.longitude === null) return alert("Please use Current Location. Location is required for matching.");
    try {
      const form = new FormData();
      form.append("fullName", workerForm.fullName); form.append("email", workerForm.email); form.append("phone", workerForm.phoneNumber); form.append("password", workerForm.password);
      form.append("address", JSON.stringify({ house: workerForm.houseFlat, area: workerForm.area, city: workerForm.city, state: workerForm.state, pincode: workerForm.pincode }));
      form.append("location", JSON.stringify({ type: "Point", coordinates: [Number(workerForm.longitude), Number(workerForm.latitude)] }));
      form.append("skills", JSON.stringify(Object.entries(workerServices).map(([service, d]) => ({ service, experienceYears: Number(d.experience), skillLevel: d.skillLevel }))));
      if (workerForm.profileImage) form.append("profilePhoto", workerForm.profileImage);
      const data = await api("/workers/register", { method: "POST", body: form });
      alert(data.message || "Worker registered successfully. Your account is ready to use after registration.");
      setAuthMode("login");
      if (onRouteChange) onRouteChange("/worker/login");
    } catch (error) { alert(error.message); }
  };

  const handleWorkerLoginSubmit = async (event) => {
    event.preventDefault();
    if (!workerLogin.email || !workerLogin.password) return alert("Please enter your email and password.");
    try { const data = await api("/workers/login", { method: "POST", body: JSON.stringify(workerLogin) }); onAuthenticated("worker", data.data.worker); }
    catch (error) { alert(error.message); }
  };

  // Return from a Login/Register form to the Login/Register choice.
  const handleBackToAuthChoice = () => {
    setAuthMode(null);
    if (onRouteChange) onRouteChange("/auth");
  };

  // ------------------------------------------------------------
  // CUSTOMER FORM HANDLERS
  // ------------------------------------------------------------

  // Updates one customer form field.
  const handleCustomerChange = (event) => {
    const { name, value } = event.target;

    setCustomerForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ------------------------------------------------------------
  // CUSTOMER LOGIN
  // ------------------------------------------------------------
  const handleCustomerLoginChange = (event) => {
    const { name, value } = event.target;

    setCustomerLogin((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ------------------------------------------------------------
  // CUSTOMER LOGIN SUBMIT
  // ------------------------------------------------------------
  // No API request is made yet.
  //
  // BACKEND INTEGRATION NOTE:
  // Replace the console.log below with the final customer login
  // API call. The backend can then return the authentication
  // response/session according to its finalized contract.
  // ------------------------------------------------------------
  const handleCustomerLoginSubmit = async (event) => {
    event.preventDefault();
    try { const data = await api("/customers/login", { method: "POST", body: JSON.stringify(customerLogin) }); onAuthenticated("customer", data.data.customer); }
    catch (error) { alert(error.message); }
  };

  // ------------------------------------------------------------
  // PROFILE IMAGE
  // ------------------------------------------------------------
  // Frontend stores the selected image temporarily.
  // No image is uploaded to the backend yet.
  // ------------------------------------------------------------
  const handleProfileImageChange = (event) => {
    const file = event.target.files?.[0] || null;
    setProfileImage(file);
  };

  // ------------------------------------------------------------
  // CURRENT LOCATION
  // ------------------------------------------------------------
  // Uses the browser's built-in geolocation permission.
  //
  // IMPORTANT:
  // This currently captures latitude/longitude only.
  // Converting coordinates into Area/City/State/Pincode requires
  // a location/reverse-geocoding service and will be connected
  // later according to the team's backend/API decision.
  // ------------------------------------------------------------
  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus("Location is not supported by this browser.");
      return;
    }

    setLocationStatus("Detecting your location...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const detectedLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        setLocation(detectedLocation);
        setLocationStatus("Location detected successfully.");
      },
      () => {
        setLocationStatus(
          "Unable to detect location. Please allow location access and try again."
        );
      }
    );
  };

  // ------------------------------------------------------------
  // CUSTOMER REGISTRATION SUBMIT
  // ------------------------------------------------------------
  // No backend request is made yet.
  //
  // BACKEND INTEGRATION NOTE:
  // The backend team can replace this section with the registration
  // API call once the endpoint and request payload are finalized.
  // ------------------------------------------------------------
  const handleCustomerSubmit = async (event) => {
    event.preventDefault();
    if (customerForm.password !== customerForm.confirmPassword) return alert("Password and Confirm Password must match.");
    try {
      const data = await api("/customers/register", { method: "POST", body: JSON.stringify({ fullname: customerForm.fullName, email: customerForm.email, phone: customerForm.phoneNumber, password: customerForm.password, address: { house: customerForm.houseFlat, area: customerForm.area, city: customerForm.city, state: customerForm.state, pincode: customerForm.pincode }, location: location ? { type: "Point", coordinates: [location.longitude, location.latitude] } : undefined }) });
      alert(data.message || "Customer registered successfully.");
      setAuthMode("login");
      if (onRouteChange) onRouteChange("/customer/login");
    } catch (error) { alert(error.message); }
  };

  return (
    <div className="min-h-screen bg-[#f8fbfd] text-[#12345b]">

      {/* ================= HEADER ================= */}
      <header className="border-b border-[#dce8e3] bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          {/* Sahayog Logo + Name */}
          <div className="flex items-center gap-3">
            <img
              src={logo}
              alt="Sahayog Logo"
              className="h-12 w-12 object-contain"
            />

            <div>
              <h1 className="text-xl font-bold tracking-tight text-[#12345b]">
                Sahayog
              </h1>

              <p className="text-xs text-gray-500">
                People • Skills • Stronger Communities
              </p>
            </div>
          </div>

          {/* Back to Home */}
          <button
            type="button"
            onClick={onBackHome}
            className="flex items-center gap-2 text-sm font-medium text-[#12345b] transition hover:text-[#16845f]"
          >
            <ArrowLeft size={17} />
            Back to Home
          </button>
        </div>
      </header>

      {/* ================= MAIN CONTENT ================= */}
      <main className="relative min-h-[calc(100vh-81px)] overflow-hidden px-6 py-12">

        {/* Soft green background decoration */}
        <div className="pointer-events-none absolute left-[-120px] top-20 h-72 w-72 rounded-full bg-[#16845f]/10 blur-3xl" />

        {/* Soft orange background decoration */}
        <div className="pointer-events-none absolute right-[-120px] top-10 h-80 w-80 rounded-full bg-[#e67e22]/10 blur-3xl" />

        <div className="relative z-10 mx-auto w-full max-w-5xl">

          {/* ================= ROLE SELECTION ================= */}
          {!selectedRole && (
            <>
              <div className="mx-auto mb-12 max-w-2xl text-center">
                <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#16845f]">
                  Welcome to Sahayog
                </p>

                <h2 className="text-4xl font-bold tracking-tight text-[#12345b] sm:text-5xl">
                  How do you want to continue?
                </h2>

                <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-[#526b86] sm:text-lg">
                  Choose your role to continue with Sahayog.
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-3">

                {/* Customer */}
                <button
                  type="button"
                  onClick={() => handleRoleSelect("customer")}
                  className="group rounded-3xl border border-[#dce7ef] bg-white p-8 text-left shadow-lg shadow-[#12345b]/5 transition duration-300 hover:-translate-y-2 hover:border-[#16845f]/40 hover:shadow-xl"
                >
                  <div className="mb-7 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#16845f]/10 text-[#16845f] transition duration-300 group-hover:bg-[#16845f] group-hover:text-white">
                    <UserRound size={30} />
                  </div>

                  <h3 className="text-2xl font-bold text-[#12345b]">
                    Customer
                  </h3>

                  <p className="mt-3 leading-6 text-[#526b86]">
                    Find trusted skilled workers and book services for your
                    household or community.
                  </p>

                  <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-[#16845f]">
                    Continue as Customer
                    <ArrowRight size={16} />
                  </div>
                </button>

                {/* Worker */}
                <button
                  type="button"
                  onClick={() => handleRoleSelect("worker")}
                  className="group rounded-3xl border border-[#dce7ef] bg-white p-8 text-left shadow-lg shadow-[#12345b]/5 transition duration-300 hover:-translate-y-2 hover:border-[#e67e22]/40 hover:shadow-xl"
                >
                  <div className="mb-7 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e67e22]/10 text-[#e67e22] transition duration-300 group-hover:bg-[#e67e22] group-hover:text-white">
                    <Wrench size={30} />
                  </div>

                  <h3 className="text-2xl font-bold text-[#12345b]">
                    Worker
                  </h3>

                  <p className="mt-3 leading-6 text-[#526b86]">
                    Showcase your skills, connect with opportunities, and serve
                    customers through your cooperative.
                  </p>

                  <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-[#e67e22]">
                    Continue as Worker
                    <ArrowRight size={16} />
                  </div>
                </button>

                {/* Cooperative Owner */}
                <button
                  type="button"
                  onClick={() => handleRoleSelect("cooperative")}
                  className="group rounded-3xl border border-[#dce7ef] bg-white p-8 text-left shadow-lg shadow-[#12345b]/5 transition duration-300 hover:-translate-y-2 hover:border-[#12345b]/40 hover:shadow-xl"
                >
                  <div className="mb-7 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#12345b]/10 text-[#12345b] transition duration-300 group-hover:bg-[#12345b] group-hover:text-white">
                    <Building2 size={30} />
                  </div>

                  <h3 className="text-2xl font-bold text-[#12345b]">
                    Cooperative Owner
                  </h3>

                  <p className="mt-3 leading-6 text-[#526b86]">
                    Manage your cooperative and coordinate skilled workers
                    through Sahayog.
                  </p>

                  <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-[#12345b]">
                    Continue as Owner
                    <ArrowRight size={16} />
                  </div>
                </button>

              </div>

              <p className="mt-10 text-center text-sm text-[#526b86]">
                Your role will determine the login and registration options
                available to you.
              </p>
            </>
          )}

          {/* ================= LOGIN / REGISTER CHOICE ================= */}
          {selectedRole && !authMode && (
            <div className="mx-auto max-w-2xl">

              <button
                type="button"
                onClick={handleBackToRoles}
                className="mb-8 flex items-center gap-2 text-sm font-medium text-[#526b86] transition hover:text-[#16845f]"
              >
                <ArrowLeft size={17} />
                Change role
              </button>

              <div className="rounded-3xl border border-[#dce7ef] bg-white p-8 text-center shadow-xl shadow-[#12345b]/5 sm:p-12">

                <div
                  className={`mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl ${roles[selectedRole].softColor}`}
                  style={{ color: roles[selectedRole].color }}
                >
                  {(() => {
                    const RoleIcon = roles[selectedRole].icon;
                    return <RoleIcon size={30} />;
                  })()}
                </div>

                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#16845f]">
                  {roles[selectedRole].title}
                </p>

                <h2 className="mt-3 text-3xl font-bold text-[#12345b] sm:text-4xl">
                  Welcome to Sahayog
                </h2>

                <p className="mx-auto mt-4 max-w-lg leading-7 text-[#526b86]">
                  {roles[selectedRole].description}
                </p>

                <div className="mt-10 grid gap-4 sm:grid-cols-2">

                  {/* Login */}
                  <button
                    type="button"
                    onClick={() => handleAuthModeSelect("login")}
                    className="group flex items-center justify-center gap-3 rounded-2xl border border-[#12345b]/15 bg-white px-6 py-4 font-semibold text-[#12345b] shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#12345b]/30 hover:bg-[#12345b] hover:text-white"
                  >
                    <LogIn size={19} />
                    Login
                  </button>

                  {/* Register */}
                  <button
                    type="button"
                    onClick={() => handleAuthModeSelect("register")}
                    className="group flex items-center justify-center gap-3 rounded-2xl bg-[#e67e22] px-6 py-4 font-semibold text-white shadow-lg shadow-[#e67e22]/20 transition duration-300 hover:-translate-y-1 hover:bg-[#d96f16]"
                  >
                    <UserPlus size={19} />
                    Register
                  </button>

                </div>

                <p className="mt-7 text-xs leading-5 text-[#526b86]">
                  Authentication forms will use the fields provided by the
                  backend team.
                </p>
              </div>
            </div>
          )}

          {/* ================= CUSTOMER REGISTRATION ================= */}
          {selectedRole === "customer" &&
            authMode === "register" && (
              <div className="mx-auto max-w-4xl">

                {/* Back to Login/Register */}
                <button
                  type="button"
                  onClick={handleBackToAuthChoice}
                  className="mb-8 flex items-center gap-2 text-sm font-medium text-[#526b86] transition hover:text-[#16845f]"
                >
                  <ArrowLeft size={17} />
                  Back to Login / Register
                </button>

                <div className="rounded-3xl border border-[#dce7ef] bg-white p-7 shadow-xl shadow-[#12345b]/5 sm:p-10">

                  {/* Form heading */}
                  <div className="mb-10">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#16845f]">
                      Customer Registration
                    </p>

                    <h2 className="mt-3 text-3xl font-bold text-[#12345b] sm:text-4xl">
                      Create your Sahayog account
                    </h2>

                    <p className="mt-3 max-w-2xl leading-7 text-[#526b86]">
                      Register to find trusted skilled workers and book
                      services for your household or community.
                    </p>
                  </div>

                  <form onSubmit={handleCustomerSubmit}>

                    {/* ================= PERSONAL DETAILS ================= */}
                    <section>
                      <h3 className="text-xl font-bold text-[#12345b]">
                        Personal Details
                      </h3>

                      <div className="mt-5 grid gap-5 md:grid-cols-2">

                        {/* Full Name */}
                        <div>
                          <label className="mb-2 block text-sm font-semibold text-[#12345b]">
                            Full Name <span className="text-[#e67e22]">*</span>
                          </label>

                          <input
                            type="text"
                            name="fullName"
                            value={customerForm.fullName}
                            onChange={handleCustomerChange}
                            required
                            placeholder="Enter your full name"
                            className="w-full rounded-xl border border-[#dce7ef] bg-[#f8fbfd] px-4 py-3 text-[#12345b] outline-none transition focus:border-[#16845f] focus:ring-2 focus:ring-[#16845f]/10"
                          />
                        </div>

                        {/* Email */}
                        <div>
                          <label className="mb-2 block text-sm font-semibold text-[#12345b]">
                            Email <span className="text-[#e67e22]">*</span>
                          </label>

                          <input
                            type="email"
                            name="email"
                            value={customerForm.email}
                            onChange={handleCustomerChange}
                            required
                            placeholder="Enter your email"
                            className="w-full rounded-xl border border-[#dce7ef] bg-[#f8fbfd] px-4 py-3 text-[#12345b] outline-none transition focus:border-[#16845f] focus:ring-2 focus:ring-[#16845f]/10"
                          />
                        </div>

                        {/* Phone Number */}
                        <div>
                          <label className="mb-2 block text-sm font-semibold text-[#12345b]">
                            Phone Number{" "}
                            <span className="text-[#e67e22]">*</span>
                          </label>

                          <input
                            type="tel"
                            name="phoneNumber"
                            value={customerForm.phoneNumber}
                            onChange={handleCustomerChange}
                            required
                            placeholder="Enter your phone number"
                            className="w-full rounded-xl border border-[#dce7ef] bg-[#f8fbfd] px-4 py-3 text-[#12345b] outline-none transition focus:border-[#16845f] focus:ring-2 focus:ring-[#16845f]/10"
                          />
                        </div>

                        {/* Password */}
                        <div>
                          <label className="mb-2 block text-sm font-semibold text-[#12345b]">
                            Password <span className="text-[#e67e22]">*</span>
                          </label>

                          <input
                            type="password"
                            name="password"
                            value={customerForm.password}
                            onChange={handleCustomerChange}
                            required
                            placeholder="Create a password"
                            className="w-full rounded-xl border border-[#dce7ef] bg-[#f8fbfd] px-4 py-3 text-[#12345b] outline-none transition focus:border-[#16845f] focus:ring-2 focus:ring-[#16845f]/10"
                          />
                        </div>

                        {/* Confirm Password */}
                        <div className="md:col-span-2">
                          <label className="mb-2 block text-sm font-semibold text-[#12345b]">
                            Confirm Password{" "}
                            <span className="text-[#e67e22]">*</span>
                          </label>

                          <input
                            type="password"
                            name="confirmPassword"
                            value={customerForm.confirmPassword}
                            onChange={handleCustomerChange}
                            required
                            placeholder="Confirm your password"
                            className="w-full rounded-xl border border-[#dce7ef] bg-[#f8fbfd] px-4 py-3 text-[#12345b] outline-none transition focus:border-[#16845f] focus:ring-2 focus:ring-[#16845f]/10"
                          />
                        </div>

                        {/* Profile Image */}
                        <div className="md:col-span-2">
                          <label className="mb-2 block text-sm font-semibold text-[#12345b]">
                            Profile Image
                          </label>

                          <div className="rounded-2xl border border-dashed border-[#cbdbe5] bg-[#f8fbfd] p-5">
                            <input
                              type="file"
                              name="profileImage"
                              accept="image/*"
                              onChange={handleProfileImageChange}
                              className="block w-full text-sm text-[#526b86] file:mr-4 file:rounded-xl file:border-0 file:bg-[#16845f] file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-[#11704f]"
                            />

                            <p className="mt-2 text-xs text-[#526b86]">
                              Upload a clear profile photo. Image upload will be
                              connected to the backend later.
                            </p>

                            {profileImage && (
                              <p className="mt-3 text-xs font-medium text-[#16845f]">
                                Selected: {profileImage.name}
                              </p>
                            )}
                          </div>
                        </div>

                      </div>
                    </section>

                    {/* ================= ADDRESS ================= */}
                    <section className="mt-10 border-t border-[#e6edf1] pt-10">
                      <h3 className="text-xl font-bold text-[#12345b]">
                        Address
                      </h3>

                      <div className="mt-5 grid gap-5 md:grid-cols-2">

                        {/* House / Flat */}
                        <div>
                          <label className="mb-2 block text-sm font-semibold text-[#12345b]">
                            House / Flat
                          </label>

                          <input
                            type="text"
                            name="houseFlat"
                            value={customerForm.houseFlat}
                            onChange={handleCustomerChange}
                            placeholder="House / Flat number"
                            className="w-full rounded-xl border border-[#dce7ef] bg-[#f8fbfd] px-4 py-3 text-[#12345b] outline-none transition focus:border-[#16845f] focus:ring-2 focus:ring-[#16845f]/10"
                          />
                        </div>

                        {/* Area */}
                        <div>
                          <label className="mb-2 block text-sm font-semibold text-[#12345b]">
                            Area <span className="text-[#e67e22]">*</span>
                          </label>

                          <input
                            type="text"
                            name="area"
                            value={customerForm.area}
                            onChange={handleCustomerChange}
                            required
                            placeholder="Enter your area"
                            className="w-full rounded-xl border border-[#dce7ef] bg-[#f8fbfd] px-4 py-3 text-[#12345b] outline-none transition focus:border-[#16845f] focus:ring-2 focus:ring-[#16845f]/10"
                          />
                        </div>

                        {/* City */}
                        <div>
                          <label className="mb-2 block text-sm font-semibold text-[#12345b]">
                            City <span className="text-[#e67e22]">*</span>
                          </label>

                          <input
                            type="text"
                            name="city"
                            value={customerForm.city}
                            onChange={handleCustomerChange}
                            required
                            placeholder="Enter your city"
                            className="w-full rounded-xl border border-[#dce7ef] bg-[#f8fbfd] px-4 py-3 text-[#12345b] outline-none transition focus:border-[#16845f] focus:ring-2 focus:ring-[#16845f]/10"
                          />
                        </div>

                        {/* State */}
                        <div>
                          <label className="mb-2 block text-sm font-semibold text-[#12345b]">
                            State <span className="text-[#e67e22]">*</span>
                          </label>

                          <input
                            type="text"
                            name="state"
                            value={customerForm.state}
                            onChange={handleCustomerChange}
                            required
                            placeholder="Enter your state"
                            className="w-full rounded-xl border border-[#dce7ef] bg-[#f8fbfd] px-4 py-3 text-[#12345b] outline-none transition focus:border-[#16845f] focus:ring-2 focus:ring-[#16845f]/10"
                          />
                        </div>

                        {/* Pincode */}
                        <div className="md:col-span-2">
                          <label className="mb-2 block text-sm font-semibold text-[#12345b]">
                            Pincode <span className="text-[#e67e22]">*</span>
                          </label>

                          <input
                            type="text"
                            name="pincode"
                            value={customerForm.pincode}
                            onChange={handleCustomerChange}
                            required
                            inputMode="numeric"
                            placeholder="Enter your pincode"
                            className="w-full rounded-xl border border-[#dce7ef] bg-[#f8fbfd] px-4 py-3 text-[#12345b] outline-none transition focus:border-[#16845f] focus:ring-2 focus:ring-[#16845f]/10"
                          />
                        </div>

                      </div>
                    </section>

                    {/* ================= CURRENT LOCATION ================= */}
                    <section className="mt-10 border-t border-[#e6edf1] pt-10">
                      <h3 className="text-xl font-bold text-[#12345b]">
                        Current Location
                      </h3>

                      <p className="mt-2 text-sm leading-6 text-[#526b86]">
                        Allow Sahayog to detect your current location for
                        location-based services.
                      </p>

                      <button
                        type="button"
                        onClick={handleUseLocation}
                        className="mt-5 flex w-full items-center justify-center gap-3 rounded-2xl border border-[#16845f]/25 bg-[#16845f]/5 px-5 py-4 font-semibold text-[#16845f] transition duration-300 hover:-translate-y-1 hover:bg-[#16845f] hover:text-white"
                      >
                        <MapPin size={20} />
                        Use My Location
                      </button>

                      {locationStatus && (
                        <div className="mt-4 rounded-xl bg-[#f8fbfd] px-4 py-3 text-sm text-[#526b86]">
                          {locationStatus}
                        </div>
                      )}

                      {location && (
                        <div className="mt-3 rounded-xl border border-[#16845f]/15 bg-[#16845f]/5 px-4 py-3 text-sm text-[#526b86]">
                          Location detected successfully. Your precise location is kept for Sahayog's location-based services and is not displayed here.
                        </div>
                      )}
                    </section>

                    {/* ================= SUBMIT ================= */}
                    <div className="mt-10 border-t border-[#e6edf1] pt-8">
                      <button
                        type="submit"
                        className="w-full rounded-2xl bg-[#e67e22] px-6 py-4 font-semibold text-white shadow-lg shadow-[#e67e22]/20 transition duration-300 hover:-translate-y-1 hover:bg-[#d96f16]"
                      >
                        Create Customer Account
                      </button>

                      <p className="mt-4 text-center text-xs leading-5 text-[#526b86]">
                        By continuing, the entered information will be prepared
                        for submission to the Sahayog backend.
                      </p>
                    </div>

                  </form>
                </div>
              </div>
            )}

          {/* ================= CUSTOMER LOGIN ================= */}
          {selectedRole === "customer" && authMode === "login" && (
            <div className="mx-auto max-w-2xl">

              {/* Back to Login/Register choice */}
              <button
                type="button"
                onClick={handleBackToAuthChoice}
                className="mb-8 flex items-center gap-2 text-sm font-medium text-[#526b86] transition hover:text-[#16845f]"
              >
                <ArrowLeft size={17} />
                Back to Login / Register
              </button>

              <div className="rounded-3xl border border-[#dce7ef] bg-white p-8 shadow-xl shadow-[#12345b]/5 sm:p-12">

                {/* Login heading */}
                <div className="text-center">
                  <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#16845f]/10 text-[#16845f]">
                    <LogIn size={30} />
                  </div>

                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#16845f]">
                    Customer Login
                  </p>

                  <h2 className="mt-3 text-3xl font-bold text-[#12345b] sm:text-4xl">
                    Welcome back to Sahayog
                  </h2>

                  <p className="mx-auto mt-4 max-w-lg leading-7 text-[#526b86]">
                    Login to find trusted skilled workers and book services
                    for your household or community.
                  </p>
                </div>

                {/* ================= LOGIN FORM ================= */}
                <form
                  onSubmit={handleCustomerLoginSubmit}
                  className="mt-10"
                >
                  {/* Email */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#12345b]">
                      Email <span className="text-[#e67e22]">*</span>
                    </label>

                    <input
                      type="email"
                      name="email"
                      value={customerLogin.email}
                      onChange={handleCustomerLoginChange}
                      required
                      autoComplete="email"
                      placeholder="Enter your email"
                      className="w-full rounded-xl border border-[#dce7ef] bg-[#f8fbfd] px-4 py-3 text-[#12345b] outline-none transition focus:border-[#16845f] focus:ring-2 focus:ring-[#16845f]/10"
                    />
                  </div>

                  {/* Password */}
                  <div className="mt-5">
                    <label className="mb-2 block text-sm font-semibold text-[#12345b]">
                      Password <span className="text-[#e67e22]">*</span>
                    </label>

                    <input
                      type="password"
                      name="password"
                      value={customerLogin.password}
                      onChange={handleCustomerLoginChange}
                      required
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      className="w-full rounded-xl border border-[#dce7ef] bg-[#f8fbfd] px-4 py-3 text-[#12345b] outline-none transition focus:border-[#16845f] focus:ring-2 focus:ring-[#16845f]/10"
                    />
                  </div>

                  {/* Login button */}
                  <button
                    type="submit"
                    className="mt-8 flex w-full items-center justify-center gap-3 rounded-2xl bg-[#e67e22] px-6 py-4 font-semibold text-white shadow-lg shadow-[#e67e22]/20 transition duration-300 hover:-translate-y-1 hover:bg-[#d96f16]"
                  >
                    <LogIn size={19} />
                    Login as Customer
                  </button>

                  <p className="mt-4 text-center text-xs leading-5 text-[#526b86]">
                    Authentication will be connected to the Sahayog backend
                    once the login API is finalized.
                  </p>
                </form>
              </div>
            </div>
          )}

          {/* ================= WORKER / OTHER ROLE LOGIN ================= */}
          {selectedRole &&
            authMode === "login" &&
            selectedRole !== "customer" && (
              <div className="mx-auto max-w-2xl">
                <button
                  type="button"
                  onClick={handleBackToAuthChoice}
                  className="mb-8 flex items-center gap-2 text-sm font-medium text-[#526b86] transition hover:text-[#16845f]"
                >
                  <ArrowLeft size={17} />
                  Back to Login / Register
                </button>

                {selectedRole === "worker" ? (
                  <form
                    onSubmit={handleWorkerLoginSubmit}
                    className="rounded-3xl border border-[#dce7ef] bg-white p-8 shadow-xl shadow-[#12345b]/5 sm:p-12"
                  >
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#e67e22]">
                      Worker
                    </p>

                    <h2 className="mt-3 text-3xl font-bold text-[#12345b]">
                      Welcome back
                    </h2>

                    <p className="mt-3 leading-7 text-[#526b86]">
                      Login to manage your services, profile and opportunities
                      on Sahayog.
                    </p>

                    <div className="mt-8 space-y-4">
                      <input
                        name="email"
                        type="email"
                        value={workerLogin.email}
                        onChange={handleWorkerLoginChange}
                        placeholder="Email *"
                        className="auth-input"
                      />

                      <input
                        name="password"
                        type="password"
                        value={workerLogin.password}
                        onChange={handleWorkerLoginChange}
                        placeholder="Password *"
                        className="auth-input"
                      />
                    </div>

                    <button
                      type="submit"
                      className="mt-8 flex w-full items-center justify-center gap-3 rounded-2xl bg-[#e67e22] px-6 py-4 font-semibold text-white shadow-lg shadow-[#e67e22]/20 transition duration-300 hover:-translate-y-1 hover:bg-[#d96f16]"
                    >
                      <LogIn size={19} />
                      Login as Worker
                    </button>

                    <p className="mt-4 text-center text-xs leading-5 text-[#526b86]">
                      Authentication will be connected to the Sahayog backend
                      once the worker login API is finalized.
                    </p>
                  </form>
                ) : (
                  <form onSubmit={handleCooperativeLoginSubmit} className="rounded-3xl border border-[#dce7ef] bg-white p-8 shadow-xl shadow-[#12345b]/5 sm:p-12">
                    <div className="text-center">
                      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#12345b]">Cooperative Owner</p>
                      <h2 className="mt-3 text-3xl font-bold text-[#12345b]">Welcome back</h2>
                      <p className="mt-3 leading-7 text-[#526b86]">Manage your cooperative, join requests and workers.</p>
                    </div>
                    <div className="mt-8 space-y-4">
                      <input name="email" type="email" value={cooperativeLogin.email} onChange={handleCooperativeLoginChange} placeholder="Admin email *" required className="auth-input" />
                      <input name="password" type="password" value={cooperativeLogin.password} onChange={handleCooperativeLoginChange} placeholder="Password *" required className="auth-input" />
                    </div>
                    <button type="submit" className="mt-8 flex w-full items-center justify-center gap-3 rounded-2xl bg-[#12345b] px-6 py-4 font-semibold text-white shadow-lg transition hover:-translate-y-1 hover:bg-[#0d2948]">
                      <LogIn size={19} /> Login as Cooperative Owner
                    </button>
                  </form>
                )}
              </div>
            )}

          {/* ================= WORKER / OTHER ROLE REGISTRATION ================= */}
          {selectedRole &&
            authMode === "register" &&
            selectedRole !== "customer" && (
              <div className="mx-auto max-w-3xl">
                <button
                  type="button"
                  onClick={handleBackToAuthChoice}
                  className="mb-8 flex items-center gap-2 text-sm font-medium text-[#526b86] transition hover:text-[#16845f]"
                >
                  <ArrowLeft size={17} />
                  Back to Login / Register
                </button>

                {selectedRole === "worker" ? (
                  <form
                    onSubmit={handleWorkerRegister}
                    className="rounded-3xl border border-[#dce7ef] bg-white p-8 shadow-xl shadow-[#12345b]/5 sm:p-10"
                  >
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#e67e22]">
                      Worker Registration
                    </p>

                    <h2 className="mt-3 text-3xl font-bold text-[#12345b]">
                      Create your worker profile
                    </h2>

                    <p className="mt-3 leading-7 text-[#526b86]">
                      Tell customers what you do, where you work and what
                      services you can provide.
                    </p>

                    {/* Personal Details */}
                    <div className="mt-8">
                      <h3 className="text-lg font-bold text-[#12345b]">
                        Personal Details
                      </h3>

                      <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        <input
                          name="fullName"
                          value={workerForm.fullName}
                          onChange={handleWorkerChange}
                          placeholder="Full Name *"
                          className="auth-input"
                        />

                        <input
                          name="email"
                          type="email"
                          value={workerForm.email}
                          onChange={handleWorkerChange}
                          placeholder="Email *"
                          className="auth-input"
                        />

                        <input
                          name="phoneNumber"
                          type="tel"
                          value={workerForm.phoneNumber}
                          onChange={handleWorkerChange}
                          placeholder="Phone Number *"
                          className="auth-input"
                        />

                        <input
                          name="password"
                          type="password"
                          value={workerForm.password}
                          onChange={handleWorkerChange}
                          placeholder="Password *"
                          className="auth-input"
                        />

                        <input
                          name="confirmPassword"
                          type="password"
                          value={workerForm.confirmPassword}
                          onChange={handleWorkerChange}
                          placeholder="Confirm Password *"
                          className="auth-input"
                        />
                      </div>

                      {/* Profile Image */}
                      <label className="mt-4 block rounded-2xl border border-dashed border-[#c9d9e6] bg-[#f8fbfd] p-5">
                        <span className="text-sm font-semibold text-[#12345b]">
                          Profile Image
                        </span>

                        <span className="mt-1 block text-xs text-[#526b86]">
                          Upload a clear profile photo.
                        </span>

                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleWorkerProfileImage}
                          className="mt-3 block w-full text-sm text-[#526b86]"
                        />

                        {workerForm.profileImage && (
                          <p className="mt-2 text-xs font-medium text-[#16845f]">
                            Selected: {workerForm.profileImage.name}
                          </p>
                        )}
                      </label>
                    </div>

                    {/* Address */}
                    <div className="mt-8">
                      <h3 className="text-lg font-bold text-[#12345b]">
                        Address
                      </h3>

                      <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        <input
                          name="houseFlat"
                          value={workerForm.houseFlat}
                          onChange={handleWorkerChange}
                          placeholder="House / Flat"
                          className="auth-input"
                        />

                        <input
                          name="area"
                          value={workerForm.area}
                          onChange={handleWorkerChange}
                          placeholder="Area *"
                          className="auth-input"
                        />

                        <input
                          name="city"
                          value={workerForm.city}
                          onChange={handleWorkerChange}
                          placeholder="City *"
                          className="auth-input"
                        />

                        <input
                          name="state"
                          value={workerForm.state}
                          onChange={handleWorkerChange}
                          placeholder="State *"
                          className="auth-input"
                        />

                        <input
                          name="pincode"
                          value={workerForm.pincode}
                          onChange={handleWorkerChange}
                          placeholder="Pincode *"
                          className="auth-input"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={handleWorkerLocation}
                        className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-[#b9dcca] bg-[#effaf4] px-5 py-3.5 text-sm font-bold text-[#16845f] transition hover:bg-[#e5f6ed]"
                      >
                        <MapPin size={18} />
                        Use Current Location
                      </button>

                      {workerLocationStatus && (
                        <p className="mt-3 text-center text-xs font-medium text-[#526b86]">
                          {workerLocationStatus}
                        </p>
                      )}

                      {workerForm.latitude !== null &&
                        workerForm.longitude !== null && (
                          <div className="mt-3 rounded-xl border border-[#16845f]/15 bg-[#16845f]/5 px-4 py-3 text-xs text-[#526b86]">
                            Location detected successfully. Your precise location is kept for matching and is not displayed here.
                          </div>
                        )}
                    </div>

                    {/* Services */}
                    <div className="mt-8">
                      <h3 className="text-lg font-bold text-[#12345b]">
                        Select Your Services
                      </h3>

                      <p className="mt-1 text-sm text-[#526b86]">
                        Select the services you provide.
                      </p>

                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        {[
                          "Plumbing",
                          "Electrical",
                          "Carpentry",
                          "Painting",
                          "Cleaning",
                        ].map((service) => {
                          const selected = Boolean(workerServices[service]);

                          return (
                            <button
                              key={service}
                              type="button"
                              onClick={() => toggleWorkerService(service)}
                              className={`flex items-center justify-between rounded-2xl border px-4 py-3.5 text-sm font-semibold transition ${
                                selected
                                  ? "border-[#16845f] bg-[#effaf4] text-[#16845f]"
                                  : "border-[#d7e3ec] bg-white text-[#526b86] hover:border-[#b9dcca]"
                              }`}
                            >
                              <span>{service}</span>
                              <span
                                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                                  selected
                                    ? "bg-[#16845f] text-white"
                                    : "border border-[#cbd9e4]"
                                }`}
                              >
                                {selected ? "✓" : ""}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Experience + Skill Level for each selected service */}
                      <div className="mt-4 space-y-4">
                        {Object.entries(workerServices).map(
                          ([service, details]) => (
                            <div
                              key={service}
                              className="rounded-2xl border border-[#dce8ef] bg-[#f8fbfd] p-5"
                            >
                              <div className="mb-4 flex items-center justify-between">
                                <h4 className="font-bold text-[#12345b]">
                                  {service}
                                </h4>

                                <button
                                  type="button"
                                  onClick={() =>
                                    toggleWorkerService(service)
                                  }
                                  className="text-xs font-semibold text-[#e67e22] hover:underline"
                                >
                                  Remove
                                </button>
                              </div>

                              <div className="grid gap-4 sm:grid-cols-2">
                                <label>
                                  <span className="mb-2 block text-xs font-semibold text-[#526b86]">
                                    Experience (years)
                                  </span>

                                  <input
                                    type="number"
                                    min="0"
                                    value={details.experience}
                                    onChange={(event) =>
                                      updateWorkerService(
                                        service,
                                        "experience",
                                        event.target.value
                                      )
                                    }
                                    placeholder="e.g. 5"
                                    className="auth-input"
                                  />
                                </label>

                                <label>
                                  <span className="mb-2 block text-xs font-semibold text-[#526b86]">
                                    Skill Level
                                  </span>

                                  <select
                                    value={details.skillLevel}
                                    onChange={(event) =>
                                      updateWorkerService(
                                        service,
                                        "skillLevel",
                                        event.target.value
                                      )
                                    }
                                    className="auth-input"
                                  >
                                    <option value="BEGINNER">
                                      Beginner
                                    </option>
                                    <option value="INTERMEDIATE">
                                      Intermediate
                                    </option>
                                    <option value="EXPERT">
                                      Expert
                                    </option>
                                  </select>
                                </label>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="mt-8 flex w-full items-center justify-center gap-3 rounded-2xl bg-[#e67e22] px-6 py-4 font-semibold text-white shadow-lg shadow-[#e67e22]/20 transition duration-300 hover:-translate-y-1 hover:bg-[#d96f16]"
                    >
                      <UserPlus size={19} />
                      Register as Worker
                    </button>

                    {/* TODO BACKEND:
                        Connect this form to the worker registration API.
                        Map each selected service to serviceId,
                        experienceYears and skillLevel as required by
                        WorkerProfile. */}
                  </form>
                ) : (
                  <form onSubmit={handleCooperativeRegister} className="rounded-3xl border border-[#dce7ef] bg-white p-8 shadow-xl shadow-[#12345b]/5 sm:p-10">
                    <div className="text-center">
                      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#12345b]">Cooperative Owner</p>
                      <h2 className="mt-3 text-3xl font-bold text-[#12345b]">Create your cooperative</h2>
                      <p className="mt-3 leading-7 text-[#526b86]">Register the cooperative and its administrator in one secure flow.</p>
                    </div>

                    <div className="mt-8 grid gap-4 sm:grid-cols-2">
                      <input name="cooperativeName" value={cooperativeForm.cooperativeName} onChange={handleCooperativeChange} placeholder="Cooperative name *" required className="auth-input" />
                      <input name="registrationNumber" value={cooperativeForm.registrationNumber} onChange={handleCooperativeChange} placeholder="Registration number *" required className="auth-input" />
                      <input name="cooperativeEmail" type="email" value={cooperativeForm.cooperativeEmail} onChange={handleCooperativeChange} placeholder="Cooperative email *" required className="auth-input" />
                      <input name="cooperativePhone" value={cooperativeForm.cooperativePhone} onChange={handleCooperativeChange} placeholder="Cooperative phone *" required className="auth-input" />
                    </div>
                    <textarea name="description" value={cooperativeForm.description} onChange={handleCooperativeChange} placeholder="Cooperative description" rows="3" className="auth-input mt-4" />

                    <h3 className="mt-8 text-lg font-bold text-[#12345b]">Administrator</h3>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <input name="adminFullName" value={cooperativeForm.adminFullName} onChange={handleCooperativeChange} placeholder="Admin full name *" required className="auth-input" />
                      <input name="adminEmail" type="email" value={cooperativeForm.adminEmail} onChange={handleCooperativeChange} placeholder="Admin email *" required className="auth-input" />
                      <input name="adminPhone" value={cooperativeForm.adminPhone} onChange={handleCooperativeChange} placeholder="Admin phone *" required className="auth-input" />
                      <input name="password" type="password" value={cooperativeForm.password} onChange={handleCooperativeChange} placeholder="Password *" required className="auth-input" />
                      <input name="confirmPassword" type="password" value={cooperativeForm.confirmPassword} onChange={handleCooperativeChange} placeholder="Confirm password *" required className="auth-input" />
                    </div>

                    <h3 className="mt-8 text-lg font-bold text-[#12345b]">Cooperative address</h3>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <input name="house" value={cooperativeForm.house} onChange={handleCooperativeChange} placeholder="House / building" className="auth-input" />
                      <input name="area" value={cooperativeForm.area} onChange={handleCooperativeChange} placeholder="Area *" required className="auth-input" />
                      <input name="city" value={cooperativeForm.city} onChange={handleCooperativeChange} placeholder="City *" required className="auth-input" />
                      <input name="state" value={cooperativeForm.state} onChange={handleCooperativeChange} placeholder="State *" required className="auth-input" />
                      <input name="pincode" value={cooperativeForm.pincode} onChange={handleCooperativeChange} placeholder="Pincode *" required className="auth-input" />
                    </div>
                    <button type="button" onClick={handleCooperativeLocation} className="mt-4 inline-flex items-center gap-2 rounded-xl border border-[#16845f]/30 px-4 py-3 text-sm font-bold text-[#16845f] hover:bg-[#16845f]/5"><MapPin size={17} /> Use Current Location</button>
                    {cooperativeLocationStatus && <p className="mt-3 text-sm text-[#526b86]">{cooperativeLocationStatus}</p>}
                    <button type="submit" className="mt-8 flex w-full items-center justify-center gap-3 rounded-2xl bg-[#12345b] px-6 py-4 font-semibold text-white shadow-lg transition hover:-translate-y-1 hover:bg-[#0d2948]"><UserPlus size={19} /> Register Cooperative</button>
                  </form>
                )}
              </div>
            )}



        </div>
      </main>
    </div>
  );
}

export default AuthPage;
