import { useQuery } from "@tanstack/react-query";
import { listOrders } from "../services/apiServices";

export const useListOrders = (
  enabled = true,
  groupName?: string,
  branchId?: string,
) =>
  useQuery({
    queryKey: ["orders", groupName], // invalidating ["orders"] matches this prefix
    queryFn: () => listOrders({ groupName, branchId }),
    enabled,
    refetchInterval: 30000, // backstop if the stream drops
    refetchOnWindowFocus: true,
  });
