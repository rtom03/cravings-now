import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { API } from "../lib/config";

export type PaidOrderEvent = {
  id: string;
  orderNumber?: number;
  branchId: string;
};

export const useOrderStream = (
  onPaidOrder: (o: PaidOrderEvent) => void,
  enabled = true,
) => {
  const qc = useQueryClient();
  const cb = useRef(onPaidOrder);
  cb.current = onPaidOrder; // always call the latest callback without reconnecting

  useEffect(() => {
    if (!enabled) return;

    const es = new EventSource(`${API}/orders/stream`, {
      withCredentials: true,
    });

    es.addEventListener("order.paid", (e) => {
      qc.invalidateQueries({ queryKey: ["orders"] });
      cb.current(JSON.parse((e as MessageEvent).data));
    });

    // EventSource reconnects on its own; refetch to catch anything missed
    es.onopen = () => qc.invalidateQueries({ queryKey: ["orders"] });

    return () => es.close();
  }, [enabled, qc]);
};
