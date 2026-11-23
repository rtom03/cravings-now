import { useState } from "react";
import { Package, PencilSparkles, Plus } from "lucide-react";
import { useListOrders } from "../../api/orderQuery";
import { usePagination } from "../../hooks/usePagination";
import OrdersTable from "./OrdersTable";
import {
  DataTableColumn,
  HistoryCell,
} from "../../components/shared/DataTable";
import { Order } from "../../types/order";
import { uniqueOptions } from "../../components/shared/TableHeaderCell";
import { useBrandStore } from "../../store/brandStore";
import MiniModal, { ModalTab } from "../../components/shared/MiniModal";
import OrderActionsTab from "./OrderActionTab";
import OrderInvoiceTab from "./OrderInvoiceTab";
import { PageToolbar } from "../../components/shared/PageToolBar";
import { useUserStore } from "../../store/userStore";

const Orders = () => {
  const SUB_TABS = ["All", "Pending", "Complete", "Voided"] as const;

  const TABS: ModalTab[] = [
    { key: "Actions", label: "Actions" },
    { key: "Invoice", label: "Invoice" },
    { key: "Payments", label: "Payments" },
    { key: "Assign Driver", label: "Assign Driver" },
    { key: "Notes", label: "Notes" },
  ];
  type SubTab = (typeof SUB_TABS)[number];
  const [subTab, setSubTab] = useState<SubTab>("All");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState("Actions");
  const [selectedOrder, setSelectedOrder] = useState<Order>();

  const { user } = useUserStore();
  const userExist = user?.user.name !== null;
  const { selectedBrand } = useBrandStore();
  console.log(selectedBrand);
  const { data, isPending } = useListOrders(
    userExist,
    selectedBrand.name!,
    user?.user.branchId!,
  );

  // console.log(data);

  const { page, setPage, pageSize, setPageSize, totalPages, paginated } =
    subTab === "Pending"
      ? usePagination(data?.items ?? [], 10)
      : usePagination(data?.items ?? [], 10);

  const onOrderClick = (row: Order) => {
    if (!row.id) return;
    setSelectedOrder(row);
    // if (products) {
    //   // console.log(products.filter((prd) => prd.id === id));
    // }
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
  };

  const onConfirm = () => {};
  const orderColumns: DataTableColumn<Order>[] = [
    {
      key: "Branch",
      label: "Branch",
      width: "110px",
      align: "center",
      sortable: false,
      filterable: true,
      filterAccessor: (row) => row.branch?.name ?? "",
      filterOptions: (rows) => uniqueOptions(rows.map((r) => r?.branch?.name!)),
      render: (row) => (
        <div className="flex justify-center" onClick={() => onOrderClick(row)}>
          <span>{row.branch?.name}</span>
        </div>
      ),
    },
    {
      key: "type",
      label: "Type",
      width: "90px",
      align: "left",
      sortable: false,
      filterable: false,
      skeletonVariant: "text",
      render: (row) => (
        <span
          className="text-slate-300 cursor-pointer"
          onClick={() => onOrderClick(row)}
        >
          {row.type}
        </span>
      ),
    },
    {
      key: "id",
      label: "ID",
      width: "190px",
      sortable: false,
      skeletonVariant: "text",
      render: (row) => (
        <span className="font-medium text-slate-100 cursor-pointer">
          {row.id}
        </span>
      ),
    },
    {
      key: "total",
      label: "Total Price",
      width: "120px",
      align: "center",
      sortable: false,
      skeletonVariant: "text",
      render: (row) => (
        <div className="flex justify-center" onClick={() => onOrderClick(row)}>
          <span>{row.totalPrice}</span>
        </div>
      ),
    },
    {
      key: "tracking-code",
      label: "Type",
      width: "110px",
      align: "center",
      sortable: false,

      filterable: false,
      // Every product currently renders as "Produced" — same reasoning as
      // Catalog's Type column: filter is wired for when this becomes a
      // real distinguishing field, not decorative-only.
      skeletonVariant: "text",
      render: () => (
        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-slate-300">
          xxxxxx
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      width: "100px",
      align: "center",
      sortable: false,

      // No live inventory-level field on Product yet — rendered as a dash
      // rather than fabricating a number, same convention as Catalog's
      // Stock level column.
      skeletonVariant: "text",
      render: (row) => <span>{row.status}</span>,
    },
    {
      key: "area",
      label: "Area",
      width: "100px",
      align: "center",
      sortable: false,

      // No live inventory-level field on Product yet — rendered as a dash
      // rather than fabricating a number, same convention as Catalog's
      // Stock level column.
      skeletonVariant: "text",
      render: (row) => <span>xxxxxx</span>,
    },
    {
      key: "state",
      label: "State",
      width: "100px",
      align: "center",
      sortable: false,

      // No live inventory-level field on Product yet — rendered as a dash
      // rather than fabricating a number, same convention as Catalog's
      // Stock level column.
      skeletonVariant: "text",
      render: (row) => <span>{row.status}</span>,
    },
    {
      key: "customer",
      label: "Customer",
      width: "100px",
      align: "center",
      sortable: false,

      // No live inventory-level field on Product yet — rendered as a dash
      // rather than fabricating a number, same convention as Catalog's
      // Stock level column.
      skeletonVariant: "text",
      render: (row) => <span>{row.customer?.id}</span>,
    },
    {
      key: "placed",
      label: "Placed",
      width: "100px",
      align: "center",
      sortable: false,

      // No live inventory-level field on Product yet — rendered as a dash
      // rather than fabricating a number, same convention as Catalog's
      // Stock level column.
      skeletonVariant: "text",
      render: (row) => <span>{row.createdAt}</span>,
    },
    {
      key: "payment-type",
      label: "Payment Type",
      width: "100px",
      align: "center",
      sortable: false,

      // No live inventory-level field on Product yet — rendered as a dash
      // rather than fabricating a number, same convention as Catalog's
      // Stock level column.
      skeletonVariant: "text",
      render: (row) => <span>xxxx</span>,
    },
    {
      key: "payment-reference",
      label: "Payment Reference",
      width: "100px",
      align: "center",
      sortable: false,

      // No live inventory-level field on Product yet — rendered as a dash
      // rather than fabricating a number, same convention as Catalog's
      // Stock level column.
      skeletonVariant: "text",
      render: (row) => <span>{row.reference}</span>,
    },
    {
      key: "foodics",
      label: "Received On Foodics",
      width: "100px",
      align: "center",
      sortable: false,

      // No live inventory-level field on Product yet — rendered as a dash
      // rather than fabricating a number, same convention as Catalog's
      // Stock level column.
      skeletonVariant: "text",
      render: (row) => <span>{row.status}</span>,
    },
    {
      key: "history",
      label: "History",
      width: "120px",
      align: "center",
      sortable: false,

      // No sort-order field on Product yet — same dash convention as
      // Inventory above, not wired to a real column until one exists.
      skeletonVariant: "dash",
      render: () => <HistoryCell />,
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <PageToolbar
        title="Online"
        icon={Package}
        tabs={SUB_TABS.map((key) => ({ key, label: key }))}
        activeTab={subTab}
        onTabChange={setSubTab}
        searchValue={query}
        onSearchChange={setQuery}
        onFilterClick={() => {
          /* wire to a real advanced-filter panel when one exists */
        }}
        onActionsClick={() => {
          /* wire to a real actions menu when one exists */
        }}
        onPrevPage={() => setPage(Math.max(1, page - 1))}
        onNextPage={() => setPage(Math.min(totalPages, page + 1))}
        canGoPrev={page > 1}
        canGoNext={page < totalPages}
      />
      {subTab === "All" ? (
        <div>
          <OrdersTable
            columns={orderColumns}
            data={paginated as Order[]}
            rowKey={(row) => row.id}
            selectable
            minWidth="1200px"
            isLoading={isPending}
            emptyMessage={
              query ? `No products match "${query}".` : "No products found."
            }
          />
          {selectedOrder?.id && (
            <MiniModal
              open={open}
              onClose={onClose}
              title="Append Order"
              tabs={TABS}
              onSave={onConfirm}
              saveLabel="Save"
              closeLabel="Cancel"
              maxWidth="max-w-[920px]"
              activeTab={activeTab}
              onTabChange={setActiveTab}
            >
              {activeTab === "Actions" && (
                <OrderActionsTab
                  orderId="ORD-001"
                  initialOrderStatus="Complete"
                  initialPaymentStatus="Incomplete"
                  onOrderStatusChange={async (s) => console.log("....")}
                  onPaymentStatusChange={async (s) => console.log("....")}
                  onCancelOrder={() => console.log("....")}
                />
              )}
              {activeTab === "Invoice" && (
                <OrderInvoiceTab
                  data={selectedOrder!}
                  onEditDeliveryTime={() => console.log("....")}
                  onEditBranch={() => console.log("....")}
                  onEditDeliveryAddress={() => console.log("....")}
                  onEditCustomer={() => console.log("....")}
                />
              )}
            </MiniModal>
          )}
        </div>
      ) : (
        <></>
      )}
    </div>
  );
};

export default Orders;
