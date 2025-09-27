import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";
import { ITransaction } from "@/types";
import { IUser } from "@/types";
import { apiRequest } from "@/utils/api";

interface DashboardData {
  user: IUser | null;
  transactions: ITransaction[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useDashboardData(): DashboardData {
  const { user: authUser } = useAuth();
  const [user, setUser] = useState<IUser | null>(null);
  const [transactions, setTransactions] = useState<ITransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setErrorMsg] = useState<string | null>(null);

  const fetchUserData = async () => {
    try {
      const data = await apiRequest<{
        success: boolean;
        user: IUser;
        error?: string;
      }>("get", "/api/v1/user/personal-info");
      if (data.success) {
        setUser(data.data.user);
      } else {
        // Only set error if not an auth error
        if (
          data.error &&
          [
            "Unauthorized",
            "Authentication required",
            "Not authenticated",
          ].includes(data.error)
        ) {
          setUser(null);
        } else {
          setErrorMsg(data.error || "Failed to fetch user data");
        }
      }
    } catch (err: unknown) {
      const msg = getErrorMessage(err) || "Failed to fetch user data";
      // Only set error if not an auth error
      if (
        msg &&
        [
          "Unauthorized",
          "Authentication required",
          "Not authenticated",
        ].includes(msg)
      ) {
        setUser(null);
      } else {
        setErrorMsg(msg);
      }
    }
  };

  const fetchTransactionHistory = async () => {
    try {
      const data = await apiRequest<{
        success: boolean;
        transactions: ITransaction[];
        error?: string;
      }>("get", "/api/v1/user/transac-history?limit=5");
      if (data.success) {
        setTransactions(data.data.transactions);
      } else {
        setErrorMsg(data.error || "Failed to fetch transaction history.");
      }
    } catch (err: unknown) {
      // Don't set error for transactions as it's not critical, but show global error
      setErrorMsg(
        getErrorMessage(err) || "Failed to fetch transaction history."
      );
    }
  };

  useEffect(() => {
    if (authUser) {
      const fetchData = async () => {
        setLoading(true);
        setErrorMsg(null);
        await Promise.all([fetchUserData(), fetchTransactionHistory()]);
        setLoading(false);
      };
      fetchData();
    }
  }, [authUser]);

  const refresh = () => {
    setLoading(true);
    setErrorMsg(null);
    Promise.all([fetchUserData(), fetchTransactionHistory()]).then(() => {
      setLoading(false);
    });
  };

  return {
    user,
    transactions,
    loading,
    error,
    refresh,
  };
}

// Helper to extract error message from unknown
function getErrorMessage(err: unknown): string {
  if (typeof err === "string") return err;
  if (
    err &&
    typeof err === "object" &&
    "message" in err &&
    typeof (err as Record<string, unknown>).message === "string"
  ) {
    return (err as Record<string, unknown>).message as string;
  }
  return "An unknown error occurred.";
}
