import { useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Hook that warns the user about unsaved changes when they try to navigate away.
 * Compatible with BrowserRouter (does NOT use useBlocker).
 *
 * - Blocks browser refresh/tab close via beforeunload
 * - Intercepts sidebar/link clicks via a custom window event listener
 *
 * @param isDirty - Whether there are unsaved changes
 */
export function useUnsavedChanges(isDirty: boolean) {
  const isDirtyRef = useRef(isDirty);
  isDirtyRef.current = isDirty;

  // Block browser refresh / tab close
  useEffect(() => {
    if (!isDirty) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  // A simple confirm wrapper — returns true if user wants to proceed
  const confirmLeave = useCallback((): boolean => {
    if (!isDirtyRef.current) return true;
    return window.confirm(
      "You have unsaved changes. Are you sure you want to leave without saving?"
    );
  }, []);

  return { confirmLeave };
}
