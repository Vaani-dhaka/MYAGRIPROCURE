import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ShieldCheck,
  Scale,
  Clock,
  Wifi,
  WifiOff,
  RefreshCw,
  FileText,
  Search,
  CheckCircle2,
  PhoneCall,
  ClipboardCheck,
} from "lucide-react";

import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import {
  Booking,
  ProcurementRecord,
  Centre,
} from "../types/index";
import { CentrePicker } from "../components/CentrePicker";

/* =========================================================
   HELPERS
   ========================================================= */

const todayString = (): string => {
  return new Date().toISOString().split("T")[0];
};

const getToken = (): string => {
  return localStorage.getItem("paradox_token") || "";
};

/* =========================================================
   COMPONENT
   ========================================================= */

export const StaffPortalView: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();

  /* =======================================================
     BASIC STATE
     ======================================================= */

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [procurementHistory, setProcurementHistory] = useState<
    ProcurementRecord[]
  >([]);

  const [allCentres, setAllCentres] = useState<Centre[]>([]);

  const [selectedCentreId, setSelectedCentreId] = useState(
    user?.assignedCentreId || ""
  );

  const [loading, setLoading] = useState(true);

  const [isOfflineMode, setIsOfflineMode] = useState(
    typeof navigator !== "undefined" ? !navigator.onLine : false
  );

  const [syncing, setSyncing] = useState(false);

  const [notice, setNotice] = useState<string | null>(null);

  const [queueSearch, setQueueSearch] = useState("");

  const [activeBooking, setActiveBooking] =
    useState<Booking | null>(null);

  const [weightKg, setWeightKg] = useState(0);

  const [grade, setGrade] = useState("Grade A (FAQ)");

  const [ratePerQuintal, setRatePerQuintal] =
    useState(2275);

  const [notes, setNotes] = useState("");

  /* =======================================================
     OFFLINE STORAGE
     ======================================================= */

  const storageKey = useCallback(
    (name: string): string => {
      return `paradox_staff_${
        user?.id || user?.staffId || "unknown"
      }_${name}`;
    },
    [user?.id, user?.staffId]
  );

  const readArray = <T,>(key: string): T[] => {
    try {
      const value = JSON.parse(
        localStorage.getItem(key) || "[]"
      );

      return Array.isArray(value) ? value : [];
    } catch {
      return [];
    }
  };

  const [offlineRecords, setOfflineRecords] =
    useState<any[]>(() =>
      readArray<any>(storageKey("offline_records"))
    );

  const [pendingStatusUpdates, setPendingStatusUpdates] =
    useState<
      {
        bookingId: string;
        status: string;
      }[]
    >(() =>
      readArray<{
        bookingId: string;
        status: string;
      }>(storageKey("offline_status_updates"))
    );

  /* =======================================================
     CACHE SERVER DATA
     ======================================================= */

  const loadCached = useCallback(() => {
    try {
      const cachedBookings = JSON.parse(
        localStorage.getItem(
          storageKey("bookings")
        ) || "[]"
      );

      const cachedProcurement = JSON.parse(
        localStorage.getItem(
          storageKey("procurement")
        ) || "[]"
      );

      const cachedCentres = JSON.parse(
        localStorage.getItem(
          storageKey("centres")
        ) || "[]"
      );

      if (Array.isArray(cachedBookings)) {
        setBookings(cachedBookings);
      }

      if (Array.isArray(cachedProcurement)) {
        setProcurementHistory(cachedProcurement);
      }

      if (Array.isArray(cachedCentres)) {
        setAllCentres(cachedCentres);
      }
    } catch {
      console.warn("Unable to read offline cache.");
    }
  }, [storageKey]);

  /* =======================================================
     LOAD STAFF DATA
     ======================================================= */

  const fetchStaffData = useCallback(async () => {
    const token = getToken();

    try {
      const date = todayString();

      const bookingUrl =
        `/api/bookings?date=${encodeURIComponent(date)}` +
        (selectedCentreId
          ? `&centreId=${encodeURIComponent(
              selectedCentreId
            )}`
          : "");

      const [bookingResponse, procurementResponse, centreResponse] =
        await Promise.all([
          fetch(bookingUrl, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),

          fetch("/api/procurement", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),

          fetch("/api/staff/centres", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

      if (
        !bookingResponse.ok ||
        !procurementResponse.ok ||
        !centreResponse.ok
      ) {
        throw new Error(
          "Staff services are temporarily unavailable."
        );
      }

      const nextBookings: Booking[] =
        await bookingResponse.json();

      const nextProcurement: ProcurementRecord[] =
        await procurementResponse.json();

      const centreData =
        await centreResponse.json();

      const centreList: Centre[] = Array.isArray(
        centreData?.centres
      )
        ? centreData.centres
        : [];

      setBookings(
        Array.isArray(nextBookings)
          ? nextBookings
          : []
      );

      setProcurementHistory(
        Array.isArray(nextProcurement)
          ? nextProcurement
          : []
      );

      setAllCentres(centreList);

      const assignedCentre =
        centreData?.assignedCentreId ||
        user?.assignedCentreId ||
        centreList[0]?.id ||
        "";

      setSelectedCentreId((current) => {
        if (
          current &&
          centreList.some(
            (centre) => centre.id === current
          )
        ) {
          return current;
        }

        return assignedCentre;
      });

      /* Save everything locally for offline use */

      localStorage.setItem(
        storageKey("bookings"),
        JSON.stringify(
          Array.isArray(nextBookings)
            ? nextBookings
            : []
        )
      );

      localStorage.setItem(
        storageKey("procurement"),
        JSON.stringify(
          Array.isArray(nextProcurement)
            ? nextProcurement
            : []
        )
      );

      localStorage.setItem(
        storageKey("centres"),
        JSON.stringify(centreList)
      );

      setIsOfflineMode(false);
    } catch (error) {
      console.warn(
        "Staff data could not be loaded.",
        error
      );

      loadCached();

      setIsOfflineMode(true);

      setNotice(
        "Server unavailable. Staff desk is using saved local data."
      );
    } finally {
      setLoading(false);
    }
  }, [
    selectedCentreId,
    storageKey,
    loadCached,
    user?.assignedCentreId,
  ]);

  useEffect(() => {
    fetchStaffData();
  }, [fetchStaffData]);

  /* =======================================================
     OFFLINE STATUS UPDATE
     ======================================================= */

  const saveLocalStatus = (
    bookingId: string,
    status: string
  ) => {
    setBookings((current) =>
      current.map((booking) =>
        booking.id === bookingId
          ? {
              ...booking,
              status: status as Booking["status"],
            }
          : booking
      )
    );

    setPendingStatusUpdates((current) => {
      const next = [
        ...current.filter(
          (item) => item.bookingId !== bookingId
        ),
        {
          bookingId,
          status,
        },
      ];

      localStorage.setItem(
        storageKey("offline_status_updates"),
        JSON.stringify(next)
      );

      return next;
    });

    setIsOfflineMode(true);

    setNotice(
      `Token status saved locally as ${status}. It will sync automatically when internet returns.`
    );
  };

  /* =======================================================
     UPDATE BOOKING STATUS
     ======================================================= */

  const updateStatus = async (
    booking: Booking,
    status: Booking["status"]
  ) => {
    const allowedStatuses = [
      "CONFIRMED",
      "WAITING",
      "IN_PROGRESS",
      "COMPLETED",
      "CANCELLED",
    ];

    if (!allowedStatuses.includes(status)) {
      return;
    }

    /*
      If offline, never try server request.
      Save directly to local storage.
    */

    if (
      typeof navigator !== "undefined" &&
      !navigator.onLine
    ) {
      saveLocalStatus(booking.id, status);
      return;
    }

    if (isOfflineMode) {
      saveLocalStatus(booking.id, status);
      return;
    }

    try {
      const response = await fetch(
        `/api/bookings/${booking.id}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify({
            status,
          }),
        }
      );

      const data = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Unable to update token status."
        );
      }

      setBookings((current) =>
        current.map((item) =>
          item.id === booking.id
            ? data
            : item
        )
      );

      setNotice(
        `Token ${booking.bookingToken} updated to ${status}.`
      );
    } catch (error: any) {
      /*
        If server fails, automatically save locally.
      */

      saveLocalStatus(
        booking.id,
        status
      );

      setNotice(
        error?.message
          ? `${error.message} Saved locally for sync.`
          : "Server unavailable. Update saved locally."
      );
    }
  };

  /* =======================================================
     SYNC OFFLINE DATA
     ======================================================= */

  const syncOffline = useCallback(async () => {
    if (syncing) return;

    if (
      offlineRecords.length === 0 &&
      pendingStatusUpdates.length === 0
    ) {
      return;
    }

    if (
      typeof navigator !== "undefined" &&
      !navigator.onLine
    ) {
      setNotice(
        "You are still offline. Local work is safe."
      );

      return;
    }

    setSyncing(true);

    try {
      const response = await fetch(
        "/api/offline/sync",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify({
            records: offlineRecords,
            statusUpdates: pendingStatusUpdates,
          }),
        }
      );

      const data = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data?.error || "Offline sync failed."
        );
      }

      setOfflineRecords([]);

      setPendingStatusUpdates([]);

      localStorage.removeItem(
        storageKey("offline_records")
      );

      localStorage.removeItem(
        storageKey("offline_status_updates")
      );

      setIsOfflineMode(false);

      setNotice(
        `Offline work synced successfully. ${
          data?.syncedCount || 0
        } procurement records and ${
          data?.statusSyncedCount || 0
        } queue updates synced.`
      );

      await fetchStaffData();
    } catch (error: any) {
      setIsOfflineMode(true);

      setNotice(
        `Sync paused. Your local work is safe. ${
          error?.message || ""
        }`
      );
    } finally {
      setSyncing(false);
    }
  }, [
    syncing,
    offlineRecords,
    pendingStatusUpdates,
    storageKey,
    fetchStaffData,
  ]);

  /* =======================================================
     ONLINE / OFFLINE DETECTION
     ======================================================= */

  useEffect(() => {
    const handleOnline = () => {
      setIsOfflineMode(false);

      void syncOffline();

      void fetchStaffData();
    };

    const handleOffline = () => {
      setIsOfflineMode(true);

      setNotice(
        "Internet connection lost. Offline Local Sheet is active."
      );
    };

    window.addEventListener(
      "online",
      handleOnline
    );

    window.addEventListener(
      "offline",
      handleOffline
    );

    return () => {
      window.removeEventListener(
        "online",
        handleOnline
      );

      window.removeEventListener(
        "offline",
        handleOffline
      );
    };
  }, [syncOffline, fetchStaffData]);

  /* =======================================================
     CHANGE WORKING CENTRE
     ======================================================= */

  const changeCentre = async (
    centreId: string
  ) => {
    if (!centreId) {
      return;
    }

    if (centreId === selectedCentreId) {
      return;
    }

    /*
      Offline:
      change locally and keep the choice.
    */

    if (
      typeof navigator !== "undefined" &&
      !navigator.onLine
    ) {
      setSelectedCentreId(centreId);

      localStorage.setItem(
        storageKey("selected_centre"),
        centreId
      );

      setIsOfflineMode(true);

      setNotice(
        "Working centre changed locally. It will sync when internet returns."
      );

      return;
    }

    try {
      const response = await fetch(
        "/api/staff/centre",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify({
            centreId,
          }),
        }
      );

      const data = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Unable to change working centre."
        );
      }

      setSelectedCentreId(centreId);

      localStorage.setItem(
        storageKey("selected_centre"),
        centreId
      );

      setNotice(
        `Working centre changed to ${
          data?.state || "selected centre"
        }${
          data?.district
            ? ` — ${data.district}`
            : ""
        }.`
      );

      await fetchStaffData();
    } catch (error: any) {
      /*
        Keep local selection even if server
        is temporarily unavailable.
      */

      setSelectedCentreId(centreId);

      localStorage.setItem(
        storageKey("selected_centre"),
        centreId
      );

      setIsOfflineMode(true);

      setNotice(
        `Working centre saved locally. ${
          error?.message || ""
        }`
      );
    }
  };

  /* =======================================================
     UPDATE OFFLINE PROCUREMENT RECORD
     ======================================================= */

  const updateOfflineRecord = (
    index: number,
    patch: Partial<any>
  ) => {
    setOfflineRecords((current) => {
      const next = current.map(
        (item, itemIndex) =>
          itemIndex === index
            ? {
                ...item,
                ...patch,
              }
            : item
      );

      localStorage.setItem(
        storageKey("offline_records"),
        JSON.stringify(next)
      );

      return next;
    });
  };

  /* =======================================================
     REMOVE OFFLINE RECORD
     ======================================================= */

  const removeOfflineRecord = (
    index: number
  ) => {
    const confirmed = window.confirm(
      "Remove this local offline entry?"
    );

    if (!confirmed) {
      return;
    }

    setOfflineRecords((current) => {
      const next = current.filter(
        (_, itemIndex) =>
          itemIndex !== index
      );

      localStorage.setItem(
        storageKey("offline_records"),
        JSON.stringify(next)
      );

      return next;
    });
  };

  /* =======================================================
     SAVE PROCUREMENT
     ======================================================= */

  const saveProcurement = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    if (!activeBooking) {
      return;
    }

    const payload = {
      bookingId: activeBooking.id,
      bookingToken:
        activeBooking.bookingToken,

      farmerName:
        activeBooking.farmerName,

      farmerPhone:
        activeBooking.farmerPhone,

      cropType:
        activeBooking.cropType,

      weightKg: Number(weightKg),

      grade,

      ratePerQuintal:
        Number(ratePerQuintal),

      notes,

      date: todayString(),

      centreId:
        activeBooking.centreId,

      centreName:
        activeBooking.centreName,

      staffId:
        user?.staffId ||
        user?.id ||
        "",
    };

    try {
      if (
        typeof navigator !== "undefined" &&
        !navigator.onLine
      ) {
        throw new Error(
          "offline"
        );
      }

      if (isOfflineMode) {
        throw new Error(
          "offline"
        );
      }

      const response = await fetch(
        "/api/procurement",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",

            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Unable to save procurement record."
        );
      }

      /*
        Also mark booking completed.
      */

      try {
        await fetch(
          `/api/bookings/${activeBooking.id}/status`,
          {
            method: "PUT",
            headers: {
              "Content-Type":
                "application/json",

              Authorization: `Bearer ${getToken()}`,
            },
            body: JSON.stringify({
              status: "COMPLETED",
            }),
          }
        );
      } catch {
        /*
          Procurement itself was saved.
        */
      }

      setNotice(
        `Token ${activeBooking.bookingToken} completed and procurement record saved.`
      );

      setActiveBooking(null);

      setWeightKg(0);

      setGrade("Grade A (FAQ)");

      setRatePerQuintal(2275);

      setNotes("");

      await fetchStaffData();
    } catch {
      /*
        SERVER / INTERNET DOWN
        SAVE EVERYTHING LOCALLY
      */

      const next = [
        ...offlineRecords,
        {
          ...payload,
          offlineId: `OFF-${Date.now()}`,
          savedAt:
            new Date().toISOString(),
          synced: false,
        },
      ];

      setOfflineRecords(next);

      localStorage.setItem(
        storageKey("offline_records"),
        JSON.stringify(next)
      );

      /*
        Also update booking locally.
      */

      setBookings((current) =>
        current.map((booking) =>
          booking.id === activeBooking.id
            ? {
                ...booking,
                status:
                  "COMPLETED" as Booking["status"],
              }
            : booking
        )
      );

      setPendingStatusUpdates(
        (current) => {
          const updated = [
            ...current.filter(
              (item) =>
                item.bookingId !==
                activeBooking.id
            ),
            {
              bookingId:
                activeBooking.id,
              status: "COMPLETED",
            },
          ];

          localStorage.setItem(
            storageKey(
              "offline_status_updates"
            ),
            JSON.stringify(updated)
          );

          return updated;
        }
      );

      const token =
        activeBooking.bookingToken;

      setActiveBooking(null);

      setIsOfflineMode(true);

      setNotice(
        `No connection. Token ${token} and procurement record are safely stored in Offline Local Sheet.`
      );
    }
  };

  /* =======================================================
     ASSIGNED CENTRE
     ======================================================= */

  const assignedCentre =
    allCentres.find(
      (centre) =>
        centre.id === selectedCentreId
    ) || null;

  /* =======================================================
     SEARCH QUEUE
     ======================================================= */

  const filteredBookings = useMemo(() => {
    const query =
      queueSearch.trim().toLowerCase();

    if (!query) {
      return bookings;
    }

    return bookings.filter((booking) => {
      const text = `
        ${booking.bookingToken || ""}
        ${booking.farmerName || ""}
        ${booking.farmerPhone || ""}
        ${booking.cropType || ""}
      `.toLowerCase();

      return text.includes(query);
    });
  }, [bookings, queueSearch]);

  /* =======================================================
     QUEUE COUNTS
     ======================================================= */

  const counts = useMemo(
    () => ({
      waiting: bookings.filter(
        (booking) =>
          booking.status ===
            "CONFIRMED" ||
          booking.status ===
            "WAITING"
      ).length,

      called: bookings.filter(
        (booking) =>
          booking.status ===
          "IN_PROGRESS"
      ).length,

      completed: bookings.filter(
        (booking) =>
          booking.status ===
          "COMPLETED"
      ).length,
    }),
    [bookings]
  );

  /* =======================================================
     AMOUNT CALCULATION
     ======================================================= */

  const totalAmount = activeBooking
    ? Math.round(
        (Number(weightKg) / 100) *
          Number(ratePerQuintal)
      )
    : 0;

  /* =======================================================
     OFFLINE COUNT
     ======================================================= */

  const pendingOfflineCount =
    offlineRecords.length +
    pendingStatusUpdates.length;

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">

      {/* ===================================================
          STAFF HEADER
      =================================================== */}

      <section className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm flex flex-col lg:flex-row justify-between gap-5">

        <div className="flex items-center gap-4">

          <div className="w-14 h-14 rounded-2xl bg-amber-600 text-white flex items-center justify-center">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <div>

            <div className="flex flex-wrap items-center gap-2">

              <h1 className="text-2xl font-bold text-stone-900 font-serif">
                {t("staff.dashboard")}
              </h1>

              <span className="text-[11px] bg-amber-100 text-amber-900 px-2 py-1 rounded-full font-bold">
                Centre Operations
              </span>

            </div>

            <p className="text-xs text-stone-600 mt-1">
              Staff ID:{" "}
              <b>
                {user?.staffId ||
                  user?.id ||
                  "Staff"}
              </b>

              {" • "}

              Today:{" "}
              <b>{todayString()}</b>
            </p>

          </div>

        </div>

        <div
          className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-2 h-fit ${
            isOfflineMode
              ? "bg-amber-50 border-amber-300 text-amber-900"
              : "bg-emerald-50 border-emerald-200 text-emerald-800"
          }`}
        >

          {isOfflineMode ? (
            <WifiOff className="w-4 h-4" />
          ) : (
            <Wifi className="w-4 h-4" />
          )}

          {isOfflineMode
            ? "Offline Local Sheet Active"
            : "Online & Synced"}

        </div>

      </section>

      {/* ===================================================
          NOTICE
      =================================================== */}

      {notice && (
        <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-center gap-2">

          <CheckCircle2 className="w-4 h-4 shrink-0" />

          <span>{notice}</span>

          <button
            type="button"
            className="ml-auto font-bold"
            onClick={() =>
              setNotice(null)
            }
          >
            Dismiss
          </button>

        </div>
      )}

      {/* ===================================================
          WORKING CENTRE
      =================================================== */}

      <section className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm space-y-3">

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">

          <div>

            <h2 className="font-bold text-stone-900 font-serif">
              My Working Centre
            </h2>

            <p className="text-xs text-stone-500">
              Select the centre where you are currently handling today's procurement queue.
            </p>

          </div>

          <span className="text-[11px] px-2 py-1 rounded-full bg-stone-100 text-stone-600">
            {allCentres.length} centres in directory
          </span>

        </div>

        <CentrePicker
          centres={allCentres}
          value={selectedCentreId}
          onChange={changeCentre}
          placeholder="Search centre, district, state or PIN..."
          helper="Your selected working centre controls the queue shown below."
        />

        {assignedCentre && (
          <div className="text-xs text-stone-600 bg-stone-50 border border-stone-200 rounded-lg p-3">

            <b>
              {assignedCentre.name}
            </b>

            {" • "}

            {assignedCentre.district},{" "}
            {assignedCentre.state}

            {" • "}

            {assignedCentre.operatingHours}

          </div>
        )}

      </section>

      {/* ===================================================
          OFFLINE LOCAL SHEET
      =================================================== */}

      <section className="bg-white rounded-2xl border border-amber-200 shadow-sm overflow-hidden">

        <div className="p-5 bg-gradient-to-r from-amber-50 to-emerald-50 border-b border-amber-100">

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">

            <div>

              <h2 className="font-bold text-stone-900 font-serif flex items-center gap-2">

                <FileText className="w-5 h-5 text-amber-700" />

                Offline Local Sheet

                <span
                  className={`text-[10px] px-2 py-1 rounded-full ${
                    isOfflineMode
                      ? "bg-amber-200 text-amber-900"
                      : "bg-emerald-100 text-emerald-800"
                  }`}
                >
                  {isOfflineMode
                    ? "OFFLINE MODE"
                    : "READY"}
                </span>

              </h2>

              <p className="text-xs text-stone-600 mt-1">
                Continue token calls, status updates and weighments even when the server or internet is unavailable.
              </p>

            </div>

            <div className="flex items-center gap-2">

              <span className="px-2.5 py-1 rounded-full bg-white border border-amber-200 text-[11px] font-bold text-amber-900">
                {pendingOfflineCount} Pending
              </span>

              <button
                type="button"
                onClick={() =>
                  void syncOffline()
                }
                disabled={
                  syncing ||
                  !navigator.onLine ||
                  pendingOfflineCount ===
                    0
                }
                className="px-3 py-1.5 bg-emerald-800 text-white rounded-lg text-xs font-bold disabled:opacity-40 flex items-center gap-1"
              >

                <RefreshCw
                  className={`w-3.5 h-3.5 ${
                    syncing
                      ? "animate-spin"
                      : ""
                  }`}
                />

                {syncing
                  ? "Syncing..."
                  : "Sync Now"}

              </button>

            </div>

          </div>

        </div>

        <div className="p-5">

          {pendingOfflineCount === 0 ? (

            <div className="p-6 bg-stone-50 border border-dashed border-stone-300 rounded-xl text-center">

              <FileText className="w-7 h-7 mx-auto text-stone-400 mb-2" />

              <b className="text-sm text-stone-700">
                No pending offline work
              </b>

              <p className="text-xs text-stone-500 mt-1">
                When the connection drops, token updates and procurement records will automatically appear here.
              </p>

            </div>

          ) : (

            <div className="space-y-3">

              {/* OFFLINE PROCUREMENT RECORDS */}

              {offlineRecords.map(
                (record, index) => (

                  <div
                    key={`record-${index}`}
                    className="border border-amber-200 rounded-xl p-4 bg-amber-50/40"
                  >

                    <div className="flex flex-col lg:flex-row lg:items-center gap-3">

                      <div className="min-w-0 flex-1">

                        <div className="flex flex-wrap items-center gap-2">

                          <span className="text-[10px] font-black uppercase px-2 py-1 rounded-full bg-amber-100 text-amber-900">
                            Procurement
                          </span>

                          <b className="font-mono text-sm text-emerald-900">
                            {record.bookingToken ||
                              "Offline Record"}
                          </b>

                          <span className="text-[10px] text-stone-500">
                            Saved locally
                          </span>

                        </div>

                        <p className="text-xs font-semibold text-stone-800 mt-2">
                          {record.farmerName ||
                            "Farmer"}{" "}
                          •{" "}
                          {record.cropType ||
                            "Crop"}
                        </p>

                        <p className="text-[11px] text-stone-500">
                          Centre:{" "}
                          {record.centreName ||
                            "Selected centre"}{" "}
                          •{" "}
                          {record.weightKg ||
                            0}{" "}
                          Kg • Grade:{" "}
                          {record.grade ||
                            "Standard"}
                        </p>

                      </div>

                      <div className="flex gap-2">

                        <button
                          type="button"
                          onClick={() => {
                            const weight =
                              window.prompt(
                                "Net weight (Kg)",
                                String(
                                  record.weightKg ||
                                    0
                                )
                              );

                            if (
                              weight !== null &&
                              weight.trim() !== ""
                            ) {
                              updateOfflineRecord(
                                index,
                                {
                                  weightKg:
                                    Number(
                                      weight
                                    ),
                                }
                              );
                            }
                          }}
                          className="px-3 py-1.5 border border-stone-300 bg-white rounded-lg text-[11px] font-bold"
                        >
                          Edit Weight
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            removeOfflineRecord(
                              index
                            )
                          }
                          className="px-3 py-1.5 border border-red-200 bg-white text-red-700 rounded-lg text-[11px] font-bold"
                        >
                          Remove
                        </button>

                      </div>

                    </div>

                  </div>

                )
              )}

              {/* OFFLINE STATUS UPDATES */}

              {pendingStatusUpdates.map(
                (item) => {

                  const booking =
                    bookings.find(
                      (bookingItem) =>
                        bookingItem.id ===
                        item.bookingId
                    );

                  return (
                    <div
                      key={`status-${item.bookingId}`}
                      className="border border-blue-200 rounded-xl p-4 bg-blue-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >

                      <div>

                        <span className="text-[10px] font-black uppercase px-2 py-1 rounded-full bg-blue-100 text-blue-900">
                          Queue Update
                        </span>

                        <b className="font-mono text-sm ml-2">
                          {booking?.bookingToken ||
                            item.bookingId}
                        </b>

                        <p className="text-[11px] text-stone-500 mt-1">
                          Status saved locally as{" "}
                          <b>
                            {item.status}
                          </b>
                        </p>

                      </div>

                      <span className="text-[10px] font-bold text-blue-800">
                        Waiting for sync
                      </span>

                    </div>
                  );
                }
              )}

            </div>

          )}

        </div>

      </section>

      {/* ===================================================
          TOKEN QUEUE
      =================================================== */}

      <section className="space-y-4">

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">

          <div>

            <h2 className="text-xl font-bold text-stone-900 font-serif">
              Today's Token Queue
            </h2>

            <p className="text-xs text-stone-500">
              Call farmers and move every token through the procurement workflow.
            </p>

          </div>

          <div className="relative w-full md:w-80">

            <Search className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />

            <input
              value={queueSearch}
              onChange={(event) =>
                setQueueSearch(
                  event.target.value
                )
              }
              placeholder="Search token, farmer or crop..."
              className="w-full pl-9 pr-3 py-2 border border-stone-300 rounded-lg text-xs"
            />

          </div>

        </div>

        {/* QUEUE COUNTERS */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

          <div className="bg-white p-4 rounded-xl border border-stone-200">

            <span className="text-[11px] text-stone-500">
              Waiting
            </span>

            <b className="block text-2xl font-mono">
              {counts.waiting}
            </b>

          </div>

          <div className="bg-white p-4 rounded-xl border border-amber-200">

            <span className="text-[11px] text-stone-500">
              Called / Processing
            </span>

            <b className="block text-2xl font-mono text-amber-700">
              {counts.called}
            </b>

          </div>

          <div className="bg-white p-4 rounded-xl border border-emerald-200">

            <span className="text-[11px] text-stone-500">
              Completed
            </span>

            <b className="block text-2xl font-mono text-emerald-700">
              {counts.completed}
            </b>

          </div>

        </div>

        {/* QUEUE LIST */}

        {loading ? (

          <div className="bg-white p-8 rounded-xl border border-stone-200 text-center text-sm text-stone-500">
            Loading today's queue...
          </div>

        ) : filteredBookings.length === 0 ? (

          <div className="bg-white p-8 rounded-xl border border-stone-200 text-center">

            <p className="text-sm font-semibold text-stone-700">
              No bookings found.
            </p>

            <p className="text-xs text-stone-500 mt-1">
              Bookings for the selected centre and date will appear here.
            </p>

          </div>

        ) : (

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

            {filteredBookings.map(
              (booking) => (

                <div
                  key={booking.id}
                  className={`bg-white p-5 rounded-2xl border shadow-sm ${
                    booking.status ===
                    "IN_PROGRESS"
                      ? "border-amber-400 ring-1 ring-amber-300"
                      : booking.status ===
                        "COMPLETED"
                      ? "border-stone-200 opacity-75"
                      : "border-stone-200"
                  }`}
                >

                  <div className="flex justify-between gap-3">

                    <div>

                      <span className="text-[10px] uppercase tracking-wider text-stone-500">
                        Token
                      </span>

                      <div className="text-2xl font-black font-mono text-emerald-900">
                        {booking.bookingToken}
                      </div>

                    </div>

                    <span className="px-2.5 py-1 h-fit rounded-full text-[10px] font-bold bg-stone-100 text-stone-700">
                      {booking.status}
                    </span>

                  </div>

                  <div className="mt-3 text-xs space-y-1">

                    <p className="font-bold text-stone-900">
                      {booking.farmerName}{" "}
                      •{" "}
                      {booking.farmerPhone}
                    </p>

                    <p className="text-stone-500">
                      {booking.cropType}{" "}
                      •{" "}
                      {booking.estimatedWeightQuintal}{" "}
                      Qtl{" "}
                      •{" "}
                      {booking.timeSlot}
                    </p>

                    <p className="text-stone-500">
                      Queue position:{" "}
                      <b className="text-stone-800">
                        #
                        {
                          booking.queuePosition
                        }
                      </b>
                    </p>

                  </div>

                  {/* STAFF ACTIONS */}

                  <div className="mt-4 pt-3 border-t border-stone-100 flex flex-wrap gap-2">

                    {/* CONFIRMED -> WAITING */}

                    {booking.status ===
                      "CONFIRMED" && (

                      <button
                        type="button"
                        onClick={() =>
                          void updateStatus(
                            booking,
                            "WAITING"
                          )
                        }
                        className="px-3 py-2 bg-stone-100 hover:bg-stone-200 rounded-lg text-xs font-bold flex items-center gap-1"
                      >

                        <Clock className="w-3.5 h-3.5" />

                        Mark Waiting

                      </button>

                    )}

                    {/* CALL FARMER */}

                    {(booking.status ===
                      "CONFIRMED" ||
                      booking.status ===
                        "WAITING") && (

                      <button
                        type="button"
                        onClick={() =>
                          void updateStatus(
                            booking,
                            "IN_PROGRESS"
                          )
                        }
                        className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-lg text-xs font-bold flex items-center gap-1"
                      >

                        <PhoneCall className="w-3.5 h-3.5" />

                        Call Farmer

                      </button>

                    )}

                    {/* COMPLETE */}

                    {booking.status ===
                      "IN_PROGRESS" && (

                      <button
                        type="button"
                        onClick={() => {
                          setActiveBooking(
                            booking
                          );

                          setWeightKg(
                            Math.max(
                              1,
                              Number(
                                booking.estimatedWeightQuintal ||
                                  1
                              ) * 100
                            )
                          );

                          setGrade(
                            "Grade A (FAQ)"
                          );

                          setRatePerQuintal(
                            2275
                          );

                          setNotes("");
                        }}
                        className="px-3 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold flex items-center gap-1"
                      >

                        <ClipboardCheck className="w-3.5 h-3.5" />

                        Record Weighment & Complete

                      </button>

                    )}

                    {/* COMPLETED */}

                    {booking.status ===
                      "COMPLETED" && (

                      <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">

                        <CheckCircle2 className="w-4 h-4" />

                        Procurement completed

                      </span>

                    )}

                  </div>

                </div>

              )
            )}

          </div>

        )}

      </section>

      {/* ===================================================
          PROCUREMENT MODAL
      =================================================== */}

      {activeBooking && (

        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-sm flex items-center justify-center p-4">

          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">

            {/* MODAL HEADER */}

            <div className="bg-emerald-900 text-white p-5 flex justify-between">

              <div>

                <h3 className="font-bold font-serif">
                  Electronic Weighment & Completion
                </h3>

                <p className="text-xs text-emerald-200 mt-1">
                  Token{" "}
                  {
                    activeBooking.bookingToken
                  }{" "}
                  •{" "}
                  {
                    activeBooking.farmerName
                  }
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  setActiveBooking(null)
                }
                className="text-white text-lg"
              >
                ✕
              </button>

            </div>

            {/* FORM */}

            <form
              onSubmit={saveProcurement}
              className="p-5 space-y-4 text-xs"
            >

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                <label className="font-bold">

                  Net Weight (Kg)

                  <input
                    required
                    min="1"
                    type="number"
                    value={weightKg}
                    onChange={(event) =>
                      setWeightKg(
                        Number(
                          event.target.value
                        )
                      )
                    }
                    className="mt-1 w-full p-2 border rounded-lg font-mono"
                  />

                </label>

                <label className="font-bold">

                  Rate / Quintal (₹)

                  <input
                    required
                    min="1"
                    type="number"
                    value={ratePerQuintal}
                    onChange={(event) =>
                      setRatePerQuintal(
                        Number(
                          event.target.value
                        )
                      )
                    }
                    className="mt-1 w-full p-2 border rounded-lg font-mono"
                  />

                </label>

              </div>

              <label className="font-bold block">

                Quality Grade

                <select
                  value={grade}
                  onChange={(event) =>
                    setGrade(
                      event.target.value
                    )
                  }
                  className="mt-1 w-full p-2 border rounded-lg"
                >

                  <option>
                    Grade A (FAQ)
                  </option>

                  <option>
                    Grade B
                  </option>

                  <option>
                    Standard
                  </option>

                </select>

              </label>

              <label className="font-bold block">

                Remarks

                <input
                  value={notes}
                  onChange={(event) =>
                    setNotes(
                      event.target.value
                    )
                  }
                  placeholder="Moisture, quality or receipt note"
                  className="mt-1 w-full p-2 border rounded-lg"
                />

              </label>

              {/* AMOUNT */}

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex justify-between font-bold">

                <span>
                  DBT Amount
                </span>

                <span>
                  ₹
                  {totalAmount.toLocaleString(
                    "en-IN"
                  )}
                </span>

              </div>

              {/* BUTTONS */}

              <div className="flex justify-end gap-2">

                <button
                  type="button"
                  onClick={() =>
                    setActiveBooking(null)
                  }
                  className="px-4 py-2 border rounded-lg font-semibold"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-800 text-white rounded-lg font-bold"
                >

                  <Scale className="inline w-4 h-4 mr-1" />

                  Issue Receipt & Complete

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
};