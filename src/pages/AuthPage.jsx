import { useState } from "react";
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

function AuthPage({ onBackHome }) {
  // ------------------------------------------------------------
  // AUTHENTICATION UI STATE
  // ------------------------------------------------------------
  // selectedRole = Customer / Worker / Cooperative Owner
  // authMode     = Login / Register
  //
  // Backend integration will be added later. For now these
  // states only control the frontend screens.
  // ------------------------------------------------------------
  const [selectedRole, setSelectedRole] = useState(null);
  const [authMode, setAuthMode] = useState(null);

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

  const handleWorkerRegister = (event) => {
    event.preventDefault();

    const requiredFields = [
      workerForm.fullName,
      workerForm.email,
      workerForm.phoneNumber,
      workerForm.password,
      workerForm.confirmPassword,
      workerForm.area,
      workerForm.city,
      workerForm.state,
      workerForm.pincode,
    ];

    if (requiredFields.some((field) => !field.trim())) {
      alert("Please fill all required fields.");
      return;
    }

    if (workerForm.password !== workerForm.confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    if (Object.keys(workerServices).length === 0) {
      alert("Please select at least one service.");
      return;
    }

    const incompleteService = Object.entries(workerServices).find(
      ([, details]) => details.experience === ""
    );

    if (incompleteService) {
      alert("Please enter experience for every selected service.");
      return;
    }

    // Frontend-only submit.
    // TODO BACKEND:
    // Send workerForm + workerServices to worker registration API.
    console.log("Worker registration data:", {
      ...workerForm,
      services: workerServices,
    });

    alert("Worker registration form submitted successfully!");
  };

  const handleWorkerLoginSubmit = (event) => {
    event.preventDefault();

    if (!workerLogin.email || !workerLogin.password) {
      alert("Please enter your email and password.");
      return;
    }

    // Frontend-only login.
    // TODO BACKEND: Send email/password to worker login endpoint.
    console.log("Worker login data:", workerLogin);

    alert("Worker login submitted successfully!");
  };

  const handleBackToRoles = () => {
    setAuthMode(null);
    setSelectedRole(null);
  };

  // Return from a Login/Register form to the Login/Register choice.
  const handleBackToAuthChoice = () => {
    setAuthMode(null);
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
  const handleCustomerLoginSubmit = (event) => {
    event.preventDefault();

    console.log("Customer login data:", customerLogin);

    alert("Customer login form is ready for backend integration.");
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
  const handleCustomerSubmit = (event) => {
    event.preventDefault();

    if (customerForm.password !== customerForm.confirmPassword) {
      alert("Password and Confirm Password must match.");
      return;
    }

    console.log("Customer registration data:", {
      ...customerForm,
      profileImage,
      currentLocation: location,
    });

    alert("Customer registration form is ready for backend integration.");
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
                    onClick={() => setAuthMode("login")}
                    className="group flex items-center justify-center gap-3 rounded-2xl border border-[#12345b]/15 bg-white px-6 py-4 font-semibold text-[#12345b] shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#12345b]/30 hover:bg-[#12345b] hover:text-white"
                  >
                    <LogIn size={19} />
                    Login
                  </button>

                  {/* Register */}
                  <button
                    type="button"
                    onClick={() => setAuthMode("register")}
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
                        <div className="mt-3 rounded-xl border border-[#16845f]/15 bg-[#16845f]/5 px-4 py-3 text-xs text-[#526b86]">
                          Coordinates detected:{" "}
                          {location.latitude.toFixed(6)},{" "}
                          {location.longitude.toFixed(6)}
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
                  <div className="rounded-3xl border border-[#dce7ef] bg-white p-8 text-center shadow-xl shadow-[#12345b]/5 sm:p-12">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#12345b]">
                      Cooperative Owner
                    </p>
                    <h2 className="mt-3 text-3xl font-bold text-[#12345b]">
                      Login
                    </h2>
                    <p className="mx-auto mt-4 max-w-lg leading-7 text-[#526b86]">
                      Cooperative Owner login will be built after the exact
                      authentication requirements are provided.
                    </p>
                  </div>
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
                          <div className="mt-3 rounded-xl bg-[#f8fbfd] px-4 py-3 text-xs text-[#526b86]">
                            Location detected:{" "}
                            {workerForm.latitude.toFixed(5)},{" "}
                            {workerForm.longitude.toFixed(5)}
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
                  <div className="rounded-3xl border border-[#dce7ef] bg-white p-8 text-center shadow-xl shadow-[#12345b]/5 sm:p-12">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#12345b]">
                      Cooperative Owner
                    </p>

                    <h2 className="mt-3 text-3xl font-bold text-[#12345b]">
                      Registration
                    </h2>

                    <p className="mx-auto mt-4 max-w-lg leading-7 text-[#526b86]">
                      Cooperative Owner registration will be built after the
                      exact fields are provided by the backend team.
                    </p>
                  </div>
                )}
              </div>
            )}



        </div>
      </main>
    </div>
  );
}

export default AuthPage;
