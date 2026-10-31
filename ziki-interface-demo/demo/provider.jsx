"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { ThemePreference } from "@/components/theme-toggle";
import { ToastProvider } from "@/components/ui/toast";
import { seedStore, updateStore, VIEWER } from "./store.mjs";

const Context = createContext(null);
export function DemoProvider({ children }) {
  const [workspace, setWorkspace] = useState("zendor");
  const [stores, setStores] = useState(() => ({ zendor: seedStore(), labs: seedStore("labs") }));
  const [role, setRole] = useState("admin");
  const [profile, setProfile] = useState({ name: VIEWER, email: "demo@example.test", wallet: "", notify: true });
  const [notice, setNotice] = useState("");
  const [failure, setFailure] = useState(false);
  function dispatch(action) {
    if (failure) return { ok: false, error: "Simulated failure. Turn off the failure switch and retry." };
    setStores((previous) => ({ ...previous, [workspace]: updateStore(previous[workspace], { ...action, role: role === "user" ? "member" : "admin", at: new Date().toISOString() }) }));
    return { ok: true };
  }
  useEffect(() => {
    const selectWorkspace = (event) => { if (["zendor", "labs"].includes(event.detail)) { setWorkspace(event.detail); setNotice(""); } };
    const vote = (event) => { const result = dispatch({ type: "vote", id: event.detail.bugId }); event.detail.resolve(result.ok ? {} : { error: result.error }); };
    const notifications = (event) => event.detail(stores[workspace].notifications.map((row) => ({ id: row.id, title: row.title, createdAt: new Date("2026-10-27T13:00:00Z"), readAt: row.read ? new Date("2026-10-27T13:30:00Z") : null })));
    window.addEventListener("ziki-demo:workspace", selectWorkspace);
    window.addEventListener("ziki-demo:vote", vote);
    window.addEventListener("ziki-demo:notifications", notifications);
    return () => { window.removeEventListener("ziki-demo:workspace", selectWorkspace); window.removeEventListener("ziki-demo:vote", vote); window.removeEventListener("ziki-demo:notifications", notifications); };
  });
  function reset() { setStores({ zendor: seedStore(), labs: seedStore("labs") }); setWorkspace("zendor"); setRole("admin"); setProfile({ name: VIEWER, email: "demo@example.test", wallet: "", notify: true }); setFailure(false); setNotice("All demo data has been restored."); }
  return <Context.Provider value={{ state: stores[workspace], workspace, setWorkspace, role, setRole, profile, setProfile, notice, setNotice, dispatch, reset, failure, setFailure }}><ThemePreference theme="system"><ToastProvider>{children}</ToastProvider></ThemePreference></Context.Provider>;
}
export const useDemo = () => useContext(Context);
